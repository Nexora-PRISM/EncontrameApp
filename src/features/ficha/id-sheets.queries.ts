import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { IdSheet } from '@/lib/id-sheet-rules';
import { deleteIdSheet, getIdSheet, listIdSheets, saveIdSheet } from '@/lib/id-sheet-store';

/** Fichas de identificação: dados só deste aparelho (sem API). Cada leitura apaga a foto do dia vencida. */
const keys = {
  all: ['id-sheets'] as const,
  one: (id: string) => ['id-sheets', id] as const,
};

export function useIdSheetsQuery() {
  return useQuery({ queryKey: keys.all, queryFn: listIdSheets, staleTime: 0 });
}

export function useIdSheetQuery(id: string | null) {
  return useQuery({
    queryKey: keys.one(id ?? 'nova'),
    queryFn: () => getIdSheet(id as string),
    enabled: id !== null,
    staleTime: 0,
  });
}

export function useIdSheetActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: keys.all });
  return {
    save: useMutation({ mutationFn: (sheet: IdSheet) => saveIdSheet(sheet), onSuccess: refresh }),
    remove: useMutation({ mutationFn: (id: string) => deleteIdSheet(id), onSuccess: refresh }),
  };
}
