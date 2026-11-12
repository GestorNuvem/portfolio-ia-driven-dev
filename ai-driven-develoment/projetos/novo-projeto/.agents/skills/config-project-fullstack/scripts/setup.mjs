#!/usr/bin/env node
/**
 * config-project-fullstack — setup determinístico de monorepo Turborepo (npm)
 * com frontend Next.js (porta 3000) e backend NestJS (porta 4000).
 *
 * Uso:
 *   node setup.mjs [--name projeto-exemplo] [--namespace @acme] [--dir <pasta-base>] [--skip-verify]
 *
 * Cada passo é executado em ordem fixa, validado logo em seguida, e o script
 * aborta (exit 1) no primeiro erro. Nada fora da pasta do projeto é apagado.
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

const IS_WIN = process.platform === 'win32';
const FRONTEND_PORT = 3000;
const BACKEND_PORT = 4000;
const TOTAL_STEPS = 14;

// Ambiente fixo para todos os comandos filhos: sem prompts, sem telemetria.
const CHILD_ENV = {
  ...process.env,
  CI: process.env.CI ?? '1',
  npm_config_yes: 'true',
  npm_config_fund: 'false',
  npm_config_audit: 'false',
  NEXT_TELEMETRY_DISABLED: '1',
  TURBO_TELEMETRY_DISABLED: '1',
  DO_NOT_TRACK: '1',
};
delete CHILD_ENV.PORT; // PORT herdado mudaria a porta do Next/Nest

// ---------------------------------------------------------------- utilidades

function log(msg) { console.log(msg); }
function step(n, msg) { log(`\n[${n}/${TOTAL_STEPS}] ${msg}`); }
function ok(msg) { log(`  ✔ ${msg}`); }
function fail(msg) {
  console.error(`\n✖ ERRO: ${msg}`);
  process.exit(1);
}
function assert(cond, msg) { if (!cond) fail(msg); }

function parseArgs(argv) {
  const args = { name: 'projeto-exemplo', namespace: null, dir: process.cwd(), skipVerify: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined || v.startsWith('--')) fail(`Valor ausente para ${a}`);
      return v;
    };
    if (a === '--name') args.name = next();
    else if (a.startsWith('--name=')) args.name = a.slice(7);
    else if (a === '--namespace') args.namespace = next();
    else if (a.startsWith('--namespace=')) args.namespace = a.slice(12);
    else if (a === '--dir') args.dir = next();
    else if (a.startsWith('--dir=')) args.dir = a.slice(6);
    else if (a === '--skip-verify') args.skipVerify = true;
    else if (a === '-h' || a === '--help') {
      log('Uso: node setup.mjs [--name projeto-exemplo] [--namespace @acme] [--dir <pasta-base>] [--skip-verify]');
      process.exit(0);
    } else fail(`Argumento desconhecido: ${a}`);
  }
  return args;
}

/** Monta a linha de comando. Argumentos já são validados (sem espaços/metacaracteres). */
function cmdLine(cmd, args) {
  for (const a of args) {
    if (!/^[A-Za-z0-9@._\/:=+-]+$/.test(a)) fail(`Argumento inseguro para shell: ${a}`);
  }
  return [cmd, ...args].join(' ');
}

/** Executa um comando de forma síncrona, herdando stdio. Aborta se falhar. */
function run(cmd, args, cwd) {
  const line = cmdLine(cmd, args);
  log(`  $ ${line}   (em ${cwd})`);
  const r = spawnSync(line, { cwd, stdio: 'inherit', shell: true, env: CHILD_ENV });
  if (r.error) fail(`Falha ao executar "${line}": ${r.error.message}`);
  if (r.status !== 0) fail(`Comando "${line}" terminou com código ${r.status}`);
}

