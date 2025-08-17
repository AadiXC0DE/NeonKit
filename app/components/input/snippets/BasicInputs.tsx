"use client";

export default function BasicInputs() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none">Default</label>
        <input
          className="flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 border-input bg-background hover:border-accent-foreground/20"
          placeholder="Default input..."
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none">Filled</label>
        <input
          className="flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 bg-secondary border-transparent hover:bg-secondary/80"
          placeholder="Filled input..."
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none">Ghost</label>
        <input
          className="flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 border-transparent bg-accent/5 hover:bg-accent/10"
          placeholder="Ghost input..."
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none">Search</label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
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
                d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            className="flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 pl-10 border-input bg-background hover:border-accent-foreground/20"
            placeholder="Search..."
          />
        </div>
      </div>
    </div>
  );
}
