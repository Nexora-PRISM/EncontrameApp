import * as Linking from 'expo-linking';
import { type Href, useRouter } from 'expo-router';

import { buildPetShareMessage } from '@/features/pets/pet-share';
import { showAlert } from '@/lib/dialog';
import { env } from '@/lib/env';
import { useT } from '@/lib/i18n';
import { maskPhone, onlyDigits } from '@/lib/masks';
import { canRegisterPets, PREMIUM_PLAN } from '@/lib/premium-plan';
import { shareText } from '@/lib/share';
import { useSessionUser } from '@/lib/use-session-user';
import { usePetsQuery } from '@/services/pets/pets.service';
import type { Pet } from '@/services/pets/pets.types';
import { usePremiumStatusQuery } from '@/services/premium/premium.service';

/** Lista de pets desaparecidos: todos podem ver e divulgar; cadastrar depende do plano (lib/premium-plan). */
export function usePetsController() {
  const t = useT();
  const router = useRouter();
  const user = useSessionUser();
  const enabled = env.petsEnabled;
  const petsQuery = usePetsQuery(enabled);
  const premiumQuery = usePremiumStatusQuery(enabled && PREMIUM_PLAN.petAlertsRequirePremium);

  const callOwner = (pet: Pet) => {
    const digits = onlyDigits(pet.contactPhone ?? '');
    if (!digits) return;
    void Linking.openURL(`tel:${digits}`).catch(() => {
      showAlert(
        t('Não foi possível ligar'),
        t('Disque {contactPhone} manualmente.', { contactPhone: maskPhone(digits) }),
      );
    });
  };

  return {
    enabled,
    pets: petsQuery.data ?? [],
    loading: petsQuery.isLoading,
    error: petsQuery.isError,
    refreshing: petsQuery.isRefetching,
    refresh: () => {
      void petsQuery.refetch();
    },
    loggedIn: user != null,
    /** Cadastrar pet exige Premium? (chave em lib/premium-plan.ts) */
    petsRequirePremium: PREMIUM_PLAN.petAlertsRequirePremium,
    canRegister: canRegisterPets(user != null, premiumQuery.data?.active === true),
    premiumLoading: PREMIUM_PLAN.petAlertsRequirePremium && premiumQuery.isLoading,
    goToPremium: () => router.push('/premium' as Href),
    goToRegister: () => router.push('/cadastrar-pet' as Href),
    goToLogin: () => router.push({ pathname: '/login', params: { returnTo: '/cadastrar-pet' } } as Href),
    share: (pet: Pet) => {
      void shareText(buildPetShareMessage(pet, t), t('Pet desaparecido: {name}', { name: pet.name }));
    },
    callOwner,
  };
}

export type PetsController = ReturnType<typeof usePetsController>;
