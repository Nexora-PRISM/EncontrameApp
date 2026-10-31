/**
 * Pacote criptografado da exportação: o ZIP é cifrado com AES-256-GCM (chave derivada da senha por PBKDF2-SHA-256)
 * e embutido numa página HTML que se abre em qualquer navegador moderno, sem instalar nada. Quem recebe digita a
 * senha — que deve chegar por outro canal — e baixa o ZIP original.
 *
 * Usa a Web Crypto do navegador (`crypto.subtle`). No celular, o app mostra que este recurso é da versão web.
 */

export const PBKDF2_ITERATIONS = 310_000;

export type EncryptedPayload = {
  salt: Uint8Array;
  iv: Uint8Array;
  iterations: number;
  ciphertext: Uint8Array;
};

type CryptoLike = { subtle: SubtleCrypto; getRandomValues<T extends ArrayBufferView>(array: T): T };

export function webCrypto(): CryptoLike | null {
  const candidate = (globalThis as { crypto?: CryptoLike }).crypto;
  return candidate && candidate.subtle && typeof candidate.getRandomValues === 'function' ? candidate : null;
}

/** Cópia num ArrayBuffer próprio (a Web Crypto e o Blob não aceitam visões de buffers compartilhados). */
export function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  return copy.buffer;
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function toBase64(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = bytes[i + 1];
    const c = bytes[i + 2];
    out += B64[a >> 2];
    out += B64[((a & 3) << 4) | ((b ?? 0) >> 4)];
    out += b == null ? '=' : B64[((b & 15) << 2) | ((c ?? 0) >> 6)];
    out += c == null ? '=' : B64[c & 63];
  }
  return out;
}

export function fromBase64(text: string): Uint8Array {
  const clean = text.replace(/[^A-Za-z0-9+/]/g, '');
  const out: number[] = [];
  for (let i = 0; i < clean.length; i += 4) {
    const n = [0, 1, 2, 3].map((k) => (i + k < clean.length ? B64.indexOf(clean[i + k]) : -1));
    out.push((n[0] << 2) | (n[1] >> 4));
    if (n[2] >= 0) out.push(((n[1] & 15) << 4) | (n[2] >> 2));
    if (n[3] >= 0) out.push(((n[2] & 3) << 6) | n[3]);
  }
  return Uint8Array.from(out);
}

async function deriveKey(cryptoImpl: CryptoLike, password: string, salt: Uint8Array, iterations: number) {
  const material = await cryptoImpl.subtle.importKey(
    'raw',
    toArrayBuffer(new TextEncoder().encode(password)),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return cryptoImpl.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt: toArrayBuffer(salt), iterations },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptBytes(
  data: Uint8Array,
  password: string,
  cryptoImpl: CryptoLike | null = webCrypto(),
  iterations = PBKDF2_ITERATIONS,
): Promise<EncryptedPayload> {
  if (!cryptoImpl) throw new Error('webcrypto-unavailable');
  const salt = cryptoImpl.getRandomValues(new Uint8Array(16));
  const iv = cryptoImpl.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(cryptoImpl, password, salt, iterations);
  const ciphertext = new Uint8Array(
    await cryptoImpl.subtle.encrypt({ name: 'AES-GCM', iv: toArrayBuffer(iv) }, key, toArrayBuffer(data)),
  );
  return { salt, iv, iterations, ciphertext };
}

export async function decryptBytes(
  payload: EncryptedPayload,
  password: string,
  cryptoImpl: CryptoLike | null = webCrypto(),
): Promise<Uint8Array> {
  if (!cryptoImpl) throw new Error('webcrypto-unavailable');
  const key = await deriveKey(cryptoImpl, password, payload.salt, payload.iterations);
  return new Uint8Array(
    await cryptoImpl.subtle.decrypt(
      { name: 'AES-GCM', iv: toArrayBuffer(payload.iv) },
      key,
      toArrayBuffer(payload.ciphertext),
    ),
  );
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Página HTML autossuficiente (sem nada da internet) que pede a senha, decifra e oferece o ZIP para baixar.
 * O texto é em português, como o pacote enviado às autoridades brasileiras.
 */
export function decryptorHtml(
  payload: EncryptedPayload,
  meta: { fileName: string; caseReference: string; generatedAt: string },
): string {
  const data = JSON.stringify({
    salt: toBase64(payload.salt),
    iv: toBase64(payload.iv),
    iterations: payload.iterations,
    ciphertext: toBase64(payload.ciphertext),
    fileName: meta.fileName,
  });
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pacote protegido — Encontra-me</title>
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:640px;margin:40px auto;padding:0 16px;color:CanvasText;background:Canvas}
h1{font-size:22px}p{line-height:1.5}input{font-size:18px;padding:10px;width:100%;box-sizing:border-box;margin:8px 0}
button{font-size:18px;padding:10px 18px;border-radius:8px;border:0;background:navy;color:white;cursor:pointer}
#msg{margin-top:12px;font-weight:600}.muted{color:GrayText;font-size:14px}
</style>
</head>
<body>
<h1>Pacote protegido — Encontra-me</h1>
<p>Caso: <strong>${escapeHtml(meta.caseReference)}</strong><br>Gerado em: ${escapeHtml(meta.generatedAt)}</p>
<p>Digite a senha recebida por outro canal (telefone ou mensagem separada). O arquivo é decifrado neste computador; nada é enviado pela internet.</p>
<label for="pw">Senha</label>
<input id="pw" type="password" autocomplete="off">
<button id="go" type="button">Abrir pacote</button>
<p id="msg" role="status"></p>
<p class="muted">Cifra AES-256-GCM, chave derivada com PBKDF2-SHA-256. Depois de abrir, confira os arquivos com o manifesto de integridade (SHA-256) que está dentro do ZIP.</p>
<script id="payload" type="application/json">${data.replace(/</g, '\\u003c')}</script>
<script>
(function(){
  var p = JSON.parse(document.getElementById('payload').textContent);
  function b64(s){var bin=atob(s);var out=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out;}
  var msg=document.getElementById('msg');
  document.getElementById('go').addEventListener('click', async function(){
    msg.textContent='Abrindo…';
    try{
      var pw=document.getElementById('pw').value;
      var material=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveKey']);
      var key=await crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt:b64(p.salt),iterations:p.iterations},material,{name:'AES-GCM',length:256},false,['decrypt']);
      var plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64(p.iv)},key,b64(p.ciphertext));
      var url=URL.createObjectURL(new Blob([plain],{type:'application/zip'}));
      var a=document.createElement('a');a.href=url;a.download=p.fileName;a.id='download';a.textContent='Baixar '+p.fileName;
      msg.textContent='Senha correta. ';msg.appendChild(a);a.click();
    }catch(e){msg.textContent='Senha incorreta ou arquivo danificado.';}
  });
})();
</script>
</body>
</html>
`;
}
