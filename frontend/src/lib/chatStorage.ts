import type { ChatMessage } from "../api/types";

const MAX_MESSAGES = 50;

function storageKey(userId: string) {
  return `innovia-chat-history:${userId}`;
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Partial<ChatMessage>;
  return (
    typeof message.id === "string" &&
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    typeof message.createdAt === "string"
  );
}

function limitMessages(messages: ChatMessage[]) {
  return messages.slice(-MAX_MESSAGES);
}

export function loadChatHistory(userId: string): ChatMessage[] {
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return limitMessages(parsed.filter(isChatMessage));
  } catch {
    return [];
  }
}

export function saveChatHistory(userId: string, messages: ChatMessage[]) {
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(limitMessages(messages)));
  } catch {
    // Local storage can be unavailable in private browsing or restricted environments.
  }
}

export function clearChatHistory(userId: string) {
  try {
    window.localStorage.removeItem(storageKey(userId));
  } catch {
    // Clearing local history is best effort when storage is unavailable.
  }
}
