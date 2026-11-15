#!/usr/bin/env node
/**
 * config-new-module — cria, de forma determinística, um novo módulo de negócio:
 *   1. modules/<nome>                         (pacote do workspace, com testes Jest)
 *   2. apps/backend/src/modules/<nome>         (módulo + controller NestJS, registrado no AppModule)
 *   3. apps/frontend/src/app/(<grupo>)/<nome>  (rota Next.js) +
 *      apps/frontend/src/modules/<nome>        (página e componente principais)
 *
 * Uso (sempre a partir da raiz do projeto):
 *   node .agents/skills/config-new-module/scripts/new-module.mjs --name <modulo> --namespace @escopo [--route private|public]
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const SKILL_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.join(SKILL_DIR, 'assets');
const REQUIRED_WORKSPACES = ['apps/*', 'modules/*', 'packages/*'];
const TS_NODE_VERSION = '^10.9.2';

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------
let stepNo = 0;
const step = (t) => console.log(`\n=== [${String(++stepNo).padStart(2, '0')}] ${t} ===`);
const info = (m) => console.log(`  -> ${m}`);
function fail(msg) {
  console.error(`\n[ERRO] ${msg}`);
  process.exit(1);
}

function childEnv() {
  const env = { ...process.env, NEXT_TELEMETRY_DISABLED: '1', TURBO_TELEMETRY_DISABLED: '1' };
  delete env.PORT;
  return env;
}

function run(command, cwd) {
  info(`$ ${command}   (em ${cwd})`);
  const r = spawnSync(command, { cwd, shell: true, stdio: ['ignore', 'inherit', 'inherit'], env: childEnv() });
  if (r.error) fail(`Falha ao executar "${command}": ${r.error.message}`);
  if (r.status !== 0) fail(`Comando "${command}" terminou com código ${r.status}.`);
}

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, d) => fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n', 'utf8');

function sortObject(obj) {
  return Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
}

function render(template, vars) {
  let out = template;
  for (const [key, value] of Object.entries(vars)) out = out.split(key).join(value);
  return out;
}

function writeFromAsset(assetRel, dest, vars) {
  const src = path.join(ASSETS, assetRel);
  if (!fs.existsSync(src)) fail(`Asset ausente na skill: ${src}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, render(fs.readFileSync(src, 'utf8'), vars), 'utf8');
  info(`escrito ${path.relative(process.cwd(), dest)}`);
}

function toPascal(name) {
  return name
    .split('-')
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join('');
}

function parseArgs(argv) {
  const opts = { name: null, namespace: null, route: 'private' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined || v.startsWith('--')) fail(`Valor ausente para ${a}`);
      return v;
    };
    if (a === '--name') opts.name = next();
    else if (a === '--namespace') opts.namespace = next();
    else if (a === '--route') opts.route = next();
    else if (a === '--help' || a === '-h') {
      console.log('Uso: node new-module.mjs --name <modulo> --namespace @escopo [--route private|public]');
      process.exit(0);
    } else fail(`Argumento desconhecido: ${a}`);
  }
  return opts;
}

/** Garante que AppModule importa o módulo (fallback caso o CLI do Nest não tenha registrado). */
function ensureRegisteredInAppModule(appModulePath, className, moduleName, importExt) {
  let src = fs.readFileSync(appModulePath, 'utf8');
  const importPath = `./modules/${moduleName}/${moduleName}.module${importExt}`;
  const hasImportLine = src.includes(importPath);
  const importsArray = /imports:\s*\[([\s\S]*?)\]/m.exec(src);
  const inArray = importsArray && new RegExp(`\\b${className}Module\\b`).test(importsArray[1]);
  if (hasImportLine && inArray) {
    info(`${className}Module já registrado em app.module.ts`);
    return;
  }
  if (!hasImportLine) {
    const lines = src.split('\n');
    let lastImport = -1;
    lines.forEach((l, idx) => {
      if (/^import\s/.test(l)) lastImport = idx;
    });
    lines.splice(lastImport + 1, 0, `import { ${className}Module } from '${importPath}';`);
    src = lines.join('\n');
  }
  if (!inArray) {
    if (/imports:\s*\[/.test(src)) {
      src = src.replace(/imports:\s*\[/, (m) => `${m}\n    ${className}Module,`);
    } else if (/@Module\(\{/.test(src)) {
      src = src.replace(/@Module\(\{/, (m) => `${m}\n  imports: [${className}Module],`);
    } else {
      fail('Não foi possível localizar @Module({...}) em app.module.ts para registrar o módulo.');
    }
  }
  fs.writeFileSync(appModulePath, src, 'utf8');
  info(`${className}Module registrado em app.module.ts`);
}

// ---------------------------------------------------------------------------
// Execução
// ---------------------------------------------------------------------------
function main() {
  const opts = parseArgs(process.argv.slice(2));
  const root = process.cwd();

  // ---- Verificações -----------------------------------------------------
  step('Verificações de segurança');
  if (!opts.namespace) fail('Namespace não informado. Esta skill não é executada sem --namespace @escopo.');
  const scope = opts.namespace.replace(/^@/, '').replace(/\/+$/, '');
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(scope)) fail(`Namespace inválido "${opts.namespace}". Ex.: @meu-projeto`);
  const ns = `@${scope}`;

  if (!opts.name) fail('Nome do módulo não informado (--name <modulo>).');
  const name = opts.name.trim().toLowerCase();
  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
    fail(`Nome de módulo inválido "${opts.name}". Use kebab-case: letras minúsculas, números e "-" (ex.: transactions, user-profile).`);
  }
  if (!['private', 'public'].includes(opts.route)) fail(`--route deve ser "private" ou "public" (recebido "${opts.route}").`);
  const className = toPascal(name);

  const rootPkgPath = path.join(root, 'package.json');
  const frontend = path.join(root, 'apps', 'frontend');
  const backend = path.join(root, 'apps', 'backend');
  const appModulePath = path.join(backend, 'src', 'app.module.ts');
  for (const [p, label] of [
    [rootPkgPath, 'package.json da raiz'],
    [path.join(root, 'turbo.json'), 'turbo.json'],
    [path.join(frontend, 'package.json'), 'apps/frontend/package.json'],
    [path.join(backend, 'package.json'), 'apps/backend/package.json'],
    [appModulePath, 'apps/backend/src/app.module.ts'],
    [path.join(backend, 'nest-cli.json'), 'apps/backend/nest-cli.json'],
    [path.join(frontend, 'src', 'app'), 'apps/frontend/src/app'],
  ]) {
    if (!fs.existsSync(p)) fail(`${label} não encontrado em ${root}. Execute a partir da raiz de um projeto criado pela skill config-project-fullstack.`);
  }

  // namespace deve ser coerente com o do projeto (se o projeto já tiver um)
  const backendName = readJson(path.join(backend, 'package.json')).name ?? '';
  const projectScope = backendName.startsWith('@') ? backendName.split('/')[0] : null;
  if (projectScope && projectScope !== ns) {
    fail(`Namespace informado (${ns}) difere do namespace do projeto (${projectScope}).`);
  }

  const moduleDir = path.join(root, 'modules', name);
  const backendModuleDir = path.join(backend, 'src', 'modules', name);
  const frontendModuleDir = path.join(frontend, 'src', 'modules', name);
  const routeDirs = ['private', 'public'].map((g) => path.join(frontend, 'src', 'app', `(${g})`, name));
  const routeDir = path.join(frontend, 'src', 'app', `(${opts.route})`, name);
  for (const p of [moduleDir, backendModuleDir, frontendModuleDir, ...routeDirs]) {
    if (fs.existsSync(p)) fail(`Já existe ${path.relative(root, p)}. O módulo "${name}" já foi criado (nada foi alterado).`);
  }
  info(`módulo: ${name}  |  classe: ${className}  |  pacote: ${ns}/${name}  |  rota: (${opts.route})/${name}`);

  // NestJS >= 12 é ESM: imports relativos com sufixo ".js" (detectado pelo projeto existente)
  const importExt =
    readJson(path.join(backend, 'package.json')).type === 'module' || /from '\.\/[^']+\.js'/.test(fs.readFileSync(appModulePath, 'utf8'))
      ? '.js'
      : '';
  const vars = { __NAMESPACE__: ns, __MODULE_NAME__: name, __CLASS_NAME__: className, __IMPORT_EXT__: importExt };
  const hasShared = fs.existsSync(path.join(root, 'packages', 'shared', 'package.json'));

  // ---- 1. modules/<nome> -------------------------------------------------
  step('Criar pasta modules/ (se não existir)');
  fs.mkdirSync(path.join(root, 'modules'), { recursive: true });
  info('modules/ OK');

  step(`Criar modules/${name} a partir dos assets`);
  writeFromAsset('module/package.json', path.join(moduleDir, 'package.json'), vars);
  writeFromAsset('module/tsconfig.json', path.join(moduleDir, 'tsconfig.json'), vars);
  writeFromAsset('module/jest.config.ts', path.join(moduleDir, 'jest.config.ts'), vars);
  writeFromAsset('module/src/index.ts', path.join(moduleDir, 'src', 'index.ts'), vars);
  writeFromAsset('module/src/index.test.ts', path.join(moduleDir, 'src', 'index.test.ts'), vars);
  if (hasShared) {
    // todo módulo de negócio depende do módulo de infraestrutura shared (packages/shared)
    const modulePkgPath = path.join(moduleDir, 'package.json');
    const modulePkg = readJson(modulePkgPath);
    modulePkg.dependencies = sortObject({ ...(modulePkg.dependencies || {}), [`${ns}/shared`]: '*' });
    writeJson(modulePkgPath, modulePkg);
    info(`dependência ${ns}/shared adicionada (packages/shared existe)`);
  }

  // ---- 2. dependências frontend/backend ---------------------------------
  step(`Adicionar "${ns}/${name}": "*" no frontend e backend`);
  for (const app of [frontend, backend]) {
    const pkgPath = path.join(app, 'package.json');
    const pkg = readJson(pkgPath);
    pkg.dependencies = sortObject({ ...(pkg.dependencies || {}), [`${ns}/${name}`]: '*' });
    writeJson(pkgPath, pkg);
    info(`atualizado ${path.relative(root, pkgPath)}`);
  }

  // ---- 3. raiz: ts-node + workspaces ------------------------------------
  step('Garantir ts-node e workspaces no package.json da raiz');
  const rootPkg = readJson(rootPkgPath);
  rootPkg.devDependencies = rootPkg.devDependencies || {};
  if (!rootPkg.devDependencies['ts-node']) {
    rootPkg.devDependencies['ts-node'] = TS_NODE_VERSION;
    info(`ts-node ${TS_NODE_VERSION} adicionado`);
  } else info(`ts-node já presente (${rootPkg.devDependencies['ts-node']})`);
  rootPkg.devDependencies = sortObject(rootPkg.devDependencies);
  const currentWs = Array.isArray(rootPkg.workspaces) ? rootPkg.workspaces : rootPkg.workspaces?.packages ?? [];
  const mergedWs = [...new Set([...currentWs, ...REQUIRED_WORKSPACES])].sort();
  if (Array.isArray(rootPkg.workspaces) || !rootPkg.workspaces) rootPkg.workspaces = mergedWs;
  else rootPkg.workspaces.packages = mergedWs;
  writeJson(rootPkgPath, rootPkg);
  info(`workspaces: ${JSON.stringify(mergedWs)}`);

  // ---- 4. backend NestJS -------------------------------------------------
  step(`Criar módulo NestJS em apps/backend/src/modules/${name}`);
  // Mesma estrutura do `nest g module` + `nest g controller --no-spec`, gerada a partir dos assets.
  // (O CLI não é usado: seus schematics quebram quando a raiz do monorepo usa TypeScript 7,
  //  e gerar pelos assets garante resultado idêntico em toda execução.)
  writeFromAsset('backend/module.module.ts', path.join(backendModuleDir, `${name}.module.ts`), vars);
  writeFromAsset('backend/module.controller.ts', path.join(backendModuleDir, `${name}.controller.ts`), vars);
  ensureRegisteredInAppModule(appModulePath, className, name, importExt);
  info(`endpoint: GET /${name}`);

  // ---- 5. frontend Next.js ----------------------------------------------
  step(`Criar estrutura do frontend (rota ${opts.route === 'public' ? 'pública' : 'privada'})`);
  writeFromAsset('frontend/page.tsx', path.join(routeDir, 'page.tsx'), vars);
  writeFromAsset('frontend/module.page.tsx', path.join(frontendModuleDir, `${name}.page.tsx`), vars);
  writeFromAsset('frontend/module.component.tsx', path.join(frontendModuleDir, `${name}.component.tsx`), vars);
  info(`rota: /${name}`);

  // ---- 6. install / build / test ----------------------------------------
  step('Instalar dependências');
  run('npm install', root);

  step('Build do projeto');
  run('npm run build', root);

  step(`Testes do módulo ${ns}/${name}`);
  run('npm test', moduleDir);

  console.log(`\n[OK] Módulo "${name}" criado (${ns}/${name}).`);
  console.log(`  pacote   -> modules/${name}`);
  console.log(`  backend  -> apps/backend/src/modules/${name}  (GET /${name})`);
  console.log(`  frontend -> apps/frontend/src/app/(${opts.route})/${name}/page.tsx  (rota /${name})`);
}

main();
