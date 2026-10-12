#!/usr/bin/env node
/**
 * Confere as traduções do app (src/translations/*.ts) contra os textos usados no código.
 *
 * Um texto entra na lista quando aparece como primeiro argumento literal de `t()`, `tr()` ou
 * `msg()` (inclusive nos dois lados de `?:`, `??` e `||`). O texto em português é a chave.
 *
 *   node scripts/check-i18n.js            → lista o que falta; falha só em erro de estrutura
 *   node scripts/check-i18n.js --strict   → falha também se faltar tradução ou sobrar chave
 *
 * Erros de estrutura: variáveis `{nome}` diferentes do original, tradução vazia, chave repetida.
 */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const TRANSLATIONS = path.join(SRC, 'translations');
const CALLS = new Set(['t', 'tr', 'msg']);
const strict = process.argv.includes('--strict');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (full !== TRANSLATIONS) walk(full, out);
    } else if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
      out.push(full);
    }
  }
  return out;
}

function parse(file) {
  const kind = file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  return ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, kind);
}

function literals(node, out) {
  if (!node) return out;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    out.push(node.text);
  } else if (ts.isParenthesizedExpression(node)) {
    literals(node.expression, out);
  } else if (ts.isConditionalExpression(node)) {
    literals(node.whenTrue, out);
    literals(node.whenFalse, out);
  } else if (
    ts.isBinaryExpression(node) &&
    (node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken ||
      node.operatorToken.kind === ts.SyntaxKind.BarBarToken)
  ) {
    literals(node.left, out);
    literals(node.right, out);
  }
  return out;
}

/** Textos usados no código → primeiro lugar onde aparecem. */
function collectKeys() {
  const keys = new Map();
  for (const file of walk(SRC).sort()) {
    const source = parse(file);
    const visit = (node) => {
      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        CALLS.has(node.expression.text) &&
        node.arguments.length > 0
      ) {
        for (const text of literals(node.arguments[0], [])) {
          if (!keys.has(text)) {
            const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
            keys.set(text, `${path.relative(ROOT, file)}:${line + 1}`);
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  return keys;
}

/** Lê `export const xx = { 'chave': 'valor', … }` de um arquivo de tradução. */
function readDictionary(file) {
  const source = parse(file);
  const entries = new Map();
  const problems = [];
  const visit = (node) => {
    if (ts.isObjectLiteralExpression(node)) {
      for (const prop of node.properties) {
        if (!ts.isPropertyAssignment(prop)) continue;
        const name =
          ts.isStringLiteral(prop.name) || ts.isIdentifier(prop.name) ? prop.name.text : undefined;
        const init = prop.initializer;
        if (name == null) continue;
        if (!(ts.isStringLiteral(init) || ts.isNoSubstitutionTemplateLiteral(init))) {
          problems.push(`valor não é texto fixo: ${JSON.stringify(name)}`);
          continue;
        }
        if (entries.has(name)) problems.push(`chave repetida: ${JSON.stringify(name)}`);
        entries.set(name, init.text);
      }
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return { entries, problems };
}

function placeholders(text) {
  return [...text.matchAll(/\{(\w+)\}/g)]
    .map((match) => match[1])
    .sort()
    .join(', ');
}

function short(text) {
  const oneLine = text.replace(/\n/g, '\\n');
  return JSON.stringify(oneLine.length > 90 ? `${oneLine.slice(0, 87)}...` : oneLine);
}

const keys = collectKeys();
const languages = fs
  .readdirSync(TRANSLATIONS)
  .filter((name) => /^[a-z]{2}(-[A-Z]{2})?\.ts$/.test(name))
  .map((name) => name.replace(/\.ts$/, ''));

let structuralErrors = 0;
let gaps = 0;

console.log(`Textos no app: ${keys.size}`);
for (const language of languages) {
  const { entries, problems } = readDictionary(path.join(TRANSLATIONS, `${language}.ts`));
  const errors = [...problems];
  const missing = [];
  const unused = [];

  for (const [key, where] of keys) {
    if (!entries.has(key)) {
      missing.push(`  ${short(key)}  (${where})`);
      continue;
    }
    const value = entries.get(key);
    if (!value.trim()) errors.push(`tradução vazia: ${short(key)}`);
    if (placeholders(value) !== placeholders(key)) {
      errors.push(
        `variáveis diferentes em ${short(key)}: original {${placeholders(key)}}, tradução {${placeholders(value)}}`,
      );
    }
  }
  for (const key of entries.keys()) {
    if (!keys.has(key)) unused.push(`  ${short(key)}`);
  }

  console.log(
    `\n[${language}] ${entries.size} traduções · faltam ${missing.length} · sem uso ${unused.length} · erros ${errors.length}`,
  );
  if (errors.length) console.log(errors.map((line) => `  ERRO: ${line}`).join('\n'));
  if (missing.length) console.log(`  Sem tradução (aparece em português):\n${missing.join('\n')}`);
  if (unused.length) console.log(`  Não usadas no app (podem ser apagadas):\n${unused.join('\n')}`);

  structuralErrors += errors.length;
  gaps += missing.length + unused.length;
}

if (structuralErrors > 0 || (strict && gaps > 0)) {
  console.log('\nTraduções com problemas.');
  process.exit(1);
}
console.log(gaps > 0 ? '\nOK (com pendências — use --strict para exigir tudo traduzido).' : '\nOK.');
