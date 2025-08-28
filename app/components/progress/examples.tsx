"use client";

export function NeonProgressBarsPreview() {
  return (
    <div className="space-y-6 w-full max-w-md">
      <div className="relative w-full rounded-full overflow-hidden bg-gradient-to-r from-cyan-400/20 to-cyan-300/20 border border-cyan-400/30 h-3 shadow-lg backdrop-blur-sm">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.6)] transition-all duration-500 ease-out"
          style={{ width: "75%" }}
        ></div>
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-sm"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.3) 75%, transparent 75%)",
          }}
        ></div>
      </div>
      <div className="relative w-full rounded-full overflow-hidden bg-gradient-to-r from-purple-400/20 to-purple-300/20 border border-purple-400/30 h-3 shadow-lg backdrop-blur-sm">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-400 to-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.6)] transition-all duration-500 ease-out"
          style={{ width: "60%" }}
        ></div>
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-sm"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.3) 60%, transparent 60%)",
          }}
        ></div>
      </div>
      <div className="relative w-full rounded-full overflow-hidden bg-gradient-to-r from-lime-400/20 to-lime-300/20 border border-lime-400/30 h-3 shadow-lg backdrop-blur-sm">
        <div
          className="h-full rounded-full bg-gradient-to-r from-lime-400 to-lime-300 shadow-[0_0_8px_rgba(163,230,53,0.6)] transition-all duration-500 ease-out"
          style={{ width: "90%" }}
        ></div>
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-sm"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(163,230,53,0.3) 90%, transparent 90%)",
          }}
        ></div>
      </div>
      <div className="relative w-full rounded-full overflow-hidden bg-gradient-to-r from-pink-400/20 to-pink-300/20 border border-pink-400/30 h-3 shadow-lg backdrop-blur-sm">
        <div
          className="h-full rounded-full bg-gradient-to-r from-pink-400 to-pink-300 shadow-[0_0_8px_rgba(244,114,182,0.6)] transition-all duration-500 ease-out"
          style={{ width: "45%" }}
        ></div>
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-sm"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(244,114,182,0.3) 45%, transparent 45%)",
          }}
        ></div>
      </div>
      <div className="relative w-full rounded-full overflow-hidden bg-gradient-to-r from-red-400/20 to-red-300/20 border border-red-400/30 h-3 shadow-lg backdrop-blur-sm">
        <div
          className="h-full rounded-full bg-gradient-to-r from-red-400 to-red-300 shadow-[0_0_8px_rgba(248,113,113,0.6)] transition-all duration-500 ease-out"
          style={{ width: "25%" }}
        ></div>
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-sm"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(248,113,113,0.3) 25%, transparent 25%)",
          }}
        ></div>
      </div>
    </div>
  );
}

export function CircularProgressPreview() {
  return (
    <div className="flex gap-8 justify-center">
      <div className="relative w-20 h-20">
        <svg
          className="transform -rotate-90 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]"
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="4"
            className="stroke-muted"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            className="stroke-cyan-400"
            strokeDasharray="251.327"
            strokeDashoffset="62.832"
          />
        </svg>
      </div>
      <div className="relative w-20 h-20">
        <svg
          className="transform -rotate-90 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]"
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="4"
            className="stroke-muted"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            className="stroke-purple-400"
            strokeDasharray="251.327"
            strokeDashoffset="100.531"
          />
        </svg>
      </div>
      <div className="relative w-20 h-20">
        <svg
          className="transform -rotate-90 drop-shadow-[0_0_8px_rgba(163,230,53,0.6)]"
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="4"
            className="stroke-muted"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            className="stroke-lime-400"
            strokeDasharray="251.327"
            strokeDashoffset="25.133"
          />
        </svg>
      </div>
      <div className="relative w-20 h-20">
        <svg
          className="transform -rotate-90 drop-shadow-[0_0_8px_rgba(244,114,182,0.6)]"
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="4"
            className="stroke-muted"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            className="stroke-pink-400"
            strokeDasharray="251.327"
            strokeDashoffset="138.230"
          />
        </svg>
      </div>
    </div>
  );
}

export function BasicProgressBarsPreview() {
  return (
    <div className="space-y-6 w-full max-w-md">
      <div className="relative w-full rounded-full overflow-hidden bg-muted h-3">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
          style={{ width: "80%" }}
        ></div>
      </div>
      <div className="relative w-full rounded-full overflow-hidden bg-muted h-3">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
          style={{ width: "60%" }}
        ></div>
      </div>
      <div className="relative w-full rounded-full overflow-hidden bg-muted h-3">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
          style={{ width: "40%" }}
        ></div>
      </div>
      <div className="relative w-full rounded-full overflow-hidden bg-muted h-3">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
          style={{ width: "20%" }}
        ></div>
      </div>
    </div>
  );
}

