export interface Settings {
  gracePeriodSeconds: number;
  maximumBreaks?: number;
  targetSeconds?: number;
  hapticFeedback?: boolean;
  soundEnabled?: boolean;
  showTimer?: "show" | "show-after-goal" | "hide";
}

export interface Statistics {
  elapsed: number;
  breaks: number;
}

export type Phase = "idle" | "holding" | "released" | "failed";
