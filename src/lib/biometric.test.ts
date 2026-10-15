import { biometricCopy } from '@/lib/biometric';

describe('textos da biometria', () => {
  it('escolhe o texto de Face ID, digital ou o genérico', () => {
    expect(biometricCopy('face').loginButton).toBe('Entrar com Face ID');
    expect(biometricCopy('fingerprint').loginButton).toBe('Entrar com a digital');
    expect(biometricCopy('generic').loginButton).toBe('Entrar com biometria');
    expect(biometricCopy('face').icon).toBe('face-recognition');
    expect(biometricCopy('generic').icon).toBe('fingerprint');
  });
});
