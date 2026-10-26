export type ModerationTargetType = 'GroupMessage' | 'MissingPerson' | 'SafetyNote';

export type ModerationReason = 'abuse' | 'false_info' | 'scam' | 'other';

export interface ReportContentPayload {
  targetType: ModerationTargetType;
  targetId: string;
  reason: ModerationReason;
}
