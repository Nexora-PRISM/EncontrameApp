import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { test } from 'node:test';

import { decryptBytes, decryptorHtml, encryptBytes, fromBase64, toBase64 } from '../src/lib/encrypted-package.ts';
import { sha256Hex, sha256Text, utf8Bytes } from '../src/lib/sha256.ts';
import { buildZip, crc32, safeZipName } from '../src/lib/zip-writer.ts';

test('SHA-256 igual ao do Node (textos, acentos, emoji e limites de bloco)', () => {
  for (const text of ['', 'abc', 'a'.repeat(55), 'a'.repeat(56), 'a'.repeat(64), 'ação 😀 ç', 'x'.repeat(5000)]) {
    assert.equal(sha256Text(text), createHash('sha256').update(text, 'utf8').digest('hex'), text.slice(0, 12));
  }
  const bytes = Uint8Array.from({ length: 70000 }, (_, i) => (i * 7919) % 256);
  assert.equal(sha256Hex(bytes), createHash('sha256').update(bytes).digest('hex'));
  // Vetor oficial (FIPS 180-2): "abc".
  assert.equal(sha256Text('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('UTF-8 igual ao do Node', () => {
  for (const text of ['ação', '😀', 'Ω≈ç√', '\u0000a']) {
    assert.deepEqual([...utf8Bytes(text)], [...Buffer.from(text, 'utf8')]);
  }
});

/** Leitor mínimo de ZIP (diretório central) só para conferir o que o gerador escreveu. */
function readZip(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const end = bytes.length - 22;
  assert.equal(view.getUint32(end, true), 0x06054b50);
  const count = view.getUint16(end + 10, true);
  let offset = view.getUint32(end + 16, true);
  const files = [];
  for (let i = 0; i < count; i += 1) {
    assert.equal(view.getUint32(offset, true), 0x02014b50);
    const crc = view.getUint32(offset + 16, true);
    const size = view.getUint32(offset + 24, true);
    const nameLength = view.getUint16(offset + 28, true);
    const local = view.getUint32(offset + 42, true);
    const name = Buffer.from(bytes.subarray(offset + 46, offset + 46 + nameLength)).toString('utf8');
    const localNameLength = view.getUint16(local + 26, true);
    const data = bytes.subarray(local + 30 + localNameLength, local + 30 + localNameLength + size);
    files.push({ name, crc, data });
    offset += 46 + nameLength;
  }
  return files;
}

test('ZIP: nomes UTF-8, CRC correto, nomes repetidos não se sobrescrevem, caminho seguro', () => {
  assert.equal(crc32(utf8Bytes('123456789')).toString(16), 'cbf43926');
  const zip = buildZip(
    [
      { name: 'leia-me.txt', data: utf8Bytes('Olá') },
      { name: 'anexos/relatório.html', data: utf8Bytes('<h1>ação</h1>') },
      { name: 'leia-me.txt', data: utf8Bytes('outro') },
      { name: '../../etc/passwd', data: utf8Bytes('x') },
    ],
    new Date(2026, 9, 30, 12, 0, 0),
  );
  const files = readZip(zip);
  assert.deepEqual(
    files.map((file) => file.name),
    ['leia-me.txt', 'anexos/relatório.html', 'leia-me-2.txt', 'etc/passwd'],
  );
  for (const file of files) assert.equal(file.crc, crc32(file.data));
  assert.equal(Buffer.from(files[1].data).toString('utf8'), '<h1>ação</h1>');
  assert.equal(safeZipName('a/./b/../c:d.txt'), 'a/b/c_d.txt');
});

test('Base64 igual ao do Node', () => {
  for (const length of [0, 1, 2, 3, 4, 5, 100]) {
    const bytes = Uint8Array.from({ length }, (_, i) => (i * 37) % 256);
    assert.equal(toBase64(bytes), Buffer.from(bytes).toString('base64'));
    assert.deepEqual([...fromBase64(toBase64(bytes))], [...bytes]);
  }
});

test('pacote criptografado: abre com a senha certa e recusa a errada', async () => {
  const data = buildZip([{ name: 'a.txt', data: utf8Bytes('conteúdo de teste') }]);
  const payload = await encryptBytes(data, 'K7QH-M2XA-TEST', globalThis.crypto, 1000);
  assert.notDeepEqual([...payload.ciphertext.subarray(0, 16)], [...data.subarray(0, 16)]);
  assert.deepEqual([...(await decryptBytes(payload, 'K7QH-M2XA-TEST', globalThis.crypto))], [...data]);
  await assert.rejects(() => decryptBytes(payload, 'senha-errada', globalThis.crypto));
  const html = decryptorHtml(payload, { fileName: 'pacote.zip', caseReference: '<script>x</script>', generatedAt: 'hoje' });
  assert.match(html, /AES-256-GCM/);
  assert.doesNotMatch(html, /<script>x<\/script>/);
  assert.doesNotMatch(html, /https?:\/\//);
});
