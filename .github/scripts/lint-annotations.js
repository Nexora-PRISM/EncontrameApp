#!/usr/bin/env node
/**
 * Transforma o relatório JSON do ESLint em anotações do GitHub Actions (arquivo, linha e mensagem).
 * Cobre também os erros sem nome de regra (ex.: "Parsing error"), que o leitor padrão do GitHub ignora.
 *
 *   node .github/scripts/lint-annotations.js eslint-report.json
 */
const fs = require('fs');
const path = require('path');

const file = process.argv[2] ?? 'eslint-report.json';
if (!fs.existsSync(file)) {
  console.log(`::error title=ESLint::O ESLint não gerou o relatório (${file}). Veja o log do passo.`);
  process.exit(0);
}

const clean = (text) => String(text).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
const results = JSON.parse(fs.readFileSync(file, 'utf8'));
let errors = 0;
let warnings = 0;
for (const result of results) {
  const relative = path.relative(process.cwd(), result.filePath);
  for (const message of result.messages) {
    const level = message.severity === 2 ? 'error' : 'warning';
    if (level === 'error') errors += 1;
    else warnings += 1;
    const rule = message.ruleId ? ` (${message.ruleId})` : '';
    console.log(
      `::${level} file=${relative},line=${message.line ?? 1},col=${message.column ?? 1},title=ESLint::${clean(message.message)}${rule}`,
    );
    console.log(`${relative}:${message.line ?? 1}:${message.column ?? 1} ${level} ${message.message}${rule}`);
  }
}
console.log(`ESLint: ${errors} erro(s), ${warnings} aviso(s).`);
