import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const field =
  "h-9 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-white/90 outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-white/30 focus:border-[rgb(var(--neon)/0.6)] focus:shadow-[0_0_0_3px_rgb(var(--neon)/0.15)]";
const panel = "grid gap-5 rounded-xl border border-white/10 bg-white/[0.03] p-5";

const notifications = [
  { id: "deploy-failed", label: "Failed deployments", hint: "Email and in-app", checked: true },
  { id: "deploy-ready", label: "Preview ready", hint: "In-app only", checked: true },
  { id: "mentions", label: "Comments and mentions", hint: "Email and in-app", checked: true },
  { id: "usage", label: "Weekly usage report", hint: "Email every Monday", checked: false },
];

export default function TabsDemo() {
  return (
    <Tabs defaultValue="account" className="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      <TabsContent value="account" className={panel}>
        <div className="grid gap-1">
          <h3 className="text-sm font-medium text-white/90">Profile</h3>
          <p className="text-sm text-white/55">This is how your name appears on deployments and comments.</p>
        </div>
        <label className="grid gap-1.5 text-xs font-medium text-white/55">
          Display name
          <input className={field} defaultValue="Maya Okafor" />
        </label>
        <label className="grid gap-1.5 text-xs font-medium text-white/55">
          Email
          <input className={field} type="email" defaultValue="maya@lumenlabs.dev" />
        </label>
        <Button variant="solid" size="sm" className="justify-self-start">
          Save changes
        </Button>
      </TabsContent>

      <TabsContent value="password" className={panel}>
        <div className="grid gap-1">
          <h3 className="text-sm font-medium text-white/90">Password</h3>
          <p className="text-sm text-white/55">Last changed 3 months ago. You will stay signed in on this device.</p>
        </div>
        <label className="grid gap-1.5 text-xs font-medium text-white/55">
          Current password
          <input className={field} type="password" autoComplete="current-password" />
        </label>
        <label className="grid gap-1.5 text-xs font-medium text-white/55">
          New password
          <input className={field} type="password" autoComplete="new-password" placeholder="At least 12 characters" />
        </label>
        <Button variant="solid" size="sm" className="justify-self-start">
          Update password
        </Button>
      </TabsContent>

      <TabsContent value="notifications" className={panel}>
        <div className="grid gap-1">
          <h3 className="text-sm font-medium text-white/90">Notifications</h3>
          <p className="text-sm text-white/55">Choose what is worth interrupting you for.</p>
        </div>
        <div className="grid gap-3">
          {notifications.map((item) => (
            <label key={item.id} className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                defaultChecked={item.checked}
                className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[rgb(var(--neon))]"
              />
              <span className="grid gap-0.5">
                <span className="text-sm text-white/90">{item.label}</span>
                <span className="text-xs text-white/45">{item.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
