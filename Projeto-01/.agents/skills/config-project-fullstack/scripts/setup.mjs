#!/usr/bin/env node
/**
 * config-project-fullstack — setup determinístico de monorepo Turborepo
 * (frontend Next.js :3000 + backend NestJS :4000 com @nestjs/config).
 *
 * Uso:
 *   node setup.mjs [--name projeto-exemplo] [--namespace @escopo] [--cwd <dir>] [--skip-verify]
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import process from 'node:process';

// ---------------------------------------------------------------------------
// Constantes (conteúdo fixo dos arquivos gerados)
// ---------------------------------------------------------------------------
const FRONTEND_PORT = 3000;
const BACKEND_PORT = 4000;
const ENV_CHECK_PORT = 4100;
const IS_WIN = process.platform === 'win32';
const TMP_DIR = 'tmp-config-project-fullstack';
/** Se qualquer um destes existir na pasta atual, o projeto já foi criado: não roda de novo. */
const PROJECT_MARKERS = ['package.json', 'turbo.json', 'apps', 'packages', 'package-lock.json', 'node_modules'];

/** Converte o nome da pasta em nome de pacote npm válido (ex.: "Projeto-01" -> "projeto-01"). */
function toPackageName(dir) {
  const n = dir.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^[._-]+|[-]+$/g, '');
  return n || 'projeto';
}

const APP_MODULE_TS = (ext) => `import { Module } from '@nestjs/common';
import { AppController } from './app.controller${ext}';
import { AppService } from './app.service${ext}';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
`;

const MAIN_TS = (ext) => `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module${ext}';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(process.env.PORT ?? ${BACKEND_PORT});
}

bootstrap();
`;

const FRONTEND_ENV = `NEXT_PUBLIC_API_URL=http://localhost:${BACKEND_PORT}\n`;
const BACKEND_ENV = `PORT=${BACKEND_PORT}\n`;

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------
let stepNo = 0;
function step(title) {
  stepNo += 1;
  console.log(`\n=== [${String(stepNo).padStart(2, '0')}] ${title} ===`);
}
function info(msg) {
  console.log(`  -> ${msg}`);
}
function fail(msg) {
  console.error(`\n[ERRO] ${msg}`);
  process.exit(1);
}

/** Ambiente dos processos filhos: sem PORT herdado, sem prompts de telemetria. */
function childEnv(extra = {}) {
  const env = { ...process.env, NEXT_TELEMETRY_DISABLED: '1', TURBO_TELEMETRY_DISABLED: '1', ...extra };
  delete env.PORT;
  return env;
}

/** Executa um comando e aborta se falhar. stdin ignorado para nunca travar em prompt. */
function run(command, cwd) {
  info(`$ ${command}   (em ${cwd})`);
  const r = spawnSync(command, {
    cwd,
    shell: true,
    stdio: ['ignore', 'inherit', 'inherit'],
    env: childEnv(),
  });
  if (r.error) fail(`Falha ao executar "${command}": ${r.error.message}`);
  if (r.status !== 0) fail(`Comando "${command}" terminou com código ${r.status}.`);
}

function commandWorks(command) {
  const r = spawnSync(command, { shell: true, stdio: 'ignore', env: childEnv() });
  return r.status === 0;
}

function mustExist(p, label) {
  if (!fs.existsSync(p)) fail(`${label} não encontrado: ${p}`);
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function writeJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
}
function writeFile(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, 'utf8');
  info(`escrito ${p}`);
}

function parseArgs(argv) {
  const opts = { namespace: null, verify: true, verifyOnly: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined || v.startsWith('--')) fail(`Valor ausente para ${a}`);
      return v;
    };
    if (a === '--namespace') opts.namespace = next();
    else if (a === '--skip-verify') opts.verify = false;
    else if (a === '--verify-only') opts.verifyOnly = true;
    else if (a === '--help' || a === '-h') {
      console.log('Uso (na pasta do projeto): node setup.mjs [--namespace @escopo] [--skip-verify]');
      process.exit(0);
    } else fail(`Argumento desconhecido: ${a}`);
  }
  return opts;
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once('error', () => resolve(false));
    srv.once('listening', () => srv.close(() => resolve(true)));
    srv.listen(port);
  });
}

