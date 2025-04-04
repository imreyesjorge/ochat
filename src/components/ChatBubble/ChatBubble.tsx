type ChatBubbleProps = {
  isUser?: boolean;
  timeStamp: string;
  thinking?: boolean;
  message: string | Promise<string>;
};

export function ChatBubble({
  isUser,
  timeStamp,
  thinking,
  message,
}: ChatBubbleProps) {
  return (
    <article className="text-zinc-100 grid grid-rows-[min-content_1fr] gap-2">
      <p className="text-sm flex items-center gap-2">
        <span className="font-bold">{isUser ? "You" : "AI Agent"}</span>
        <span className="mt-px text-zinc-600 text-xs">{timeStamp}</span>
      </p>
      {thinking ? (
        <p className="animate-pulse">Thinking...</p>
      ) : (
        <div
          className="text-base text-zinc-300 flex flex-col gap-4 leading-relaxed [&>ul]:list-disc [&>ol]:list-decimal [&>ul,ol]:pl-5 [&>ul,ol]:flex [&>ul,ol]:flex-col [&>ul,ol]:gap-4 [&>h1,h2,h3,h4,h5,h6]:text-4xl [&>hr]:text-zinc-900"
          dangerouslySetInnerHTML={{ __html: message }}
        />
      )}
    </article>
  );
}
