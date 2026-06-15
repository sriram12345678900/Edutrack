"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Caught in error.tsx:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-slate-50 dark:bg-slate-950">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
      <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6 max-w-2xl overflow-auto text-left w-full border border-red-200 dark:border-red-800/30">
        <p className="font-mono text-sm break-all">{error.message}</p>
        {error.stack && (
          <pre className="mt-2 text-xs opacity-80 overflow-x-auto">
            {error.stack}
          </pre>
        )}
      </div>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
