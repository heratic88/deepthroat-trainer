export interface Settings {
  gracePeriodSeconds: number;
  maximumBreaks?: number;
  targetSeconds?: number;
  hapticFeedback?: boolean;
}

export interface Statistics {
  elapsed: number;
  breaks: number;
}

export type Phase = "idle" | "holding" | "released" | "failed";
