export interface Settings {
  gracePeriodSeconds: number;
  maximumBreaks?: number;
  targetSeconds?: number;
  hapticFeedback?: boolean;
  soundEnabled?: boolean;
  extraCues?: boolean;
  showTimer?: "show" | "show-after-goal" | "hide";
  mode?: "classic" | "endless";
}

export interface Statistics {
  elapsed: number;
  breaks: number;
  lastHold: number;
  longestHold: number;
}

export type Phase = "idle" | "holding" | "released" | "failed";
