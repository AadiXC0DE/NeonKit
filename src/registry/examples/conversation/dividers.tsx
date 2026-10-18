import { ChatMessage } from "@/components/ui/chat-message";
import { Conversation, ConversationDivider } from "@/components/ui/conversation";

export default function ConversationDividers() {
  return (
    <Conversation className="h-[440px] w-full max-w-2xl" initialScroll="top">
      <ConversationDivider>Monday, October 12</ConversationDivider>
      <ChatMessage
        from="user"
        layout="bubble"
        time="17:40"
        content="Draft the changelog entry for invite expiry. Keep it under 60 words."
      />
      <ChatMessage
        from="assistant"
        layout="bubble"
        name="Argon"
        time="17:40"
        content={"**Invites now expire.** New invites stop working after 7 days. Change the window per team in Settings → Members, or turn expiry off for teams that sign in with SSO. Existing invites keep their current behaviour until they're resent."}
      />
      <ConversationDivider>Today</ConversationDivider>
      <ChatMessage from="system" time="09:02" content="Priya Raman joined the thread." />
      <ChatMessage from="user" layout="bubble" time="09:05" content="Ship it with the 2.4 notes. Priya will add the screenshot." />
    </Conversation>
  );
}
