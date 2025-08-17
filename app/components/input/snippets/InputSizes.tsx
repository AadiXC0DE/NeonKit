"use client";

export default function InputSizes() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none text-cyan-100">
          Small
        </label>
        <input
          className="flex h-8 w-full rounded-md border px-2 text-xs file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-slate-950/50 border-2 border-cyan-400/60 text-cyan-100 font-medium placeholder:text-cyan-200/70 focus-visible:border-cyan-400 focus-visible:shadow-[0_0_15px_rgb(34,211,238,0.3)] hover:border-cyan-400/80 hover:shadow-[0_0_10px_rgb(34,211,238,0.2)] backdrop-blur-sm"
          placeholder="Small..."
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none text-purple-100">
          Default
        </label>
        <input
          className="flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-slate-950/50 border-2 border-purple-400/60 text-purple-100 font-medium placeholder:text-purple-200/70 focus-visible:border-purple-400 focus-visible:shadow-[0_0_15px_rgb(168,85,247,0.3)] hover:border-purple-400/80 hover:shadow-[0_0_10px_rgb(168,85,247,0.2)] backdrop-blur-sm"
          placeholder="Default..."
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none text-lime-100">
          Large
        </label>
        <input
          className="flex h-11 w-full rounded-md border px-4 py-3 text-base file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-slate-950/50 border-2 border-lime-400/60 text-lime-100 font-medium placeholder:text-lime-200/70 focus-visible:border-lime-400 focus-visible:shadow-[0_0_15px_rgb(163,230,53,0.3)] hover:border-lime-400/80 hover:shadow-[0_0_10px_rgb(163,230,53,0.2)] backdrop-blur-sm"
          placeholder="Large..."
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none text-pink-100">
          Extra Large
        </label>
        <input
          className="flex h-12 w-full rounded-md border px-5 py-4 text-lg file:border-0 file:bg-transparent file:text-lg file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-slate-950/50 border-2 border-pink-400/60 text-pink-100 font-medium placeholder:text-pink-200/70 focus-visible:border-pink-400 focus-visible:shadow-[0_0_15px_rgb(244,114,182,0.3)] hover:border-pink-400/80 hover:shadow-[0_0_10px_rgb(244,114,182,0.2)] backdrop-blur-sm"
          placeholder="Extra large..."
        />
      </div>
    </div>
  );
}
