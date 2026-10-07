import type { ChatMessage } from "../../api/types";

interface Props { messages: ChatMessage[]; isLoading: boolean; }

export function ChatMessageList({ messages, isLoading }: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4" aria-live="polite" aria-label="Chatthistorik">
      {messages.length === 0 && !isLoading && <div className="my-auto rounded-lg bg-gray-50 p-4 text-sm text-gray-600 dark:bg-gray-800/70 dark:text-gray-300"><p className="font-medium text-gray-900 dark:text-gray-100">Hej! Hur kan jag hjälpa dig?</p><p className="mt-1">Jag kan svara på frågor om Innovia Hub. Jag kan inte skapa eller avboka bokningar.</p></div>}
      {messages.map((message) => <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-5 ${message.role === "user" ? "rounded-br-md bg-indigo-600 text-white" : "rounded-bl-md bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"}`}>{message.content}</div></div>)}
      {isLoading && <div className="flex justify-start" role="status" aria-label="Chatboten skriver"><div className="rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-300">Skriver...</div></div>}
    </div>
  );
}
