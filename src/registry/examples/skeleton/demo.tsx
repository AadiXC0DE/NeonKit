import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonDemo() {
  return (
    <div
      aria-busy="true"
      className="w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.03] p-5"
    >
      <span className="sr-only">Loading profile</span>
      <div className="flex items-center gap-4">
        <Skeleton variant="circle" className="size-12" />
        <div className="grid flex-1 gap-2.5">
          <Skeleton variant="text" className="w-36" />
          <Skeleton variant="text" className="h-2.5 w-24" />
        </div>
      </div>
      <div className="mt-6 grid gap-2.5">
        <Skeleton variant="text" className="h-2.5" />
        <Skeleton variant="text" className="h-2.5 w-11/12" />
        <Skeleton variant="text" className="h-2.5 w-3/5" />
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/[0.06] pt-5">
        {["Followers", "Following", "Projects"].map((stat) => (
          <div key={stat} className="grid gap-2">
            <Skeleton className="h-5 w-10" />
            <Skeleton variant="text" className="h-2 w-14" />
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-lg" />
        <Skeleton className="size-9 rounded-lg" />
      </div>
    </div>
  );
}
