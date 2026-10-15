import {
  MAX_PHOTO_BYTES,
  estimateBase64Bytes,
  isAllowedPhotoFile,
  photoSizeError,
  stripDataUrlPrefix,
} from '@/lib/photo';

describe('foto do cadastro', () => {
  it('tira o prefixo da data URL e estima o tamanho', () => {
    expect(stripDataUrlPrefix('data:image/jpeg;base64,QQ==')).toBe('QQ==');
    expect(stripDataUrlPrefix('QQ==')).toBe('QQ==');
    expect(estimateBase64Bytes('')).toBe(0);
    expect(estimateBase64Bytes('QQ==')).toBe(1);
  });

  it('aceita PNG e JPG pelo tipo ou pela extensão', () => {
    expect(isAllowedPhotoFile('image/png', 'foto.png')).toBe(true);
    expect(isAllowedPhotoFile('image/jpeg', 'foto')).toBe(true);
    expect(isAllowedPhotoFile('', 'foto.JPEG')).toBe(true);
    expect(isAllowedPhotoFile('image/gif', 'foto.gif')).toBe(false);
  });

  it('recusa base64 vazio e arquivo acima de 2 MB', () => {
    expect(photoSizeError('')).toBe('photo_empty');
    expect(photoSizeError('data:image/png;base64,')).toBe('photo_empty');
    expect(photoSizeError('A'.repeat(3_000_000))).toBe('photo_too_large');
    expect(photoSizeError('data:image/jpeg;base64,QQ==')).toBeUndefined();
    expect(photoSizeError('A'.repeat(100), 10)).toBe('photo_too_large');
    expect(MAX_PHOTO_BYTES).toBe(2 * 1024 * 1024);
  });
});
