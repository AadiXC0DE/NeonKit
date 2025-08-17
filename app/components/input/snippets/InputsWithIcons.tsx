"use client";

import { User, Mail } from "lucide-react";

export default function InputsWithIcons() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none text-purple-100">
          With Start Icon
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400">
            <User className="h-4 w-4" />
          </div>
          <input
            className="flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-slate-950/50 border-2 border-purple-400/60 text-purple-100 font-medium placeholder:text-purple-200/70 focus-visible:border-purple-400 focus-visible:shadow-[0_0_15px_rgb(168,85,247,0.3)] hover:border-purple-400/80 hover:shadow-[0_0_10px_rgb(168,85,247,0.2)] backdrop-blur-sm pl-10"
            placeholder="Username..."
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none text-cyan-100">
          Password Input
        </label>
        <div className="relative">
          <input
            type="password"
            className="flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-slate-950/50 border-2 border-cyan-400/60 text-cyan-100 font-medium placeholder:text-cyan-200/70 focus-visible:border-cyan-400 focus-visible:shadow-[0_0_15px_rgb(34,211,238,0.3)] hover:border-cyan-400/80 hover:shadow-[0_0_10px_rgb(34,211,238,0.2)] backdrop-blur-sm pr-10"
            placeholder="Password..."
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none text-lime-100">
          Clearable Input
        </label>
        <div className="relative">
          <input
            className="flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-slate-950/50 border-2 border-lime-400/60 text-lime-100 font-medium placeholder:text-lime-200/70 focus-visible:border-lime-400 focus-visible:shadow-[0_0_15px_rgb(163,230,53,0.3)] hover:border-lime-400/80 hover:shadow-[0_0_10px_rgb(163,230,53,0.2)] backdrop-blur-sm pr-10"
            placeholder="Type to see clear..."
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lime-400 hover:text-lime-300 transition-colors"
          >
            <svg
              className="h-4 w-4"
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
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none text-pink-100">
          Email Input
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-400">
            <Mail className="h-4 w-4" />
          </div>
          <input
            type="email"
            className="flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-slate-950/50 border-2 border-pink-400/60 text-pink-100 font-medium placeholder:text-pink-200/70 focus-visible:border-pink-400 focus-visible:shadow-[0_0_15px_rgb(244,114,182,0.3)] hover:border-pink-400/80 hover:shadow-[0_0_10px_rgb(244,114,182,0.2)] backdrop-blur-sm pl-10"
            placeholder="Email..."
          />
        </div>
      </div>
    </div>
  );
}
