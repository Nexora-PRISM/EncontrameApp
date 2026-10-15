import { coordsFromPlaceLocation } from '@/lib/google-maps-web';

describe('coordenada de um lugar', () => {
  it('aceita números e funções lat/lng', () => {
    expect(coordsFromPlaceLocation({ lat: -19.9, lng: -43.9 })).toEqual({ lat: -19.9, lng: -43.9 });
    expect(
      coordsFromPlaceLocation({
        lat() {
          return 1;
        },
        lng() {
          return 2;
        },
      }),
    ).toEqual({ lat: 1, lng: 2 });
  });

  it('devolve nulo sem lugar ou com valor que não é número', () => {
    expect(coordsFromPlaceLocation(undefined)).toBeNull();
    expect(coordsFromPlaceLocation({ lat: 'a' as unknown as number, lng: 1 })).toBeNull();
  });
});
