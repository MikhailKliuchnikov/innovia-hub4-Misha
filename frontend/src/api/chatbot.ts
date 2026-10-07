import { api } from "./client";
import type { ChatbotResponse } from "./types";

export const chatbotApi = {
  sendMessage: (message: string) =>
    api.post<ChatbotResponse>("/chatbot/messages", { message }),
};
