"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Phase, Settings, Statistics } from "../types";

export default function Game() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [settings, setSettings] = useState<Settings | null>(null);
  const [statistics, setStatistics] = useState<Statistics>({
    elapsed: 0,
    breaks: 0,
  });

  const [phase, setPhase] = useState<Phase>("idle");
  const [holdingTimer, setHoldingTimer] = useState<NodeJS.Timeout | null>(null);
  const [gracePeriodRemaining, setGracePeriodRemaining] = useState<number>(0);

  const audioContextRef = useRef<AudioContext | null>(null);

  // Parse and validate settings from URL
  useEffect(() => {
    const gracePeriodSeconds = searchParams.get("gracePeriodSeconds");
    const maximumBreaks = searchParams.get("maximumBreaks");
    const targetSeconds = searchParams.get("targetSeconds");

    if (!gracePeriodSeconds) {
      router.push("/");
      return;
    }

    const gracePeriod = parseFloat(gracePeriodSeconds);
    if (isNaN(gracePeriod) || gracePeriod <= 0) {
      router.push("/");
      return;
    }

    const parsedSettings: Settings = {
      gracePeriodSeconds: gracePeriod,
    };

    if (maximumBreaks) {
      const maxBreaks = parseInt(maximumBreaks, 10);
      if (!isNaN(maxBreaks) && maxBreaks > 0) {
        parsedSettings.maximumBreaks = maxBreaks;
      }
    }

    if (targetSeconds) {
      const target = parseInt(targetSeconds, 10);
      if (!isNaN(target) && target > 0) {
        parsedSettings.targetSeconds = target;
      }
    }

    setSettings(parsedSettings);
  }, [searchParams, router]);

  const ensureAudioContext = () => {
    if (
      !audioContextRef.current ||
      audioContextRef.current.state === "closed"
    ) {
      audioContextRef.current = new AudioContext();
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
  };

  const playTone = (pitch: number, duration: number) => {
    if (
      !audioContextRef.current ||
      audioContextRef.current.state === "closed"
    ) {
      return;
    }

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = pitch;

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    gainNode.gain.value = 0.3;

    const now = ctx.currentTime;
    oscillator.start(now);
    oscillator.stop(now + duration);
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const clearExistingTimer = () => {
    if (holdingTimer) {
      clearInterval(holdingTimer);
      setHoldingTimer(null);
    }
  };

  const onPointerDown = async (
    event: React.PointerEvent<HTMLButtonElement>
  ) => {
    if (!settings) return;
    if (phase === "failed") return;

    (event.target as HTMLButtonElement).setPointerCapture(event.pointerId);
    ensureAudioContext();

    // If the user resumes holding during grace period, cancel that timer.
    clearExistingTimer();
    setGracePeriodRemaining(0);
    setPhase("holding");
    playTone(520, 0.1);

    setHoldingTimer(
      setInterval(() => {
        setStatistics((prev) => ({
          ...prev,
          elapsed: prev.elapsed + 1,
        }));
      }, 1000)
    );
  };

  const onPointerUp = async (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!settings) return;
    if (phase === "failed") return;

    (event.target as HTMLButtonElement).releasePointerCapture(event.pointerId);
    ensureAudioContext();

    setPhase("released");
    clearExistingTimer();

    // Synchronously calculate new breaks
    const newBreaks = statistics.breaks + 1;

    // Fail instantly if max breaks reached
    if (
      settings.maximumBreaks !== undefined &&
      newBreaks >= settings.maximumBreaks
    ) {
      setStatistics((prev) => ({ ...prev, breaks: newBreaks }));
      gameFailed();
      return; // do NOT start grace period
    }

    playTone(440, 0.1);
    setStatistics((prev) => ({ ...prev, breaks: newBreaks }));

    const start = performance.now();
    const gracePeriodMs = settings.gracePeriodSeconds * 1000;
    setGracePeriodRemaining(settings.gracePeriodSeconds);

    const graceTimer = setInterval(() => {
      const elapsed = performance.now() - start;
      const remaining = Math.max(0, (gracePeriodMs - elapsed) / 1000);
      setGracePeriodRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(graceTimer);
        gameFailed();
      }
    }, 20);

    setHoldingTimer(graceTimer);
  };

  const onPointerCancel = async () => {
    setPhase("released");
  };

  const onPointerLeave = async () => {};

  const gameFailed = () => {
    setPhase("failed");
    clearExistingTimer();
    setGracePeriodRemaining(0);

    playTone(380, 2);
    playTone(392, 2);
  };

  if (!settings) {
    return (
      <div className="h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const graceProgress =
    (gracePeriodRemaining / settings.gracePeriodSeconds) * 100;

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const goalProgress = settings.targetSeconds
    ? Math.min(100, (statistics.elapsed / settings.targetSeconds) * 100)
    : 0;

  const goalReached = settings.targetSeconds
    ? statistics.elapsed >= settings.targetSeconds
    : false;

  return (
    <div className="h-screen bg-gray-950 flex flex-col overflow-hidden">
      {/* Header stats - fixed height */}
      <div className="p-6 space-y-3 shrink-0">
        <div className="text-center">
          <div
            className={`text-6xl font-bold mb-2 ${
              goalReached ? "text-green-500" : "text-white"
            }`}
          >
            {formatTime(statistics.elapsed)}
          </div>
          <div className="text-gray-400 text-sm uppercase tracking-wider">
            Time Elapsed
          </div>
        </div>

        <div className="flex justify-between text-gray-400 text-xs">
          <div>
            <span className="text-gray-500">Breaks:</span>{" "}
            <span className="text-white font-medium">{statistics.breaks}</span>
            {settings.maximumBreaks !== undefined && (
              <span className="text-gray-500">/{settings.maximumBreaks}</span>
            )}
          </div>
          {settings.targetSeconds !== undefined && (
            <div>
              <span className="text-gray-500">Progress:</span>{" "}
              <span className="text-white font-medium">
                {goalProgress.toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        {/* Grace period progress bar - fixed height container */}
        <div className="h-16">
          {phase === "released" && gracePeriodRemaining > 0 && (
            <div className="space-y-2">
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-yellow-500 to-red-500 transition-all duration-75 ease-linear"
                  style={{ width: `${graceProgress}%` }}
                />
              </div>
              <div className="text-center text-yellow-400 text-sm font-medium">
                Resume in {gracePeriodRemaining.toFixed(1)}s
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main button - fills all remaining space */}
      <div className="flex-1 p-6 pt-0">
        <button
          className={`w-full h-full rounded-3xl text-white text-2xl font-bold shadow-2xl transition-colors touch-none select-none ${
            phase === "holding"
              ? "bg-linear-to-br from-green-600 to-emerald-700"
              : phase === "failed"
              ? "bg-linear-to-br from-red-600 to-red-800"
              : "bg-linear-to-br from-blue-600 to-indigo-700"
          } ${phase === "failed" && "opacity-50 cursor-not-allowed"}`}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onPointerLeave={onPointerLeave}
          disabled={phase === "failed"}
        >
          {phase === "idle" && "Touch & Hold"}
          {phase === "holding" && "Keep Holding..."}
          {phase === "released" && "Touch Again!"}
          {phase === "failed" && "Game Over"}
        </button>
      </div>
    </div>
  );
}