async function waitForHttp(port, timeoutMs, expectText, child) {
  const deadline = Date.now() + timeoutMs;
  const hosts = ['127.0.0.1', 'localhost', '[::1]'];
  while (Date.now() < deadline) {
    if (child && child.exitCode !== null) return null; // processo encerrou: não adianta esperar
    for (const host of hosts) {
      try {
        const res = await fetch(`http://${host}:${port}/`, { signal: AbortSignal.timeout(5000) });
        const body = await res.text();
        if (!expectText || body.includes(expectText)) return { status: res.status, body };
      } catch {
        /* ainda subindo */
      }
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  return null;
}

function startBackground(command, cwd) {
  info(`$ ${command}   (em ${cwd}, em background)`);
  return spawn(command, {
    cwd,
    shell: true,
    detached: !IS_WIN,
    stdio: ['ignore', 'inherit', 'inherit'],
    env: childEnv(),
  });
}

function killTree(child) {
  if (!child || child.exitCode !== null) return;
  try {
    if (IS_WIN) spawnSync(`taskkill /pid ${child.pid} /T /F`, { shell: true, stdio: 'ignore' });
    else process.kill(-child.pid, 'SIGTERM');
  } catch {
    /* já encerrado */
  }
}

async function waitPortReleased(port, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isPortFree(port)) return true;
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

/** Lista todos os package.json de workspaces (apps/* e packages/*). */
function listWorkspacePackages(root) {
  const result = [];
  for (const group of ['apps', 'packages']) {
    const dir = path.join(root, group);
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const pkg = path.join(dir, entry.name, 'package.json');
      if (fs.existsSync(pkg)) result.push({ dir: path.join(dir, entry.name), pkg });
    }
  }
  return result.sort((a, b) => a.dir.localeCompare(b.dir));
}

const TEXT_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.md', '.css', '.scss']);
const SKIP_DIRS = new Set(['node_modules', '.git', '.next', '.turbo', 'dist', 'build', 'coverage']);

function walkTextFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkTextFiles(full, out);
    else if (TEXT_EXT.has(path.extname(entry.name)) && entry.name !== 'package-lock.json') out.push(full);
  }
  return out;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Verifica: backend lê o .env, frontend responde em 3000 e backend em 4000. */
async function verifyProject(root) {
  const backend = path.join(root, 'apps', 'backend');

  step('Verificar leitura de variáveis de ambiente pelo backend');
  for (const p of [FRONTEND_PORT, BACKEND_PORT, ENV_CHECK_PORT]) {
    if (!(await isPortFree(p))) fail(`Porta ${p} já está em uso. Libere-a e rode novamente (ou use --skip-verify).`);
  }
  const envPath = path.join(backend, '.env');
  const originalEnv = fs.readFileSync(envPath, 'utf8');
  fs.writeFileSync(envPath, `PORT=${ENV_CHECK_PORT}\n`, 'utf8');
  let envChild;
  let envOk;
  try {
    envChild = startBackground('npm run start', backend);
    envOk = await waitForHttp(ENV_CHECK_PORT, 180000, 'Hello World', envChild);
  } finally {
    killTree(envChild);
    fs.writeFileSync(envPath, originalEnv, 'utf8');
  }
  if (!envOk) fail(`Backend não respondeu na porta ${ENV_CHECK_PORT} lida do .env.`);
  info(`backend leu PORT=${ENV_CHECK_PORT} do .env ✔ (.env original restaurado)`);
  await waitPortReleased(ENV_CHECK_PORT);

  step('Verificar frontend :3000 e backend :4000 via "npm run dev"');
  const devChild = startBackground('npm run dev', root);
  let fe;
  let be;
  try {
    be = await waitForHttp(BACKEND_PORT, 240000, 'Hello World', devChild);
    fe = await waitForHttp(FRONTEND_PORT, 240000, null, devChild);
  } finally {
    killTree(devChild);
  }
  if (!be) fail(`Backend não respondeu na porta ${BACKEND_PORT}.`);
  if (!fe) fail(`Frontend não respondeu na porta ${FRONTEND_PORT}.`);
  info(`backend  http://localhost:${BACKEND_PORT} -> HTTP ${be.status} ✔`);
  info(`frontend http://localhost:${FRONTEND_PORT} -> HTTP ${fe.status} ✔`);
  await waitPortReleased(BACKEND_PORT);
  await waitPortReleased(FRONTEND_PORT);
}

