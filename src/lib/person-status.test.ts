import { Brand } from '@/constants/brand';
import {
  isLocalPersonId,
  isPersonAlertStatus,
  resolvePersonStatusColor,
  resolvePersonStatusOnColor,
} from '@/lib/person-status';

describe('status da pessoa', () => {
  it('reconhece o id gravado só no aparelho', () => {
    expect(isLocalPersonId('local-abc')).toBe(true);
    expect(isLocalPersonId('42')).toBe(false);
  });

  it('pinta o badge pelo id e, na falta dele, pelo texto', () => {
    expect(resolvePersonStatusColor(Brand, 0)).toBe(Brand.statusCadastroPendente);
    expect(resolvePersonStatusColor(Brand, 1)).toBe(Brand.statusPendente);
    expect(resolvePersonStatusColor(Brand, 2)).toBe(Brand.statusProcurando);
    expect(resolvePersonStatusColor(Brand, 3)).toBe(Brand.statusEncontrado);
    expect(resolvePersonStatusColor(Brand, 4)).toBe(Brand.statusAlerta);
    expect(resolvePersonStatusColor(Brand, 99)).toBe(Brand.statusCancelado);
    expect(resolvePersonStatusColor(Brand, undefined, 'Procurando')).toBe(Brand.statusProcurando);
    expect(resolvePersonStatusColor(Brand, undefined, 'desconhecido')).toBe(Brand.statusCancelado);
    expect(resolvePersonStatusOnColor(Brand)).toBe(Brand.onStatusBadge);
  });

  it('marca alerta pelo id ou pela descrição', () => {
    expect(isPersonAlertStatus(4)).toBe(true);
    expect(isPersonAlertStatus(2, 'em alerta')).toBe(true);
    expect(isPersonAlertStatus(2, 'Procurando')).toBe(false);
  });
});
