import { Download, FileCode2, FileText, Link, Mail, Send, Share2, UserPlus } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DropdownMenuNested() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="soft">
          <Share2 /> Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem icon={<Link />} shortcut="⌘L">
          Copy link
        </DropdownMenuItem>
        <DropdownMenuItem icon={<UserPlus />}>Invite people…</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger icon={<Download />}>Export as</DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-44">
            <DropdownMenuItem icon={<FileText />}>PDF</DropdownMenuItem>
            <DropdownMenuItem icon={<FileText />}>Markdown</DropdownMenuItem>
            <DropdownMenuItem icon={<FileCode2 />}>HTML</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger icon={<Send />}>Send to</DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem>Slack</DropdownMenuItem>
            <DropdownMenuItem>Linear</DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger icon={<Mail />}>Email</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-48">
                <DropdownMenuItem>Whole team</DropdownMenuItem>
                <DropdownMenuItem>Design</DropdownMenuItem>
                <DropdownMenuItem>Engineering</DropdownMenuItem>
                <DropdownMenuItem disabled>Finance</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
