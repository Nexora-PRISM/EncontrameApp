import { api } from '@/lib/axios';
import type { ModerationRepository } from '@/services/moderation/moderation.repository';

export const moderationAxiosRepository: ModerationRepository = {
  async report(payload) {
    const targetId = Number(payload.targetId);
    if (!Number.isInteger(targetId)) {
      throw new Error('invalid-target');
    }

    await api.post('/Moderation/reports', {
      targetType: payload.targetType,
      targetId,
      reason: payload.reason,
    });
  },

  async block(userId) {
    const id = Number(userId);
    if (!Number.isInteger(id)) {
      throw new Error('invalid-user');
    }

    await api.post('/Moderation/blocks', { userId: id });
  },
};
