/**
 * Junta partes de endereço sem repetir trechos. O cadastro de caso manda o texto de "Localidade"
 * em `location` e em `city` (para a busca por cidade achar o caso), e a API monta o "último local"
 * juntando os dois: "Praça Sete, BH, Praça Sete, BH". Aqui cada trecho aparece uma vez só.
 * Sem imports, para os testes rodarem direto no Node.
 */
export function uniqueAddressText(text: string | null | undefined): string | undefined {
  if (!text) return undefined;
  const seen = new Set<string>();
  const parts: string[] = [];
  for (const raw of text.split(',')) {
    const part = raw.trim();
    const key = part.toLocaleLowerCase('pt-BR');
    if (!part || seen.has(key)) continue;
    seen.add(key);
    parts.push(part);
  }
  return parts.length ? parts.join(', ') : undefined;
}