export function MiniProgressBarsPreview() {
  return (
    <div className="space-y-3 w-full max-w-md">
      <div className="relative w-full rounded-full overflow-hidden bg-muted h-1.5">
        <div
          className="h-full rounded-full bg-primary transition-all duration-200 ease-out"
          style={{ width: "75%" }}
        ></div>
      </div>
      <div className="relative w-full rounded-full overflow-hidden bg-gradient-to-r from-cyan-400/20 to-cyan-300/20 border border-cyan-400/30 h-1.5 shadow-sm">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-300 shadow-[0_0_4px_rgba(34,211,238,0.4)] transition-all duration-200 ease-out"
          style={{ width: "60%" }}
        ></div>
      </div>
      <div className="relative w-full rounded-full overflow-hidden bg-gradient-to-r from-purple-400/20 to-purple-300/20 border border-purple-400/30 h-1.5 shadow-sm">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-400 to-purple-300 shadow-[0_0_4px_rgba(168,85,247,0.4)] transition-all duration-200 ease-out"
          style={{ width: "45%" }}
        ></div>
      </div>
      <div className="relative w-full rounded-full overflow-hidden bg-gradient-to-r from-lime-400/20 to-lime-300/20 border border-lime-400/30 h-1.5 shadow-sm">
        <div
          className="h-full rounded-full bg-gradient-to-r from-lime-400 to-lime-300 shadow-[0_0_4px_rgba(163,230,53,0.4)] transition-all duration-200 ease-out"
          style={{ width: "30%" }}
        ></div>
      </div>
    </div>
  );
}

export function AnimatedProgressPreview() {
  return (
    <div className="space-y-6 w-full max-w-md">
      <div className="relative w-full rounded-full overflow-hidden bg-gradient-to-r from-cyan-400/20 to-cyan-300/20 border border-cyan-400/30 h-3 shadow-lg backdrop-blur-sm">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-all duration-700 ease-out"
          style={{ width: "85%" }}
        ></div>
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-sm"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.3) 85%, transparent 85%)",
          }}
        ></div>
      </div>
      <div className="relative w-full rounded-full overflow-hidden bg-gradient-to-r from-purple-400/20 to-purple-300/20 border border-purple-400/30 h-3 shadow-lg backdrop-blur-sm">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-400 to-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.8)] transition-all duration-700 ease-out"
          style={{ width: "70%" }}
        ></div>
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-sm"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.3) 70%, transparent 70%)",
          }}
        ></div>
      </div>
      <div className="relative w-full rounded-full overflow-hidden bg-gradient-to-r from-lime-400/20 to-lime-300/20 border border-lime-400/30 h-3 shadow-lg backdrop-blur-sm">
        <div
          className="h-full rounded-full bg-gradient-to-r from-lime-400 to-lime-300 shadow-[0_0_10px_rgba(163,230,53,0.8)] transition-all duration-700 ease-out"
          style={{ width: "95%" }}
        ></div>
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-sm"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(163,230,53,0.3) 95%, transparent 95%)",
          }}
        ></div>
      </div>
    </div>
  );
}

