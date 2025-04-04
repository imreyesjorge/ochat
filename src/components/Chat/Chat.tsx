"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatBubble } from "../ChatBubble";
import { PromptInput } from "../PromptInput";
import { useOllamaStatus } from "@/hooks/useOllamaStatus";
import { marked } from "marked";

enum ROLE_TYPE {
  USER = "user",
  AGENT = "assistant",
}

type Message = {
  role: ROLE_TYPE;
  content?: string;
};

export function Chat() {
  const model = "gemma3:1b";

  const [messages, setMessages] = useState<Message[]>([]);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const [thinking, setIsThinking] = useState<boolean>(false);

  const container = useRef<HTMLDivElement>(null);

  const { isDead, isTrying, retryConnection } = useOllamaStatus();

  const getResponse = useCallback(async () => {
    let message = "";
    setIsThinking(true);
    setLastMessage(() => ({ role: ROLE_TYPE.AGENT, content: undefined }));

    try {
      const response = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        body: JSON.stringify({
          model,
          stream: true,
          messages,
        }),
      });

      if (!response?.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) return;

        // replace(/<think>.*<\/think>/gs, "")
        message += JSON.parse(decoder.decode(value)).message.content;
        //@ts-expect-error temporary ignore
        setLastMessage((prev) => ({
          ...prev,
          content: message,
        }));
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
    } finally {
      setIsThinking(false);
      setMessages((prev) => [
        ...prev,
        {
          content: message,
          role: ROLE_TYPE.AGENT,
        },
      ]);
      setLastMessage(() => null);
    }
  }, [messages]);

  const addMessage = (prompt: FormDataEntryValue | null) => {
    if (!prompt) return;

    setMessages((prev) => [
      ...prev,
      { content: String(prompt), role: ROLE_TYPE.USER },
    ]);
  };

  useEffect(() => {
    if (!messages.length) return;

    if (messages[messages.length - 1]?.role === ROLE_TYPE.AGENT) return;

    getResponse();
  }, [messages, getResponse]);

  useEffect(() => {
    if (container.current) {
      container.current.scrollTop = container.current.scrollHeight;
    }
  }, [messages, lastMessage]);

  if (isTrying) {
    return (
      <main className="size-full grid place-items-center">
        <p className="animate-pulse py-2 px-4 rounded-lg bg-zinc-800">
          Trying to reach the Ollama server...
        </p>
      </main>
    );
  }

  if (isDead) {
    return (
      <main className="size-full grid place-items-center">
        <div className="flex flex-col gap-2 items-center">
          <p className="py-2 px-4 rounded-lg bg-zinc-800">
            Couldn’t connect to the Ollama server.
          </p>
          <button
            className="text-zinc-600 cursor-pointer hover:text-zinc-400"
            onClick={retryConnection}
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="size-full max-h-full grid grid-rows-[1fr_min-content] overflow-hidden relative">
      <div className="w-full flex p-4 justify-center absolute top-0 left-0 backdrop-blur-xs">
        <p className="text-zinc-600 border bg-zinc-950 border-zinc-700 py-1 px-2 text-sm font-medium rounded-lg">
          {model}
        </p>
      </div>
      <div
        className="p-6 flex flex-col gap-6 overflow-y-auto pt-20"
        ref={container}
      >
        {messages.map(({ content, role }, index) => (
          <ChatBubble
            key={index}
            isUser={role === ROLE_TYPE.USER}
            timeStamp="13:48"
            message={marked.parse(content ?? "")}
          />
        ))}
        {lastMessage && (
          <ChatBubble
            timeStamp="13:48"
            thinking={!lastMessage.content}
            message={marked.parse(lastMessage.content ?? "")}
          />
        )}
      </div>
      <PromptInput onSubmit={addMessage} disabled={thinking} />
    </main>
  );
}
