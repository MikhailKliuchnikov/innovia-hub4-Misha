import { useCallback, useEffect, useState } from "react";
import { chatbotApi } from "../api/chatbot";
import type { ChatMessage } from "../api/types";
import { clearChatHistory, loadChatHistory, saveChatHistory } from "../lib/chatStorage";

const MAX_MESSAGE_LENGTH = 2_000;

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return { id: createId(), role, content, createdAt: new Date().toISOString() };
}

export function useChatbot(userId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadChatHistory(userId));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedMessage, setFailedMessage] = useState<string | null>(null);

  useEffect(() => {
    setMessages(loadChatHistory(userId));
    setIsLoading(false);
    setError(null);
    setFailedMessage(null);
  }, [userId]);

  const sendMessage = useCallback(
    async (content: string, isRetry = false) => {
      const trimmed = content.trim();
      if (!trimmed) {
        setError("Skriv ett meddelande först.");
        return false;
      }
      if (trimmed.length > MAX_MESSAGE_LENGTH) {
        setError("Meddelandet får vara högst 2 000 tecken.");
        return false;
      }

      setError(null);
      setIsLoading(true);
      if (!isRetry) {
        setMessages((current) => {
          const next = [...current, createMessage("user", trimmed)];
          saveChatHistory(userId, next);
          return next;
        });
      }

      try {
        const response = await chatbotApi.sendMessage(trimmed);
        setMessages((current) => {
          const next = [...current, createMessage("assistant", response.message)];
          saveChatHistory(userId, next);
          return next;
        });
        setFailedMessage(null);
        return true;
      } catch {
        setFailedMessage(trimmed);
        setError("Kunde inte hämta ett svar just nu. Försök igen.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const retryLastMessage = useCallback(async () => {
    if (!failedMessage) return false;
    return sendMessage(failedMessage, true);
  }, [failedMessage, sendMessage]);

  const clearMessages = useCallback(() => {
    clearChatHistory(userId);
    setMessages([]);
    setError(null);
    setFailedMessage(null);
  }, [userId]);

  return {
    messages,
    isLoading,
    error,
    failedMessage,
    sendMessage,
    retryLastMessage,
    clearMessages,
  };
}
