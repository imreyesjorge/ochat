"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatBubble } from "../ChatBubble";
import { PromptInput } from "../PromptInput";
import { ModelSelector } from "../ModelSelector";
import { useOllamaStatus } from "@/hooks/useOllamaStatus";
import { useOllamaModels } from "@/hooks/useOllamaModels";
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const [thinking, setIsThinking] = useState<boolean>(false);
  const [isUserScrolling, setIsUserScrolling] = useState<boolean>(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState<boolean>(true);

  const container = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTopRef = useRef<number>(0);

  const { isDead, isTrying, retryConnection } = useOllamaStatus();
  const { models, selectedModel, setSelectedModel, isLoading: modelsLoading, error: modelsError } = useOllamaModels();

  // Check if user is near the bottom of the scroll container
  const isNearBottom = useCallback(() => {
    if (!container.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = container.current;
    return scrollHeight - scrollTop - clientHeight < 100; // 100px threshold
  }, []);

  // Smooth scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    if (!container.current) return;
    
    container.current.scrollTo({
      top: container.current.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }, []);

  // Handle scroll events to detect user interaction
  const handleScroll = useCallback(() => {
    if (!container.current) return;

    const currentScrollTop = container.current.scrollTop;
    const isScrollingUp = currentScrollTop < lastScrollTopRef.current;
    
    // If user scrolled up manually, disable auto-scroll
    if (isScrollingUp && !isUserScrolling) {
      setIsUserScrolling(true);
      setShouldAutoScroll(false);
    }
    
    // If user scrolled back to near bottom, re-enable auto-scroll
    if (isNearBottom() && isUserScrolling) {
      setIsUserScrolling(false);
      setShouldAutoScroll(true);
    }

    lastScrollTopRef.current = currentScrollTop;

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set a timeout to detect when scrolling stops
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 150);
  }, [isUserScrolling, isNearBottom]);

  const getResponse = useCallback(async () => {
    if (!selectedModel) {
      console.error("No model selected");
      return;
    }

    let message = "";
    setIsThinking(true);
    setLastMessage(() => ({ role: ROLE_TYPE.AGENT, content: undefined }));
    
    // Ensure auto-scroll is enabled when starting a new response
    if (isNearBottom()) {
      setShouldAutoScroll(true);
    }

    try {
      const response = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        body: JSON.stringify({
          model: selectedModel,
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
  }, [messages, selectedModel, isNearBottom]);

  const addMessage = (prompt: FormDataEntryValue | null) => {
    if (!prompt) return;

    // Enable auto-scroll when user sends a new message
    setShouldAutoScroll(true);
    setIsUserScrolling(false);

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

  // Handle auto-scrolling during message updates
  useEffect(() => {
    if (shouldAutoScroll && !isUserScrolling) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        scrollToBottom(true);
      });
    }
  }, [messages, lastMessage, shouldAutoScroll, isUserScrolling, scrollToBottom]);

  // Set up scroll event listener
  useEffect(() => {
    const containerElement = container.current;
    if (!containerElement) return;

    containerElement.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      containerElement.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  // Initialize scroll position on mount
  useEffect(() => {
    if (container.current) {
      lastScrollTopRef.current = container.current.scrollTop;
    }
  }, []);

  // Show loading state while fetching models
  if (modelsLoading) {
    return (
      <main className="size-full grid place-items-center">
        <p className="animate-pulse py-2 px-4 rounded-lg bg-zinc-800">
          Loading available models...
        </p>
      </main>
    );
  }

  // Show error state if models failed to load
  if (modelsError) {
    return (
      <main className="size-full grid place-items-center">
        <div className="flex flex-col gap-2 items-center">
          <p className="py-2 px-4 rounded-lg bg-zinc-800 text-red-400">
            Failed to load models: {modelsError}
          </p>
          <button
            className="text-zinc-600 cursor-pointer hover:text-zinc-400"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  // Show message if no models are available
  if (models.length === 0) {
    return (
      <main className="size-full grid place-items-center">
        <div className="flex flex-col gap-2 items-center">
          <p className="py-2 px-4 rounded-lg bg-zinc-800">
            No models found. Please install a model using Ollama.
          </p>
          <p className="text-sm text-zinc-600">
            Run: <code className="bg-zinc-800 px-2 py-1 rounded">ollama pull &lt;model-name&gt;</code>
          </p>
        </div>
      </main>
    );
  }

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
      <div className="w-full flex p-4 justify-center absolute top-0 left-0 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <ModelSelector
            models={models}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            disabled={thinking}
          />
          {models.length > 1 && (
            <div className="flex items-center gap-1 text-zinc-500 text-xs bg-zinc-950/60 backdrop-blur-sm px-2 py-1 rounded-lg border border-zinc-800/40">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span>{models.length} models</span>
            </div>
          )}
        </div>
      </div>
      <div
        className="p-6 flex flex-col gap-6 overflow-y-auto pt-20 scroll-smooth"
        ref={container}
        style={{ scrollBehavior: 'smooth' }}
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
      
      {/* Scroll to bottom button */}
      {!shouldAutoScroll && (
        <button
          onClick={() => {
            setShouldAutoScroll(true);
            setIsUserScrolling(false);
            scrollToBottom(true);
          }}
          className="absolute bottom-20 right-6 bg-zinc-800 hover:bg-zinc-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 border border-zinc-600"
          aria-label="Scroll to bottom"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 13l3 3 3-3" />
            <path d="M7 6l3 3 3-3" />
          </svg>
        </button>
      )}
      
      <PromptInput onSubmit={addMessage} disabled={thinking} />
    </main>
  );
}
