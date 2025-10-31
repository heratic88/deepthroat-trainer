export interface Settings {
  gracePeriodSeconds: number;
  maximumBreaks?: number;
  targetSeconds?: number;
}

export interface Statistics {
  elapsed: number;
  breaks: number;
}

export type Phase = "idle" | "holding" | "released" | "failed";
