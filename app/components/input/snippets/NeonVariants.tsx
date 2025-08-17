"use client";

export default function NeonVariants() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none text-red-100">
          Destructive
        </label>
        <input
          className="flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-slate-950/50 border-2 border-red-400/60 text-red-100 font-medium placeholder:text-red-200/70 focus-visible:border-red-400 focus-visible:shadow-[0_0_15px_rgb(248,113,113,0.3)] hover:border-red-400/80 hover:shadow-[0_0_10px_rgb(248,113,113,0.2)] backdrop-blur-sm"
          placeholder="Error input..."
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none text-emerald-100">
          Success
        </label>
        <input
          className="flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-slate-950/50 border-2 border-emerald-400/60 text-emerald-100 font-medium placeholder:text-emerald-200/70 focus-visible:border-emerald-400 focus-visible:shadow-[0_0_15px_rgb(52,211,153,0.3)] hover:border-emerald-400/80 hover:shadow-[0_0_10px_rgb(52,211,153,0.2)] backdrop-blur-sm"
          placeholder="Success input..."
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none text-amber-100">
          Warning
        </label>
        <input
          className="flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-slate-950/50 border-2 border-amber-400/60 text-amber-100 font-medium placeholder:text-amber-200/70 focus-visible:border-amber-400 focus-visible:shadow-[0_0_15px_rgb(251,191,36,0.3)] hover:border-amber-400/80 hover:shadow-[0_0_10px_rgb(251,191,36,0.2)] backdrop-blur-sm"
          placeholder="Warning input..."
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none text-cyan-100">
          Loading
        </label>
        <div className="relative">
          <input
            disabled
            className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-slate-950/50 border-2 border-cyan-400/60 text-cyan-100 font-medium placeholder:text-cyan-200/70 focus-visible:border-cyan-400 focus-visible:ring-cyan-400/50 focus-visible:shadow-[0_0_15px_rgb(34,211,238,0.3)] hover:border-cyan-400/80 hover:shadow-[0_0_10px_rgb(34,211,238,0.2)] backdrop-blur-sm pr-10"
            placeholder="Loading..."
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400">
            <svg
              className="h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
