import { env } from '@/lib/env';
import { moderationAxiosRepository } from '@/services/moderation/moderation.axios.repository';
import { moderationMockRepository } from '@/services/moderation/moderation.mock.repository';
import type { ReportContentPayload } from '@/services/moderation/moderation.types';

export interface ModerationRepository {
  report(payload: ReportContentPayload): Promise<void>;
  block(userId: string): Promise<void>;
}

export function getModerationRepository(): ModerationRepository {
  return env.useMocks ? moderationMockRepository : moderationAxiosRepository;
}
