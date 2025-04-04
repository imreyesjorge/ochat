import { FormEventHandler } from "react";

type PromptInputProps = {
  onSubmit?: (prompt: FormDataEntryValue | null) => void;
  disabled?: boolean;
};

export function PromptInput({ onSubmit, disabled }: PromptInputProps) {
  const handleSubmit: FormEventHandler = (event) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const prompt = new FormData(form).get("prompt");
    onSubmit?.(prompt);
    form.reset();
  };

  return (
    <form onSubmit={handleSubmit}>
      <fieldset
        disabled={disabled}
        className="w-full focus-within:bg-zinc-900/25 border-t border-zinc-900 transition flex items-center gap-2 pr-2"
      >
        <input type="text" className="w-full p-4 outline-none" name="prompt" />
        <button
          className={`p-2 bg-zinc-200 text-zinc-900 rounded-lg cursor-pointer ${disabled ? "pointer-events-none" : "pointer-event-auto"}`}
          type="submit"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 16 16"
            className="size-4 -rotate-90"
          >
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M9.75 3.5A2.75 2.75 0 0 0 7 6.25v5.19l2.22-2.22a.75.75 0 1 1 1.06 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 1 1 1.06-1.06l2.22 2.22V6.25a4.25 4.25 0 0 1 8.5 0v1a.75.75 0 0 1-1.5 0v-1A2.75 2.75 0 0 0 9.75 3.5"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </fieldset>
    </form>
  );
}
