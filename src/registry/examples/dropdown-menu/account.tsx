import { ChevronsUpDown, CreditCard, Keyboard, LifeBuoy, LogOut, Settings, User } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DropdownMenuAccount() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-56 items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-1.5 pr-2.5 text-left transition-colors duration-150 hover:border-white/20 data-[state=open]:border-white/20">
        <Avatar alt="Mara Okafor" size="sm" status="online" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium leading-5 text-white/90">Mara Okafor</span>
          <span className="block truncate text-xs leading-4 text-white/45">Pro plan</span>
        </span>
        <ChevronsUpDown aria-hidden className="size-4 shrink-0 text-white/35" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel className="pb-2">
          <span className="block text-sm font-medium text-white/90">Mara Okafor</span>
          <span className="block font-normal text-white/45">mara@northlight.dev</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem icon={<User />} shortcut="⇧⌘P">
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem icon={<CreditCard />} shortcut="⌘B">
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem icon={<Settings />} shortcut="⌘,">
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem icon={<Keyboard />} shortcut="⌘/">
            Keyboard shortcuts
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={<LifeBuoy />}>Support</DropdownMenuItem>
        <DropdownMenuItem icon={<LogOut />} shortcut="⇧⌘Q">
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