/** Executa e captura stdout (sem abortar). */
function capture(cmd, args, cwd = process.cwd()) {
  const r = spawnSync(cmdLine(cmd, args), { cwd, shell: true, env: CHILD_ENV, encoding: 'utf8' });
  return { status: r.status, stdout: (r.stdout || '').trim(), stderr: (r.stderr || '').trim() };
}

function readJson(file) {
  assert(fs.existsSync(file), `Arquivo não encontrado: ${file}`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}
function writeFile(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
  assert(fs.readFileSync(file, 'utf8') === content, `Falha ao gravar ${file}`);
}
/** Garante que `target` está estritamente dentro de `root` (trava contra rm fora do projeto). */
function assertInside(root, target) {
  const rel = path.relative(path.resolve(root), path.resolve(target));
  assert(rel && !rel.startsWith('..') && !path.isAbsolute(rel), `Caminho fora do projeto recusado: ${target}`);
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once('error', () => resolve(false));
    srv.once('listening', () => srv.close(() => resolve(true)));
    srv.listen(port);
  });
}
function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once('error', reject);
    srv.listen(0, () => { const { port } = srv.address(); srv.close(() => resolve(port)); });
  });
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Faz polling HTTP até responder 200 (tenta IPv4 e localhost). Retorna o corpo. */
async function waitForHttp(port, timeoutMs, isAlive) {
  const urls = [`http://127.0.0.1:${port}/`, `http://localhost:${port}/`];
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (isAlive && !isAlive()) return null;
    for (const url of urls) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (res.status === 200) return await res.text();
      } catch { /* ainda subindo */ }
    }
    await sleep(1000);
  }
  return null;
}

/** Sobe um processo de longa duração em background (grupo próprio para poder matar a árvore). */
function startBackground(line, cwd, extraEnv = {}) {
  log(`  $ ${line}   (em ${cwd}, background)`);
  const child = spawn(line, {
    cwd, shell: true, detached: !IS_WIN, stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...CHILD_ENV, ...extraEnv },
  });
  let output = '';
  const collect = (d) => { output += d.toString(); if (output.length > 200_000) output = output.slice(-100_000); };
  child.stdout.on('data', collect);
  child.stderr.on('data', collect);
  child.exited = false;
  child.on('exit', () => { child.exited = true; });
  child.getOutput = () => output;
  return child;
}

async function killTree(child) {
  if (!child || child.exited) return;
  try {
    if (IS_WIN) spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    else {
      try { process.kill(-child.pid, 'SIGTERM'); } catch { /* já morreu */ }
      await sleep(2000);
      try { process.kill(-child.pid, 'SIGKILL'); } catch { /* já morreu */ }
    }
  } catch { /* melhor esforço */ }
  for (let i = 0; i < 20 && !child.exited; i++) await sleep(250);
}

async function waitPortFree(port, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) { if (await isPortFree(port)) return true; await sleep(500); }
  return false;
}

// ------------------------------------------------------- conteúdos fixos

const APP_MODULE_TS = `import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

@Module({
\timports: [
\t\tConfigModule.forRoot({
\t\t\tisGlobal: true,
\t\t}),
\t],
\tcontrollers: [AppController],
\tproviders: [AppService],
})
export class AppModule {}
`;

const MAIN_TS = `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
\tconst app = await NestFactory.create(AppModule);
\tapp.enableCors();
\tawait app.listen(process.env.PORT ?? 4000);
}

bootstrap();
`;

const FRONTEND_ENV = `NEXT_PUBLIC_API_URL=http://localhost:${BACKEND_PORT}\n`;
const BACKEND_ENV = `PORT=${BACKEND_PORT}\n`;

// ------------------------------------------------------- namespace

