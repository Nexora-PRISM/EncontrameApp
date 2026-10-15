import {
  buildLocationMessage,
  describeAccuracy,
  formatClock,
  mapsLink,
  smsLink,
  toBrazilPhoneWithCountry,
  whatsappLink,
} from '@/lib/location-share';

const location = {
  latitude: -19.9167,
  longitude: -43.9345,
  accuracy: 12.4,
  capturedAt: new Date(2026, 5, 15, 20, 31).getTime(),
};

describe('mensagem de localização', () => {
  it('monta o link do mapa e a hora local', () => {
    expect(mapsLink(-19.9167, -43.9345)).toBe('https://maps.google.com/?q=-19.916700,-43.934500');
    expect(formatClock(location.capturedAt)).toBe('20:31');
  });

  it('diferencia emergência de compartilhamento e avisa quando o GPS falha', () => {
    const emergency = buildLocationMessage(location, 'emergency');
    const share = buildLocationMessage(location, 'share');
    expect(emergency).toContain('PRECISO DE AJUDA.');
    expect(emergency).toContain('ligue 190');
    expect(emergency).toContain('precisão de cerca de 12 m');
    expect(share).not.toContain('PRECISO DE AJUDA.');
    expect(share).not.toContain('ligue 190');
    expect(buildLocationMessage(null, 'share')).toContain('Não consegui pegar minha localização');
  });

  it('ignora precisão inválida e arredonda para pelo menos 5 metros', () => {
    expect(describeAccuracy(null)).toBeNull();
    expect(describeAccuracy(0)).toBeNull();
    expect(describeAccuracy(3)).toBe('precisão de cerca de 5 m');
  });

  it('normaliza o telefone brasileiro e monta WhatsApp e SMS', () => {
    expect(toBrazilPhoneWithCountry('(31) 99999-8888')).toBe('5531999998888');
    expect(toBrazilPhoneWithCountry('031999998888')).toBe('5531999998888');
    expect(toBrazilPhoneWithCountry('+55 31 99999-8888')).toBe('5531999998888');
    expect(toBrazilPhoneWithCountry('123')).toBeNull();
    expect(toBrazilPhoneWithCountry('00999998888')).toBeNull();
    expect(whatsappLink('5531999998888', 'oi')).toBe('https://wa.me/5531999998888?text=oi');
    expect(smsLink('5531999998888', 'oi', 'ios')).toBe('sms:+5531999998888&body=oi');
    expect(smsLink('5531999998888', 'oi', 'android')).toBe('sms:+5531999998888?body=oi');
  });
});
