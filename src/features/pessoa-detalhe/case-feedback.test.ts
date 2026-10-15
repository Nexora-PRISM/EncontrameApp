import { buildCaseFeedbackMessage } from '@/features/pessoa-detalhe/case-feedback';

const person = { id: 'caso-9', fullName: 'Ana Silva' };

describe('pedido sobre um caso', () => {
  it('inclui a identificação do caso na correção e na denúncia', () => {
    const correction = buildCaseFeedbackMessage('correcao', person);
    const report = buildCaseFeedbackMessage('denuncia', person);
    expect(correction).toContain('Ana Silva');
    expect(correction).toContain('caso-9');
    expect(correction).toContain('O que precisa mudar');
    expect(report).toContain('caso-9');
    expect(report).toContain('Motivo');
    expect(report).not.toContain('O que precisa mudar');
  });
});
