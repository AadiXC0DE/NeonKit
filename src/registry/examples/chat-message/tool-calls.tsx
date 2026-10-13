import { ChatToolCall } from "@/components/ui/chat-message";

const logs = `14:02:11  POST /api/invites  429  3ms
14:02:11  POST /api/invites  429  2ms
14:02:12  POST /api/invites  429  2ms
14:02:12  rate-limit  key=invites:203.0.113.42  count=61  limit=5`;

export default function ChatMessageToolCalls() {
  return (
    <div className="grid w-full max-w-xl gap-2">
      <ChatToolCall
        name="query_logs"
        args={{ service: "web", path: "/api/invites", since: "15m" }}
        status="done"
        duration={0.8}
        result={logs}
        defaultOpen
      />
      <ChatToolCall
        name="run_migration"
        args={{ name: "20261013_invites_expiry" }}
        status="error"
        error={`relation "invite_tokens" already exists. The migration ran on staging yesterday; mark it applied instead of re-running it.`}
      />
      <ChatToolCall name="deploy_preview" args={{ branch: "fix/invite-limit" }} status="running" />
      <ChatToolCall name="notify" args={{ channel: "#releases" }} status="pending" />
    </div>
  );
}
