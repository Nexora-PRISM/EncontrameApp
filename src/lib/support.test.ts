import {
  SUPPORT_MESSAGE_MAX,
  SUPPORT_MESSAGE_MIN,
  buildSupportMailto,
  clampSupportMessage,
  supportMessageError,
} from '@/lib/support';

describe('e-mail de suporte', () => {
  it('monta o mailto com assunto, mensagem e conta quando houver', () => {
    const url = buildSupportMailto({
      topic: 'duvida',
      message: '  Preciso de ajuda com o login  ',
      accountEmail: 'ana@exemplo.com',
    });
    expect(url.startsWith('mailto:contato@nexoraprism.com.br?')).toBe(true);
    expect(decodeURIComponent(url)).toContain('Dúvida sobre o app');
    expect(decodeURIComponent(url)).toContain('Preciso de ajuda com o login');
    expect(decodeURIComponent(url)).toContain('Conta: ana@exemplo.com');
  });

  it('omite a conta quando a pessoa não está logada', () => {
    const url = buildSupportMailto({ topic: 'denuncia', message: 'Cadastro suspeito neste caso' });
    expect(decodeURIComponent(url)).not.toContain('Conta:');
  });

  it('exige pelo menos 10 caracteres e corta o que passa de 2000', () => {
    expect(supportMessageError('curto')).toBe('too_short');
    expect(supportMessageError('   123456789   ')).toBe('too_short');
    expect(supportMessageError('1234567890')).toBeUndefined();
    expect(SUPPORT_MESSAGE_MIN).toBe(10);
    expect(clampSupportMessage('a'.repeat(SUPPORT_MESSAGE_MAX + 20))).toHaveLength(SUPPORT_MESSAGE_MAX);
  });
});
