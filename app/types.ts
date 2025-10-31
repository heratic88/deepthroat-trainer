export interface Settings {
  gracePeriodSeconds: number;
  maximumBreaks?: number;
}

export interface Statistics {
  elapsed: number;
  breaks: number;
}

export type Phase = "idle" | "holding" | "released" | "failed";