export function ProgressWithLabelsPreview() {
  return (
    <div className="space-y-6 w-full max-w-md">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">Progress</span>
          <span className="text-sm font-medium text-foreground">75%</span>
        </div>
        <div className="relative w-full rounded-full overflow-hidden bg-gradient-to-r from-cyan-400/20 to-cyan-300/20 border border-cyan-400/30 h-3 shadow-lg backdrop-blur-sm">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.6)] transition-all duration-500 ease-out"
            style={{ width: "75%" }}
          ></div>
          <div
            className="absolute inset-0 rounded-full opacity-20 blur-sm"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.3) 75%, transparent 75%)",
            }}
          ></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">Progress</span>
          <span className="text-sm font-medium text-foreground">60%</span>
        </div>
        <div className="relative w-full rounded-full overflow-hidden bg-gradient-to-r from-purple-400/20 to-purple-300/20 border border-purple-400/30 h-3 shadow-lg backdrop-blur-sm">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-400 to-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.6)] transition-all duration-500 ease-out"
            style={{ width: "60%" }}
          ></div>
          <div
            className="absolute inset-0 rounded-full opacity-20 blur-sm"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.3) 60%, transparent 60%)",
            }}
          ></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">Progress</span>
          <span className="text-sm font-medium text-foreground">90%</span>
        </div>
        <div className="relative w-full rounded-full overflow-hidden bg-gradient-to-r from-lime-400/20 to-lime-300/20 border border-lime-400/30 h-3 shadow-lg backdrop-blur-sm">
          <div
            className="h-full rounded-full bg-gradient-to-r from-lime-400 to-lime-300 shadow-[0_0_8px_rgba(163,230,53,0.6)] transition-all duration-500 ease-out"
            style={{ width: "90%" }}
          ></div>
          <div
            className="absolute inset-0 rounded-full opacity-20 blur-sm"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(163,230,53,0.3) 90%, transparent 90%)",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export function MultiProgressBarsPreview() {
  return (
    <div className="space-y-4 w-full max-w-md">
      <div>
        <p className="text-sm text-muted-foreground mb-2">System Resources</p>
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">CPU</span>
              <span className="text-sm font-medium text-foreground">75%</span>
            </div>
            <div className="relative w-full rounded-full overflow-hidden bg-gradient-to-r from-cyan-400/20 to-cyan-300/20 border border-cyan-400/30 h-3 shadow-lg backdrop-blur-sm">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.6)] transition-all duration-500 ease-out"
                style={{ width: "75%" }}
              ></div>
              <div
                className="absolute inset-0 rounded-full opacity-20 blur-sm"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.3) 75%, transparent 75%)",
                }}
              ></div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">
                Memory
              </span>
              <span className="text-sm font-medium text-foreground">60%</span>
            </div>
            <div className="relative w-full rounded-full overflow-hidden bg-gradient-to-r from-purple-400/20 to-purple-300/20 border border-purple-400/30 h-3 shadow-lg backdrop-blur-sm">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-400 to-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.6)] transition-all duration-500 ease-out"
                style={{ width: "60%" }}
              ></div>
              <div
                className="absolute inset-0 rounded-full opacity-20 blur-sm"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.3) 60%, transparent 60%)",
                }}
              ></div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">
                Storage
              </span>
              <span className="text-sm font-medium text-foreground">45%</span>
            </div>
            <div className="relative w-full rounded-full overflow-hidden bg-gradient-to-r from-lime-400/20 to-lime-300/20 border border-lime-400/30 h-3 shadow-lg backdrop-blur-sm">
              <div
                className="h-full rounded-full bg-gradient-to-r from-lime-400 to-lime-300 shadow-[0_0_8px_rgba(163,230,53,0.6)] transition-all duration-500 ease-out"
                style={{ width: "45%" }}
              ></div>
              <div
                className="absolute inset-0 rounded-full opacity-20 blur-sm"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(163,230,53,0.3) 45%, transparent 45%)",
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NeonCircularProgressPreview() {
  return (
    <div className="flex gap-8 justify-center">
      <div className="relative w-24 h-24 drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]">
        <svg
          className="transform -rotate-90"
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="4"
            className="stroke-cyan-400/20"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            className="stroke-cyan-400"
            strokeDasharray="251.327"
            strokeDashoffset="62.832"
            style={{ filter: "drop-shadow(0 0 8px rgba(34,211,238,0.6))" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bold text-foreground text-base">75%</span>
        </div>
      </div>
      <div className="relative w-24 h-24 drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]">
        <svg
          className="transform -rotate-90"
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="4"
            className="stroke-purple-400/20"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            className="stroke-purple-400"
            strokeDasharray="251.327"
            strokeDashoffset="100.531"
            style={{ filter: "drop-shadow(0 0 8px rgba(168,85,247,0.6))" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bold text-foreground text-base">60%</span>
        </div>
      </div>
      <div className="relative w-24 h-24 drop-shadow-[0_0_12px_rgba(163,230,53,0.8)]">
        <svg
          className="transform -rotate-90"
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="4"
            className="stroke-lime-400/20"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            className="stroke-lime-400"
            strokeDasharray="251.327"
            strokeDashoffset="25.133"
            style={{ filter: "drop-shadow(0 0 8px rgba(163,230,53,0.6))" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bold text-foreground text-base">90%</span>
        </div>
      </div>
      <div className="relative w-24 h-24 drop-shadow-[0_0_12px_rgba(244,114,182,0.8)]">
        <svg
          className="transform -rotate-90"
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="4"
            className="stroke-pink-400/20"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            className="stroke-pink-400"
            strokeDasharray="251.327"
            strokeDashoffset="138.230"
            style={{ filter: "drop-shadow(0 0 8px rgba(244,114,182,0.6))" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bold text-foreground text-base">45%</span>
        </div>
      </div>
    </div>
  );
}
