#!/usr/bin/env node
/**
 * Testes das regras puras do app (sem React Native): avisos de segurança, vínculo e boletim de
 * ocorrência, proteção de identidade, alerta de possível desaparecimento e privacidade dos
 * avistamentos.
 *
 *   npm run test:regras
 *
 * Usa o `node:test` do próprio Node e o TypeScript do projeto para transpilar os arquivos de
 * `src/` na hora (só o necessário, em CommonJS). Os alias `@/` apontam para `src/`.
 * Módulos que dependem do React (i18n) são trocados por versões simples, em português.
 */
const fs = require('fs');
const Module = require('module');
const path = require('path');
const ts = require('typescript');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

/** Substitutos de módulos que puxam React/Expo. */
const STUBS = {
  '@/lib/i18n': {
    ptTranslate: (text, vars) =>
      vars ? text.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match)) : text,
  },
};

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function resolve(request, parent, ...rest) {
  if (request in STUBS) return request;
  if (request.startsWith('@/')) {
    const base = path.join(SRC, request.slice(2));
    for (const candidate of [`${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts')]) {
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return originalResolve.call(this, request, parent, ...rest);
};

const originalLoad = Module._load;
Module._load = function load(request, parent, ...rest) {
  if (request in STUBS) return STUBS[request];
  return originalLoad.call(this, request, parent, ...rest);
};

for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (module, filename) => {
    const source = fs.readFileSync(filename, 'utf8');
    const { outputText } = ts.transpileModule(source, {
      fileName: filename,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    });
    module._compile(outputText, filename);
  };
}

// `__DEV__` existe no app (Metro); aqui não há.
globalThis.__DEV__ = false;

require('./regras.test.js');