// ---------------------------------------------------------------------------
// Execução
// ---------------------------------------------------------------------------
async function main() {
  const opts = parseArgs(process.argv.slice(2));

  // ---- 00. Verificações de segurança ------------------------------------
  step('Verificações de segurança');
  const [major] = process.versions.node.split('.').map(Number);
  if (major < 20) fail(`Node ${process.versions.node} detectado. É necessário Node >= 20.`);
  info(`Node ${process.versions.node} OK`);
  if (!commandWorks('npm --version')) fail('npm não encontrado no PATH.');
  if (!commandWorks('npx --version')) fail('npx não encontrado no PATH.');
  info('npm/npx OK');

  if (opts.verifyOnly) {
    if (!fs.existsSync(path.join(process.cwd(), 'apps', 'backend', '.env'))) {
      fail('--verify-only exige um projeto já criado na pasta atual.');
    }
    await verifyProject(process.cwd());
    console.log('\n[OK] Verificação concluída.');
    return;
  }

  let scope = null;
  if (opts.namespace) {
    scope = opts.namespace.startsWith('@') ? opts.namespace.slice(1) : opts.namespace;
    scope = scope.replace(/\/+$/, '');
    if (!/^[a-z0-9][a-z0-9._-]*$/.test(scope)) fail(`Namespace inválido "${opts.namespace}". Ex.: @minhaempresa`);
    info(`namespace solicitado: @${scope}`);
  }

  // O projeto é SEMPRE criado na pasta atual (a pasta monitorada pela ferramenta de IA).
  const root = process.cwd();
  try {
    fs.accessSync(root, fs.constants.W_OK);
  } catch {
    fail(`Sem permissão de escrita em ${root}`);
  }
  const existing = PROJECT_MARKERS.filter((m) => fs.existsSync(path.join(root, m)));
  if (existing.length) {
    fail(`O projeto já foi criado nesta pasta (encontrado: ${existing.join(', ')}). Nada foi alterado.`);
  }
  const tmp = path.join(root, TMP_DIR);
  if (fs.existsSync(tmp)) fail(`Pasta temporária de uma execução anterior encontrada: ${tmp}. Remova-a e rode novamente.`);
  const projectName = toPackageName(path.basename(root));
  info(`projeto será criado na pasta atual: ${root} (nome: ${projectName})`);
  const preserved = fs.readdirSync(root);
  if (preserved.length) info(`itens existentes que serão preservados: ${preserved.join(', ')}`);

  const apps = path.join(root, 'apps');
  const frontend = path.join(apps, 'frontend');
  const backend = path.join(apps, 'backend');

  // ---- 01. create-turbo --------------------------------------------------
  // create-turbo não aceita pasta não vazia; gera numa subpasta temporária (sem instalar)
  // e os arquivos são movidos para a pasta atual sem tocar nos itens já existentes.
  step('Criar monorepo Turborepo na pasta atual');
  const turbo = spawnSync(`npx --yes create-turbo@latest ${TMP_DIR} -m npm --skip-install`, {
    cwd: root,
    shell: true,
    stdio: ['ignore', 'inherit', 'inherit'],
    env: childEnv(),
  });
  if (turbo.status !== 0 || !fs.existsSync(path.join(tmp, 'turbo.json'))) {
    fs.rmSync(tmp, { recursive: true, force: true });
    fail('create-turbo falhou (pasta temporária removida, nada foi alterado).');
  }
  // node_modules/lockfile gerados na pasta temporária teriam links absolutos quebrados após mover
  fs.rmSync(path.join(tmp, 'node_modules'), { recursive: true, force: true });
  fs.rmSync(path.join(tmp, 'package-lock.json'), { force: true });
  const insideGit = spawnSync('git rev-parse --is-inside-work-tree', { cwd: root, shell: true, stdio: 'ignore' }).status === 0;
  if (insideGit) fs.rmSync(path.join(tmp, '.git'), { recursive: true, force: true });
  const conflicts = fs.readdirSync(tmp).filter((e) => fs.existsSync(path.join(root, e)));
  if (conflicts.length) {
    fs.rmSync(tmp, { recursive: true, force: true });
    fail(`Conflito: a pasta atual já contém ${conflicts.join(', ')}, que o template também cria. Nada foi alterado.`);
  }
  for (const entry of fs.readdirSync(tmp)) {
    fs.renameSync(path.join(tmp, entry), path.join(root, entry));
    info(`movido ${entry}`);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  const rootPkgPath = path.join(root, 'package.json');
  mustExist(rootPkgPath, 'package.json raiz');
  mustExist(path.join(root, 'turbo.json'), 'turbo.json');
  const rootPkg = readJson(rootPkgPath);
  rootPkg.name = projectName;
  if (!rootPkg.packageManager) {
    const npmVersion = spawnSync('npm --version', { shell: true, encoding: 'utf8' }).stdout.trim();
    rootPkg.packageManager = `npm@${npmVersion}`;
  }
  writeJson(rootPkgPath, rootPkg);
  info(`package.json raiz: name=${rootPkg.name}, packageManager=${rootPkg.packageManager}`);
  run('npm install', root);

  // ---- 02. limpar apps ---------------------------------------------------
  step('Remover conteúdo de apps/');
  fs.mkdirSync(apps, { recursive: true });
  for (const entry of fs.readdirSync(apps)) {
    fs.rmSync(path.join(apps, entry), { recursive: true, force: true });
    info(`removido apps/${entry}`);
  }

  // ---- 03. frontend ------------------------------------------------------
  step('Criar frontend Next.js');
  run('npx --yes create-next-app@latest frontend --yes --src-dir', apps);
  mustExist(path.join(frontend, 'package.json'), 'apps/frontend/package.json');

  // ---- 04. Nest CLI ------------------------------------------------------
  step('Instalar Nest CLI globalmente');
  run('npm i -g @nestjs/cli', root);
  const nestCmd = commandWorks('nest --version') ? 'nest' : 'npx --yes @nestjs/cli@latest';
  info(`usando: ${nestCmd}`);

  // ---- 05. backend -------------------------------------------------------
  step('Criar backend NestJS');
  run(`${nestCmd} new backend -g -p npm`, apps);
  mustExist(path.join(backend, 'package.json'), 'apps/backend/package.json');

  // ---- 06. @nestjs/config ------------------------------------------------
  step('Instalar @nestjs/config no backend');
  run('npm install @nestjs/config', backend);

  // ---- 07/08. app.module.ts e main.ts -----------------------------------
  // NestJS >= 12 gera o backend como ESM ("type": "module", moduleResolution nodenext):
  // imports relativos precisam do sufixo ".js". Detecta pelo código gerado pelo próprio CLI.
  const generatedController = fs.readFileSync(path.join(backend, 'src', 'app.controller.ts'), 'utf8');
  const importExt =
    readJson(path.join(backend, 'package.json')).type === 'module' || /from '\.\/app\.service\.js'/.test(generatedController)
      ? '.js'
      : '';
  info(`estilo de import relativo do backend: ${importExt ? 'ESM (".js")' : 'CommonJS (sem extensão)'}`);

  step('Configurar app.module.ts (ConfigModule global)');
  writeFile(path.join(backend, 'src', 'app.module.ts'), APP_MODULE_TS(importExt));

  step('Configurar main.ts (CORS + porta 4000)');
  writeFile(path.join(backend, 'src', 'main.ts'), MAIN_TS(importExt));

  // ---- 09. script dev ----------------------------------------------------
  step('Adicionar script "dev" ao backend');
  const backendPkgPath = path.join(backend, 'package.json');
  const backendPkg = readJson(backendPkgPath);
  backendPkg.scripts = { ...(backendPkg.scripts || {}), dev: 'nest start --watch' };
  writeJson(backendPkgPath, backendPkg);
  info('"dev": "nest start --watch"');

  // ---- 10/11. .env -------------------------------------------------------
  step('Criar .env.example e .env do frontend');
  writeFile(path.join(frontend, '.env.example'), FRONTEND_ENV);
  fs.copyFileSync(path.join(frontend, '.env.example'), path.join(frontend, '.env'));
  info('copiado para apps/frontend/.env');

  step('Criar .env.example e .env do backend');
  writeFile(path.join(backend, '.env.example'), BACKEND_ENV);
  fs.copyFileSync(path.join(backend, '.env.example'), path.join(backend, '.env'));
  info('copiado para apps/backend/.env');

  // ---- 12. npm install raiz ---------------------------------------------
  step('Instalar/ligar workspaces na raiz');
  run('npm install', root);

  // ---- 13. namespace -----------------------------------------------------
  if (scope) {
    step(`Aplicar namespace @${scope}`);
    const workspaces = listWorkspacePackages(root);
    const mapping = new Map();
    for (const { pkg } of workspaces) {
      const name = readJson(pkg).name;
      if (!name) continue;
      const base = name.includes('/') ? name.split('/').pop() : name;
      const newName = `@${scope}/${base}`;
      if (newName !== name) mapping.set(name, newName);
    }
    if (mapping.size === 0) {
      info('nenhum pacote precisa ser renomeado');
    } else {
      for (const [from, to] of mapping) info(`${from}  ->  ${to}`);

      // a) nomes e dependências em todos os package.json (raiz + workspaces)
      const pkgFiles = [path.join(root, 'package.json'), ...workspaces.map((w) => w.pkg)];
      for (const pkgFile of pkgFiles) {
        const data = readJson(pkgFile);
        if (pkgFile !== path.join(root, 'package.json') && mapping.has(data.name)) data.name = mapping.get(data.name);
        for (const field of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
          if (!data[field]) continue;
          const renamed = {};
          for (const [dep, ver] of Object.entries(data[field])) renamed[mapping.get(dep) ?? dep] = ver;
          data[field] = renamed;
        }
        writeJson(pkgFile, data);
      }

      // b) imports/extends em arquivos de código e config (só referências entre aspas).
      //    - apenas nomes que JÁ tinham escopo (ex.: "@repo/ui"): nomes genéricos como
      //      "frontend"/"backend" aparecem em código comum e só são trocados nos package.json;
      //    - apenas dentro dos workspaces (apps/*, packages/*): nada fora deles é tocado
      //      (ex.: .agents/, docs/ e outras pastas do usuário).
      const patterns = [...mapping]
        .filter(([from]) => from.startsWith('@'))
        .map(([from, to]) => ({
          re: new RegExp(`(?<=['"\`])${escapeRegExp(from)}(?=['"\`/])`, 'g'),
          to,
        }));
      let changed = 0;
      const workspaceFiles = workspaces.flatMap((w) => walkTextFiles(w.dir));
      for (const file of patterns.length ? workspaceFiles : []) {
        if (path.basename(file) === 'package.json') continue;
        const before = fs.readFileSync(file, 'utf8');
        let after = before;
        for (const { re, to } of patterns) after = after.replace(re, to);
        if (after !== before) {
          fs.writeFileSync(file, after, 'utf8');
          changed += 1;
          info(`atualizado ${path.relative(root, file)}`);
        }
      }
      info(`${changed} arquivo(s) de código/config atualizados`);

      // c) religar node_modules com os novos nomes
      fs.rmSync(path.join(root, 'package-lock.json'), { force: true });
      run('npm install', root);
    }
  }

  // ---- 14. verificação ---------------------------------------------------
  if (opts.verify) await verifyProject(root);
  else step('Verificação pulada (--skip-verify)');

  console.log(`\n[OK] Projeto criado em ${root}`);
  if (scope) console.log(`[OK] Namespace aplicado: @${scope}`);
  console.log('Para rodar:  npm run dev');
  console.log(`  frontend -> http://localhost:${FRONTEND_PORT}`);
  console.log(`  backend  -> http://localhost:${BACKEND_PORT}`);
}

main().catch((err) => fail(err?.stack || String(err)));
