"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-slate-50">
          <h2 className="text-2xl font-bold text-red-600 mb-4">A critical error occurred!</h2>
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6 max-w-2xl overflow-auto text-left w-full border border-red-200">
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
      </body>
    </html>
  );
}
