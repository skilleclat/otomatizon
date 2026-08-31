export type JobType = 
  | "follow_up_24h"
  | "payment_reminder_12h"
  | "review_request_2h"
  | "package_renewal_check";

export type JobStatus = 
  | "scheduled"
  | "evaluating"
  | "dispatched"
  | "cancelled_converted"
  | "cancelled_manual"
  | "failed";

export interface ScheduledJob {
  id: string;
  organizationId: string;
  workflowId: string;
  jobType: JobType;
  targetEntityId: string;
  targetEntityName: string;
  targetPhone: string;
  scheduledFor: string; // ISO Date String
  createdAt: string;
  status: JobStatus;
  conditionDescription: string;
  payload: {
    subject?: string;
    level?: string;
    requestedSlot?: string;
    followUpMessageText?: string;
    estimatedValueKes?: number;
    [key: string]: any;
  };
  executionResult?: {
    executedAt: string;
    circuitBroken: boolean;
    reason: string;
    messageId?: string;
  };
}

export interface QueueSummary {
  totalScheduled: number;
  totalDispatched: number;
  totalCancelledConverted: number;
  revenueSavedKes: number;
  activeJobs: ScheduledJob[];
}