const TEXT_EXT = new Set(['.json', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.md', '.mdx', '.css', '.yaml', '.yml']);
const SKIP_DIRS = new Set(['node_modules', '.git', '.next', '.turbo', 'dist', 'build', 'coverage']);

function walkFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walkFiles(path.join(dir, entry.name), out);
    } else if (entry.isFile() && TEXT_EXT.has(path.extname(entry.name))) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/**
 * Renomeia os pacotes do workspace para o namespace informado.
 * - apps/* sem escopo (frontend, backend) -> @ns/frontend, @ns/backend
 * - pacotes @repo/* (ou qualquer outro escopo) -> @ns/<nome>
 * Atualiza "name", dependências entre workspaces e referências textuais (imports, extends).
 * O pacote raiz (nome do monorepo) é mantido.
 */
function applyNamespace(projectDir, ns) {
  const rootPkg = readJson(path.join(projectDir, 'package.json'));
  const patterns = rootPkg.workspaces || [];
  const pkgDirs = [];
  for (const pattern of patterns) {
    assert(/^[^*]+\/\*$/.test(pattern), `Padrão de workspace não suportado: ${pattern}`);
    const base = path.join(projectDir, pattern.slice(0, -2));
    if (!fs.existsSync(base)) continue;
    for (const d of fs.readdirSync(base, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort()) {
      if (fs.existsSync(path.join(base, d, 'package.json'))) pkgDirs.push(path.join(base, d));
    }
  }

  const renames = new Map(); // nome antigo -> nome novo
  for (const dir of pkgDirs) {
    const oldName = readJson(path.join(dir, 'package.json')).name;
    assert(oldName, `package.json sem "name" em ${dir}`);
    const bare = oldName.includes('/') ? oldName.split('/')[1] : oldName;
    const newName = `${ns}/${bare}`;
    if (oldName !== newName) renames.set(oldName, newName);
  }
  const newNames = [...renames.values()];
  assert(new Set(newNames).size === newNames.length, `Colisão de nomes ao aplicar namespace: ${newNames.join(', ')}`);

  // 1) package.json: name + chaves de dependências
  const depFields = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
  for (const file of [path.join(projectDir, 'package.json'), ...pkgDirs.map((d) => path.join(d, 'package.json'))]) {
    const pkg = readJson(file);
    if (file !== path.join(projectDir, 'package.json') && renames.has(pkg.name)) pkg.name = renames.get(pkg.name);
    for (const f of depFields) {
      if (!pkg[f]) continue;
      const rebuilt = {};
      for (const [k, v] of Object.entries(pkg[f])) rebuilt[renames.get(k) ?? k] = v;
      pkg[f] = rebuilt;
    }
    writeJson(file, pkg);
  }

  // 2) Referências textuais apenas para nomes com escopo (ex.: '@repo/ui', '@repo/eslint-config/next-js').
  //    Nomes sem escopo (frontend/backend) não são substituídos em texto para não corromper código.
  const scoped = [...renames.entries()].filter(([o]) => o.startsWith('@')).sort((a, b) => b[0].length - a[0].length);
  let changedFiles = 0;
  if (scoped.length) {
    const re = new RegExp(`(${scoped.map(([o]) => escapeRe(o)).join('|')})(?=$|[^A-Za-z0-9._-])`, 'g');
    const map = new Map(scoped);
    for (const file of walkFiles(projectDir)) {
      if (path.basename(file) === 'package-lock.json') continue;
      const src = fs.readFileSync(file, 'utf8');
      const out = src.replace(re, (m) => map.get(m));
      if (out !== src) { fs.writeFileSync(file, out, 'utf8'); changedFiles++; }
    }
  }

  // 3) Remove links antigos de node_modules para o npm recriar com os novos nomes.
  for (const oldName of renames.keys()) {
    const link = path.join(projectDir, 'node_modules', ...oldName.split('/'));
    if (fs.existsSync(link) || fs.lstatSync(link, { throwIfNoEntry: false })) {
      assertInside(projectDir, link);
      fs.rmSync(link, { recursive: true, force: true });
    }
  }
  return { renames, changedFiles };
}

// ------------------------------------------------------- main

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const baseDir = path.resolve(args.dir);
  const name = args.name;
  let ns = args.namespace;

  // ---------------------------------------------------------------- 0
  step(0, 'Pré-checagens de segurança');
  const nodeMajor = Number(process.versions.node.split('.')[0]);
  assert(nodeMajor >= 20, `Node.js >= 20 é necessário (atual: ${process.versions.node})`);
  ok(`Node ${process.versions.node}`);

  const npmV = capture('npm', ['-v']);
  assert(npmV.status === 0, 'npm não encontrado no PATH');
  ok(`npm ${npmV.stdout}`);

  assert(/^[a-z0-9][a-z0-9._-]*$/.test(name) && name.length <= 214,
    `Nome de projeto inválido "${name}" (use minúsculas, números, ".", "_" ou "-", sem espaços)`);
  ok(`Nome do projeto: ${name}`);

  if (ns !== null) {
    ns = ns.trim().replace(/\/+$/, '');
    if (!ns.startsWith('@')) ns = `@${ns}`;
    assert(/^@[a-z0-9][a-z0-9._-]*$/.test(ns), `Namespace inválido "${args.namespace}" (ex.: @minha-empresa)`);
    ok(`Namespace: ${ns}`);
  } else ok('Namespace: (não informado — nomes padrão mantidos)');

  assert(fs.existsSync(baseDir) && fs.statSync(baseDir).isDirectory(), `Pasta base não existe: ${baseDir}`);
  const projectDir = path.join(baseDir, name);
  assert(!fs.existsSync(projectDir), `A pasta "${projectDir}" já existe. Remova-a ou escolha outro --name (o projeto é sempre criado do zero).`);
  ok(`Destino: ${projectDir}`);

  if (!args.skipVerify) {
    for (const p of [FRONTEND_PORT, BACKEND_PORT]) {
      assert(await isPortFree(p), `A porta ${p} está em uso. Libere-a antes de rodar (necessária para a verificação final).`);
    }
    ok(`Portas ${FRONTEND_PORT} e ${BACKEND_PORT} livres`);
  }

  const appsDir = path.join(projectDir, 'apps');
  const frontendDir = path.join(appsDir, 'frontend');
  const backendDir = path.join(appsDir, 'backend');

  // ---------------------------------------------------------------- 1
  step(1, `Criando monorepo Turborepo (${name})`);
  run('npx', ['--yes', 'create-turbo@latest', name, '-m', 'npm'], baseDir);
  assert(fs.existsSync(path.join(projectDir, 'turbo.json')), 'turbo.json não foi criado');
  assert(fs.existsSync(path.join(projectDir, 'package.json')), 'package.json raiz não foi criado');
  ok('Turborepo criado');

  // ---------------------------------------------------------------- 2
  step(2, 'Limpando apps/*');
  assert(fs.existsSync(appsDir), 'Pasta apps/ não existe após create-turbo');
  for (const entry of fs.readdirSync(appsDir)) {
    const target = path.join(appsDir, entry);
    assertInside(projectDir, target);
    fs.rmSync(target, { recursive: true, force: true });
  }
  assert(fs.readdirSync(appsDir).length === 0, 'apps/ não ficou vazia');
  ok('apps/ vazia');

  // ---------------------------------------------------------------- 3
  step(3, 'Criando frontend Next.js');
  run('npx', ['--yes', 'create-next-app@latest', 'frontend', '--yes', '--src-dir', '--use-npm'], appsDir);
  assert(fs.existsSync(path.join(frontendDir, 'package.json')), 'apps/frontend/package.json não existe');
  assert(fs.existsSync(path.join(frontendDir, 'src')), 'apps/frontend/src não existe (--src-dir falhou)');
  ok('Frontend criado');

  // ---------------------------------------------------------------- 4
  step(4, 'Instalando Nest CLI global');
  if (capture('nest', ['--version']).status === 0) {
    ok(`Nest CLI já instalado (${capture('nest', ['--version']).stdout}) — pulando instalação`);
  } else {
    run('npm', ['i', '-g', '@nestjs/cli'], baseDir);
    assert(capture('nest', ['--version']).status === 0, 'Nest CLI não ficou disponível no PATH após npm i -g');
    ok('Nest CLI instalado');
  }

  // ---------------------------------------------------------------- 5
  step(5, 'Criando backend NestJS');
  run('nest', ['new', 'backend', '-g', '-p', 'npm', '--no-observe'], appsDir);
  assert(fs.existsSync(path.join(backendDir, 'package.json')), 'apps/backend/package.json não existe');
  assert(fs.existsSync(path.join(backendDir, 'src', 'main.ts')), 'apps/backend/src/main.ts não existe');
  ok('Backend criado');

  // ---------------------------------------------------------------- 6
  step(6, 'Instalando @nestjs/config no backend');
  run('npm', ['install', '@nestjs/config'], backendDir);
  assert(readJson(path.join(backendDir, 'package.json')).dependencies?.['@nestjs/config'],
    '@nestjs/config não está nas dependências do backend');
  ok('@nestjs/config instalado');

  // ---------------------------------------------------------------- 7
  step(7, 'Configurando apps/backend/src/app.module.ts');
  writeFile(path.join(backendDir, 'src', 'app.module.ts'), APP_MODULE_TS);
  ok('ConfigModule global adicionado');

  // ---------------------------------------------------------------- 8
  step(8, 'Configurando apps/backend/src/main.ts (porta 4000 + CORS)');
  writeFile(path.join(backendDir, 'src', 'main.ts'), MAIN_TS);
  ok('main.ts atualizado');

  // ---------------------------------------------------------------- 9
  step(9, 'Adicionando script "dev" no backend');
  {
    const file = path.join(backendDir, 'package.json');
    const pkg = readJson(file);
    pkg.scripts = { ...(pkg.scripts || {}), dev: 'nest start --watch' };
    writeJson(file, pkg);
    assert(readJson(file).scripts.dev === 'nest start --watch', 'script dev não foi gravado');
  }
  ok('"dev": "nest start --watch"');

  // ---------------------------------------------------------------- 10
  step(10, 'Criando .env.example e .env do frontend');
  writeFile(path.join(frontendDir, '.env.example'), FRONTEND_ENV);
  fs.copyFileSync(path.join(frontendDir, '.env.example'), path.join(frontendDir, '.env'));
  {
    // O template do Next ignora ".env*"; libera o .env.example para ser versionado.
    const gi = path.join(frontendDir, '.gitignore');
    if (fs.existsSync(gi)) {
      const txt = fs.readFileSync(gi, 'utf8');
      if (/^\.env\*?\s*$/m.test(txt) && !/^!\.env\.example\s*$/m.test(txt)) {
        fs.writeFileSync(gi, txt.replace(/\s*$/, '\n') + '!.env.example\n', 'utf8');
      }
    }
  }
  assert(fs.readFileSync(path.join(frontendDir, '.env'), 'utf8') === FRONTEND_ENV, 'apps/frontend/.env incorreto');
  ok('apps/frontend/.env(.example) criados');

  // ---------------------------------------------------------------- 11
  step(11, 'Criando .env.example e .env do backend');
  writeFile(path.join(backendDir, '.env.example'), BACKEND_ENV);
  fs.copyFileSync(path.join(backendDir, '.env.example'), path.join(backendDir, '.env'));
  assert(fs.readFileSync(path.join(backendDir, '.env'), 'utf8') === BACKEND_ENV, 'apps/backend/.env incorreto');
  ok('apps/backend/.env(.example) criados');

  // ---------------------------------------------------------------- 12
  step(12, 'Aplicando namespace');
  if (ns) {
    const { renames, changedFiles } = applyNamespace(projectDir, ns);
    for (const [o, n] of renames) ok(`${o} -> ${n}`);
    ok(`${changedFiles} arquivo(s) com referências atualizadas`);
  } else ok('Nenhum namespace informado — pulando');

  // ---------------------------------------------------------------- 13
  step(13, 'Sincronizando workspaces (npm install na raiz)');
  run('npm', ['install'], projectDir);
  {
    const rootPkg = readJson(path.join(projectDir, 'package.json'));
    const ws = (rootPkg.workspaces || []);
    assert(ws.some((w) => w.startsWith('apps/')), 'Workspaces da raiz não incluem apps/*');
    const fe = readJson(path.join(frontendDir, 'package.json')).name;
    const be = readJson(path.join(backendDir, 'package.json')).name;
    for (const n of [fe, be]) {
      assert(fs.existsSync(path.join(projectDir, 'node_modules', ...n.split('/'))), `Workspace "${n}" não foi linkado em node_modules`);
    }
    ok(`Workspaces linkados: ${fe}, ${be}`);
  }

  // ---------------------------------------------------------------- 14
  step(14, 'Verificação final');
  if (args.skipVerify) {
    ok('Pulada (--skip-verify)');
  } else {
    // 14a) build do backend
    run('npm', ['run', 'build'], backendDir);
    const mainJs = path.join(backendDir, 'dist', 'main.js');
    assert(fs.existsSync(mainJs), 'apps/backend/dist/main.js não foi gerado pelo build');
    ok('Backend compila');

    // 14b) prova de leitura do .env: roda o backend com cwd numa pasta temporária
    //      cujo .env define outra porta. Se responder nela, o ConfigModule leu o .env.
    const probePort = await getFreePort();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cpf-env-'));
    fs.writeFileSync(path.join(tmp, '.env'), `PORT=${probePort}\n`, 'utf8');
    const probe = startBackground(`node "${mainJs}"`, tmp);
    const probeBody = await waitForHttp(probePort, 60_000, () => !probe.exited);
    await killTree(probe);
    fs.rmSync(tmp, { recursive: true, force: true });
    assert(probeBody !== null, `Backend não subiu na porta ${probePort} definida via .env — ConfigModule não leu o .env.\n${probe.getOutput().slice(-3000)}`);
    ok(`Backend leu PORT=${probePort} do .env`);

    // 14c) npm run dev na raiz (turbo) -> frontend :3000 e backend :4000
    const dev = startBackground('npm run dev', projectDir);
    try {
      const be = await waitForHttp(BACKEND_PORT, 180_000, () => !dev.exited);
      assert(be !== null, `Backend não respondeu em http://localhost:${BACKEND_PORT}\n${dev.getOutput().slice(-4000)}`);
      ok(`Backend respondendo em http://localhost:${BACKEND_PORT} -> "${be.slice(0, 60)}"`);
      const fe = await waitForHttp(FRONTEND_PORT, 180_000, () => !dev.exited);
      assert(fe !== null, `Frontend não respondeu em http://localhost:${FRONTEND_PORT}\n${dev.getOutput().slice(-4000)}`);
      ok(`Frontend respondendo em http://localhost:${FRONTEND_PORT}`);
    } finally {
      await killTree(dev);
      await waitPortFree(FRONTEND_PORT);
      await waitPortFree(BACKEND_PORT);
    }
  }

  log('\n========================================');
  log('✔ Projeto configurado com sucesso');
  log(`  Pasta:     ${projectDir}`);
  log(`  Frontend:  ${readJson(path.join(frontendDir, 'package.json')).name}  -> http://localhost:${FRONTEND_PORT}`);
  log(`  Backend:   ${readJson(path.join(backendDir, 'package.json')).name}  -> http://localhost:${BACKEND_PORT}`);
  log(`  Namespace: ${ns ?? '(nenhum)'}`);
  log(`  Rodar:     cd ${name} && npm run dev`);
  log('========================================');
}

main().catch((err) => fail(err?.stack || String(err)));
