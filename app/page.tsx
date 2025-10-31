"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [gracePeriodSeconds, setGracePeriodSeconds] = useState<string>("3");
  const [maximumBreaks, setMaximumBreaks] = useState<string>("");

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

    router.push(`/game?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Deepthroat Trainer
          </h1>
          <p className="text-gray-400">Configure your training settings</p>
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
              Time allowed to resume holding after releasing
            </p>
          </div>

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
              Number of breaks allowed before game over
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Start Training
          </button>
        </form>
      </div>
    </div>
  );
}
