import { useState } from "react";

const MAX_MESSAGE_LENGTH = 2_000;

interface Props { isLoading: boolean; error: string | null; failedMessage: string | null; onSend: (message: string) => Promise<boolean>; onRetry: () => Promise<boolean>; }

export function ChatComposer({ isLoading, error, failedMessage, onSend, onRetry }: Props) {
  const [value, setValue] = useState("");
  async function submit() { if (await onSend(value)) setValue(""); }
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); if (!isLoading) void submit(); }
  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); if (!isLoading) void submit(); } }
  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3 dark:border-gray-800">
      {error && <div className="mb-2 flex items-center justify-between gap-2 text-xs text-red-600 dark:text-red-400" role="alert"><span>{error}</span>{failedMessage && <button type="button" onClick={() => void onRetry()} className="shrink-0 font-semibold underline">Försök igen</button>}</div>}
      <label htmlFor="chatbot-message" className="sr-only">Skriv ett meddelande</label>
      <div className="flex items-end gap-2"><textarea id="chatbot-message" value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={handleKeyDown} placeholder="Skriv din fråga..." rows={2} maxLength={MAX_MESSAGE_LENGTH} disabled={isLoading} className="min-h-10 flex-1 resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:disabled:bg-gray-800" /><button type="submit" disabled={isLoading || !value.trim()} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">Skicka</button></div>
      <div className="mt-1 text-right text-[11px] text-gray-400" aria-live="polite">{value.length.toLocaleString("sv-SE")} / {MAX_MESSAGE_LENGTH.toLocaleString("sv-SE")}</div>
    </form>
  );
}
