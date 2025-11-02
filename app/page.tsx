"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [gracePeriodSeconds, setGracePeriodSeconds] = useState<string>("3");
  const [maximumBreaks, setMaximumBreaks] = useState<string>("");
  const [targetMinutes, setTargetMinutes] = useState<string>("");
  const [targetSeconds, setTargetSeconds] = useState<string>("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [vibrationSupported, setVibrationSupported] = useState<boolean>(false);
  const [showTimer, setShowTimer] = useState<
    "show" | "show-after-goal" | "hide"
  >("show");

  // Check if vibration API is supported
  useEffect(() => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      setVibrationSupported(true);
    }
  }, []);

  // Auto-switch from "show-after-goal" to "show" if target time is cleared
  useEffect(() => {
    if (showTimer === "show-after-goal" && !targetMinutes && !targetSeconds) {
      setShowTimer("show");
    }
  }, [targetMinutes, targetSeconds, showTimer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const gracePeriod = parseFloat(gracePeriodSeconds);
    if (isNaN(gracePeriod) || gracePeriod <= 0) {
      alert("Grace period must be a positive number");
      return;
    }

    const params = new URLSearchParams();
    params.set("gracePeriodSeconds", gracePeriod.toString());

    if (maximumBreaks) {
      const maxBreaks = parseInt(maximumBreaks, 10);
      if (!isNaN(maxBreaks) && maxBreaks > 0) {
        params.set("maximumBreaks", maxBreaks.toString());
      }
    }

    // Handle target time
    if (targetMinutes || targetSeconds) {
      const mins = parseInt(targetMinutes || "0", 10);
      const secs = parseInt(targetSeconds || "0", 10);
      if (!isNaN(mins) && !isNaN(secs) && (mins > 0 || secs > 0)) {
        const totalSeconds = mins * 60 + secs;
        params.set("targetSeconds", totalSeconds.toString());
      }
    }
    // Add haptic feedback setting
    if (vibrationSupported) {
      params.set("hapticFeedback", hapticFeedback.toString());
    }
    // Add sound setting
    params.set("soundEnabled", soundEnabled.toString());
    // Add show timer setting
    params.set("showTimer", showTimer);

    router.push(`/game?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Deepthroat Trainer
          </h1>
          <p className="text-gray-400">How long can your throat be filled?</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 rounded-2xl p-8 space-y-6 shadow-2xl"
        >
          <div className="space-y-2">
            <label
              htmlFor="gracePeriodSeconds"
              className="block text-sm font-medium text-gray-300"
            >
              Grace Period (seconds)
              <span className="text-red-400 ml-1">*</span>
            </label>
            <input
              type="number"
              id="gracePeriodSeconds"
              value={gracePeriodSeconds}
              onChange={(e) => setGracePeriodSeconds(e.target.value)}
              step="0.1"
              min="0.1"
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter grace period in seconds"
            />
            <p className="text-xs text-gray-500">
              If you have to come up for air, this is how long you have to
              resume, or it's game over.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Target Time (optional)
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  id="targetMinutes"
                  value={targetMinutes}
                  onChange={(e) => setTargetMinutes(e.target.value)}
                  step="1"
                  min="0"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Minutes"
                />
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  id="targetSeconds"
                  value={targetSeconds}
                  onChange={(e) => setTargetSeconds(e.target.value)}
                  step="1"
                  min="0"
                  max="59"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Seconds"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              If you have a specific goal time, set it here. Don't worry if you
              fail, you can always start over!
            </p>
          </div>

          {/* Advanced Settings Dropdown */}
          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-750 transition-colors"
            >
              <span className="text-sm font-medium text-gray-300">
                Advanced Settings
              </span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  showAdvancedSettings ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showAdvancedSettings && (
              <div className="p-4 space-y-4 bg-gray-850">
                <div className="space-y-2">
                  <label
                    htmlFor="maximumBreaks"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Maximum Breaks (optional)
                  </label>
                  <input
                    type="number"
                    id="maximumBreaks"
                    value={maximumBreaks}
                    onChange={(e) => setMaximumBreaks(e.target.value)}
                    step="1"
                    min="1"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Leave empty for unlimited"
                  />
                  <p className="text-xs text-gray-500">
                    If you have to come up for air this many times, it's game
                    over. Set to 0 for instafail.
                  </p>
                </div>

                {vibrationSupported && (
                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex-1">
                      <label
                        htmlFor="hapticFeedback"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Haptic Feedback
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Enable vibrations.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={hapticFeedback}
                      onClick={() => setHapticFeedback(!hapticFeedback)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                        hapticFeedback ? "bg-blue-600" : "bg-gray-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          hapticFeedback ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex-1">
                    <label
                      htmlFor="soundEnabled"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Sound
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Enable audio cues.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={soundEnabled}
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                      soundEnabled ? "bg-blue-600" : "bg-gray-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        soundEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-1 p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <label className="block text-sm font-medium text-gray-300">
                    Timer Visibility
                  </label>
                  <p className="text-xs text-gray-500">
                    Show or hide the timer.
                  </p>
                  <div className="space-y-2 mt-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="showTimer"
                        value="show"
                        checked={showTimer === "show"}
                        onChange={(e) =>
                          setShowTimer(
                            e.target.value as
                              | "show"
                              | "show-after-goal"
                              | "hide"
                          )
                        }
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="ml-3 text-sm text-gray-300">
                        Show
                        <span className="block text-xs text-gray-500 mt-0.5">
                          Timer is always visible
                        </span>
                      </span>
                    </label>
                    <label
                      className={`flex items-center ${
                        !targetMinutes && !targetSeconds
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                    >
                      <input
                        type="radio"
                        name="showTimer"
                        value="show-after-goal"
                        checked={showTimer === "show-after-goal"}
                        onChange={(e) =>
                          setShowTimer(
                            e.target.value as
                              | "show"
                              | "show-after-goal"
                              | "hide"
                          )
                        }
                        disabled={!targetMinutes && !targetSeconds}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
                      />
                      <span className="ml-3 text-sm text-gray-300">
                        Show After Goal
                        <span className="block text-xs text-gray-500 mt-0.5">
                          Timer is hidden until the goal time is reached
                        </span>
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="showTimer"
                        value="hide"
                        checked={showTimer === "hide"}
                        onChange={(e) =>
                          setShowTimer(
                            e.target.value as
                              | "show"
                              | "show-after-goal"
                              | "hide"
                          )
                        }
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="ml-3 text-sm text-gray-300">
                        Hide
                        <span className="block text-xs text-gray-500 mt-0.5">
                          Timer is always hidden
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-linear-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Start Training
          </button>

          <button
            type="button"
            onClick={() => setShowInstructions(true)}
            className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 px-6 rounded-lg transition-all duration-200 border border-gray-700"
          >
            Instructions
          </button>
        </form>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-6 z-50"
          onClick={() => setShowInstructions(false)}
        >
          <div
            className="bg-gray-900 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold text-white">Instructions</h2>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="text-gray-300 space-y-4">
              <p>
                Get accustomed to having your throat filled. Build your
                tolerance by having your throat filled for longer periods of
                time.
              </p>

              <ol className="list-decimal list-inside space-y-1">
                <li>Deepthroat to the desired depth</li>
                <li>Hold the button down</li>
                <li>Let go of the button if you need to come up for air</li>
                <li>Fill your throat again before the time runs out</li>
              </ol>

              <p>
                <strong>Optional:</strong> Set a target time if you have a
                specific goal, otherwise go for as long as you can.
              </p>
            </div>
            <div className="mt-6">
              <button
                onClick={() => setShowInstructions(false)}
                className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 px-6 rounded-lg transition-all duration-200 border border-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
