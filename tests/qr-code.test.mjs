// Testes do gerador de QR Code. Rodar com `npm test`.
// Os dois QR Codes de referência abaixo foram decodificados com OpenCV (cv2.QRCodeDetector) e devolveram o
// texto original (docs/evolucao/TESTES.md, etapa 3). O hash protege contra mudanças acidentais no gerador.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { describe, it } from 'node:test';

import { encodeQr, qrDarkRuns, qrPenalty, qrVersionFor } from '../src/lib/qr-code.ts';

const CASE_URL = 'https://encontrame.nexoraprism.com.br/pessoa/123';
const ACCENTS = 'Ação, coração e São Paulo — teste de acentuação 😀';

function matrixHash(matrix) {
  const text = matrix.modules.map((row) => row.map((dark) => (dark ? '1' : '0')).join('')).join('\n');
  return createHash('sha256').update(text).digest('hex');
}

/** Lê os 15 bits de formato da primeira cópia e confere o código BCH. */
function readFormat(modules) {
  const bits = [
    ...[0, 1, 2, 3, 4, 5].map((i) => modules[i][8]),
    modules[7][8],
    modules[8][8],
    modules[8][7],
    ...[9, 10, 11, 12, 13, 14].map((i) => modules[8][14 - i]),
  ];
  const value = bits.reduce((acc, bit, i) => acc | ((bit ? 1 : 0) << i), 0) ^ 0x5412;
  const data = value >> 10;
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  return { level: data >> 3, mask: data & 7, bchOk: ((data << 10) | rem) === value };
}

describe('versão e tamanho', () => {
  it('escolhe a menor versão que cabe', () => {
    assert.equal(qrVersionFor('A'), 1);
    assert.equal(qrVersionFor(CASE_URL), 4);
    assert.equal(qrVersionFor('w'.repeat(213)), 10);
  });

  it('recusa texto vazio ou maior que a versão 10', () => {
    assert.equal(encodeQr(''), null);
    assert.equal(encodeQr('w'.repeat(214)), null);
    assert.equal(qrVersionFor('w'.repeat(214)), null);
  });

  it('o lado tem 17 + 4 × versão módulos', () => {
    const matrix = encodeQr(CASE_URL);
    assert.equal(matrix.size, 33);
    assert.equal(matrix.modules.length, 33);
    assert.ok(matrix.modules.every((row) => row.length === 33));
  });
});

describe('estrutura', () => {
  const matrix = encodeQr(CASE_URL);
  const m = matrix.modules;

  it('tem os três padrões de localização nos cantos', () => {
    for (const [x0, y0] of [[0, 0], [matrix.size - 7, 0], [0, matrix.size - 7]]) {
      for (let dy = 0; dy < 7; dy++) {
        for (let dx = 0; dx < 7; dx++) {
          const ring = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
          assert.equal(m[y0 + dy][x0 + dx], ring !== 2, `canto ${x0},${y0} módulo ${dx},${dy}`);
        }
      }
    }
  });

  it('tem as linhas de sincronismo alternadas', () => {
    for (let i = 8; i < matrix.size - 8; i++) {
      assert.equal(m[6][i], i % 2 === 0);
      assert.equal(m[i][6], i % 2 === 0);
    }
  });

  it('formato válido: nível M e máscara de 0 a 7, com o módulo escuro fixo', () => {
    const format = readFormat(m);
    assert.equal(format.bchOk, true);
    assert.equal(format.level, 0);
    assert.ok(format.mask >= 0 && format.mask <= 7);
    assert.equal(m[matrix.size - 8][8], true);
  });

  it('versão 7 ou maior traz os blocos de versão', () => {
    const v7 = encodeQr('x'.repeat(120));
    assert.equal(v7.version, 7);
    // primeiro bit da informação de versão 7 (000111110010010100) fica em (size-11, 0)
    assert.equal(v7.modules[0][v7.size - 11], false);
  });
});

describe('referências decodificadas com OpenCV', () => {
  it('link de caso', () => {
    assert.equal(matrixHash(encodeQr(CASE_URL)), '58af52b2ab603e96f4456b981cc7b157ec25e309cc1aba4931d6163728ca37d8');
  });

  it('acentos e emoji em UTF-8', () => {
    assert.equal(matrixHash(encodeQr(ACCENTS)), '830dc5d61e3f1a9a4a70fd55e1ee211ff264d2a02a76969cac1066460e31e3ca');
  });
});

describe('desenho', () => {
  it('os trechos escuros cobrem exatamente os módulos escuros', () => {
    const matrix = encodeQr(CASE_URL);
    const dark = matrix.modules.flat().filter(Boolean).length;
    const covered = qrDarkRuns(matrix).reduce((sum, run) => sum + run.length, 0);
    assert.equal(covered, dark);
    assert.ok(qrDarkRuns(matrix).length < dark);
  });

  it('penalidade é um número não negativo', () => {
    assert.ok(qrPenalty(encodeQr(CASE_URL).modules) >= 0);
  });
});
