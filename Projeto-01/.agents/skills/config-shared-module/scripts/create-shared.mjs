#!/usr/bin/env node
/**
 * config-shared-module — cria, de forma determinística, o módulo de infraestrutura
 * packages/shared (erros, validação, entidade base, caso de uso, repositórios) a partir
 * dos arquivos literais em ../assets/shared, e liga as dependências.
 *
 * Não altera código do frontend/backend: apenas adiciona "@escopo/shared": "*" nas dependências.
 *
 * Uso (sempre na raiz do projeto):
 *   node .agents/skills/config-shared-module/scripts/create-shared.mjs --namespace @escopo
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const SKILL_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSET_DIR = path.join(SKILL_DIR, 'assets', 'shared');
const TS_NODE_VERSION = '^10.9.2';

let stepNo = 0;
const step = (t) => console.log(`\n=== [${String(++stepNo).padStart(2, '0')}] ${t} ===`);
const info = (m) => console.log(`  -> ${m}`);
function fail(msg) {
  console.error(`\n[ERRO] ${msg}`);
  process.exit(1);
}

function run(command, cwd) {
  info(`$ ${command}   (em ${cwd})`);
  const env = { ...process.env };
  delete env.PORT;
  const r = spawnSync(command, { cwd, shell: true, stdio: ['ignore', 'inherit', 'inherit'], env });
  if (r.error) fail(`Falha ao executar "${command}": ${r.error.message}`);
  if (r.status !== 0) fail(`Comando "${command}" terminou com código ${r.status}.`);
}

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, d) => fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n', 'utf8');
const sortObject = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));

function listFiles(dir, base = dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listFiles(full, base, out);
    else out.push(path.relative(base, full));
  }
  return out;
}

function addDependency(pkgPath, depName, root) {
  const pkg = readJson(pkgPath);
  pkg.dependencies = sortObject({ ...(pkg.dependencies || {}), [depName]: '*' });
  writeJson(pkgPath, pkg);
  info(`${depName} -> ${path.relative(root, pkgPath)}`);
}

function parseArgs(argv) {
  const opts = { namespace: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--namespace') {
      opts.namespace = argv[++i];
      if (!opts.namespace || opts.namespace.startsWith('--')) fail('Valor ausente para --namespace');
    } else if (a === '--help' || a === '-h') {
      console.log('Uso: node create-shared.mjs --namespace @escopo');
      process.exit(0);
    } else fail(`Argumento desconhecido: ${a}`);
  }
  return opts;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const root = process.cwd();

  // ---- Verificações -----------------------------------------------------
  step('Verificações de segurança');
  if (!opts.namespace) fail('Namespace não informado. Esta skill não é executada sem --namespace @escopo.');
  const scope = opts.namespace.replace(/^@/, '').replace(/\/+$/, '');
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(scope)) fail(`Namespace inválido "${opts.namespace}". Ex.: @meu-projeto`);
  const ns = `@${scope}`;

  const rootPkgPath = path.join(root, 'package.json');
  const frontendPkg = path.join(root, 'apps', 'frontend', 'package.json');
  const backendPkg = path.join(root, 'apps', 'backend', 'package.json');
  for (const [p, label] of [
    [rootPkgPath, 'package.json da raiz'],
    [path.join(root, 'turbo.json'), 'turbo.json'],
    [frontendPkg, 'apps/frontend/package.json'],
    [backendPkg, 'apps/backend/package.json'],
  ]) {
    if (!fs.existsSync(p)) fail(`${label} não encontrado em ${root}. Execute na raiz de um projeto criado pela skill config-project-fullstack.`);
  }
  const backendName = readJson(backendPkg).name ?? '';
  const projectScope = backendName.startsWith('@') ? backendName.split('/')[0] : null;
  if (projectScope && projectScope !== ns) fail(`Namespace informado (${ns}) difere do namespace do projeto (${projectScope}).`);

  const sharedDir = path.join(root, 'packages', 'shared');
  if (fs.existsSync(sharedDir)) fail('packages/shared já existe. O módulo shared já foi criado (nada foi alterado).');
  if (!fs.existsSync(ASSET_DIR)) fail(`Assets da skill não encontrados: ${ASSET_DIR}`);
  info(`pacote: ${ns}/shared -> packages/shared`);

  // ---- 1. copiar assets --------------------------------------------------
  step('Criar packages/shared a partir dos assets');
  const files = listFiles(ASSET_DIR);
  for (const rel of files) {
    const dest = path.join(sharedDir, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const content = fs.readFileSync(path.join(ASSET_DIR, rel), 'utf8').split('__NAMESPACE__').join(ns);
    fs.writeFileSync(dest, content, 'utf8');
  }
  info(`${files.length} arquivos criados`);

  // ---- 2. dependências ---------------------------------------------------
  step(`Adicionar ${ns}/shared como dependência (frontend, backend e módulos de negócio)`);
  addDependency(frontendPkg, `${ns}/shared`, root);
  addDependency(backendPkg, `${ns}/shared`, root);
  const modulesDir = path.join(root, 'modules');
  if (fs.existsSync(modulesDir)) {
    for (const entry of fs.readdirSync(modulesDir).sort()) {
      const pkg = path.join(modulesDir, entry, 'package.json');
      if (fs.existsSync(pkg)) addDependency(pkg, `${ns}/shared`, root);
    }
  }

  // ---- 3. raiz -----------------------------------------------------------
  step('Garantir ts-node e workspace packages/* na raiz');
  const rootPkg = readJson(rootPkgPath);
  rootPkg.devDependencies = rootPkg.devDependencies || {};
  if (!rootPkg.devDependencies['ts-node']) rootPkg.devDependencies['ts-node'] = TS_NODE_VERSION;
  rootPkg.devDependencies = sortObject(rootPkg.devDependencies);
  const ws = Array.isArray(rootPkg.workspaces) ? rootPkg.workspaces : rootPkg.workspaces?.packages ?? [];
  const merged = [...new Set([...ws, 'packages/*'])].sort();
  if (Array.isArray(rootPkg.workspaces) || !rootPkg.workspaces) rootPkg.workspaces = merged;
  else rootPkg.workspaces.packages = merged;
  writeJson(rootPkgPath, rootPkg);
  info(`workspaces: ${JSON.stringify(merged)}`);

  // ---- 4. install / build / test (somente o shared) ----------------------
  step('Instalar dependências');
  run('npm install', root);

  step(`Build de ${ns}/shared`);
  run('npm run build', sharedDir);

  step(`Testes de ${ns}/shared (cobertura 100%)`);
  run('npm run test:coverage', sharedDir);

  console.log(`\n[OK] Módulo ${ns}/shared criado em packages/shared.`);
  console.log('  error/       DomainError, ValidationError (422), NotFoundError (404), UnauthorizedError (401)');
  console.log('  validation/  ValidationRule, Validator, ValidationException, rules/* (59 regras)');
  console.log('  model/       Entity (UUID v4, validate, equals, clone)');
  console.log('  usecase/     UseCase<I, O>');
  console.log('  data/        repositórios (create, update, delete, findById, findPage, crud)');
}

main();
