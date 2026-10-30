import type { CollaborationRepository } from '@/services/collaboration/collaboration.repository';
import type { VolunteerProfile } from '@/services/collaboration/collaboration.types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const receipt = () => ({
  id: `TESTE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
  receivedAt: new Date().toISOString(),
  simulated: true,
});

/** Modo de demonstração: nada sai do aparelho. */
let volunteer: VolunteerProfile | null = null;

export const collaborationMockRepository: CollaborationRepository = {
  async getVolunteer() {
    await delay(200);
    return volunteer;
  },
  async saveVolunteer(profile) {
    await delay(400);
    volunteer = profile;
    return receipt();
  },
  async leaveVolunteer() {
    await delay(300);
    volunteer = null;
  },
  async suggestRegion() {
    await delay(400);
    return receipt();
  },
};
