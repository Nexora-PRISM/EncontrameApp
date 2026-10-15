import { isSofiaPaletteId } from '@/constants/sofia-palettes';

describe('paleta da Sofia', () => {
  it('aceita só os ids conhecidos', () => {
    expect(isSofiaPaletteId('green')).toBe(true);
    expect(isSofiaPaletteId('sand')).toBe(true);
    expect(isSofiaPaletteId('red')).toBe(false);
    expect(isSofiaPaletteId(null)).toBe(false);
    expect(isSofiaPaletteId(undefined)).toBe(false);
  });
});
