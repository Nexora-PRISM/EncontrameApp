import { parseTrustedContacts, trustedContactErrors, type TrustedContact } from '@/lib/trusted-contacts';

function contact(phone: string, id = 'c1'): TrustedContact {
  return { id, name: 'Ana', phone };
}

describe('contatos de confiança', () => {
  it('descarta JSON inválido e itens incompletos', () => {
    expect(parseTrustedContacts(null)).toEqual([]);
    expect(parseTrustedContacts('não é json')).toEqual([]);
    expect(parseTrustedContacts('{"a":1}')).toEqual([]);
    expect(parseTrustedContacts(JSON.stringify([{ id: '', name: 'Ana', phone: '31999998888' }]))).toEqual([]);
  });

  it('normaliza o telefone, corta o nome e para em 5 contatos', () => {
    const raw = Array.from({ length: 6 }, (_, index) => ({
      id: `c${index}`,
      name: `  Nome bem grande que passa de quarenta caracteres ${index}  `,
      phone: '(31) 99999-8888',
    }));
    raw[1].phone = '123';
    const parsed = parseTrustedContacts(JSON.stringify(raw));
    expect(parsed).toHaveLength(5);
    expect(parsed[0].phone).toBe('31999998888');
    expect(parsed[0].name.length).toBeLessThanOrEqual(40);
    expect(parsed.some((item) => item.id === 'c1')).toBe(false);
  });

  it('exige nome e telefone, e recusa número repetido', () => {
    expect(trustedContactErrors('A', '', [])).toEqual({ name: 'too_short', phone: 'required' });
    expect(trustedContactErrors('Ana', '123', [])).toEqual({ phone: 'invalid_format' });
    expect(trustedContactErrors('Ana', '31999998888', [contact('31999998888')])).toEqual({
      phone: 'already_registered',
    });
    expect(trustedContactErrors('Ana', '(31) 98888-7777', [contact('31999998888')])).toEqual({});
  });
});
