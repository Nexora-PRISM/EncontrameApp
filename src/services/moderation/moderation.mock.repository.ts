import type { ModerationRepository } from '@/services/moderation/moderation.repository';
import type { ReportContentPayload } from '@/services/moderation/moderation.types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const blockedUserIds = new Set<string>();
const reports: ReportContentPayload[] = [];

/** O mock do grupo e das fichas usa isto para esconder o conteúdo de quem foi bloqueado. */
export function isUserBlocked(userId: string): boolean {
  return blockedUserIds.has(userId);
}

export const moderationMockRepository: ModerationRepository = {
  async report(payload) {
    await delay(200);
    reports.push(payload);
  },

  async block(userId) {
    await delay(200);
    blockedUserIds.add(userId);
  },
};
