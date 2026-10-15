import { haversineKm, snapNearbyCoord } from '@/lib/geo';
import { userAccuracyRadius } from '@/lib/use-user-location';

describe('distância e precisão', () => {
  it('mede zero no mesmo ponto e cerca de 111 km por grau na linha do equador', () => {
    expect(haversineKm(-19.92, -43.94, -19.92, -43.94)).toBe(0);
    expect(haversineKm(0, 0, 0, 1)).toBeCloseTo(111.19, 1);
  });

  it('arredonda a coordenada para não refazer a busca a cada metro', () => {
    expect(snapNearbyCoord(1.234)).toBe(1.23);
    expect(snapNearbyCoord(1.235)).toBe(1.24);
  });

  it('limita o círculo de precisão entre 25 e 180 metros', () => {
    expect(userAccuracyRadius(null)).toBe(35);
    expect(userAccuracyRadius(10)).toBe(25);
    expect(userAccuracyRadius(40)).toBe(40);
    expect(userAccuracyRadius(500)).toBe(180);
  });
});
