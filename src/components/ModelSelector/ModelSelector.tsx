"use client";

import { useState, useRef, useEffect } from "react";

type ModelSelectorProps = {
  models: string[];
  selectedModel: string;
  onModelChange: (model: string) => void;
  disabled?: boolean;
  className?: string;
};

export function ModelSelector({
  models,
  selectedModel,
  onModelChange,
  disabled = false,
  className = "",
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const handleModelSelect = (model: string) => {
    onModelChange(model);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        disabled={disabled}
        className={`
          flex items-center justify-between gap-3 px-4 py-2.5 min-w-[200px]
          bg-zinc-950/80 backdrop-blur-sm border border-zinc-800/60
          rounded-xl text-sm font-medium text-zinc-300
          transition-all duration-200 ease-out
          hover:bg-zinc-900/60 hover:border-zinc-700/80
          focus:outline-none focus:ring-2 focus:ring-zinc-600/50 focus:border-zinc-600
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-zinc-950/80
          shadow-lg shadow-black/20
          ${isOpen ? 'ring-2 ring-zinc-600/50 border-zinc-600' : ''}
        `}
        title={disabled ? "Cannot change model while thinking" : "Select a model"}
      >
        <span className="truncate text-left flex-1">
          {selectedModel || "Select model..."}
        </span>
        <svg
          className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="
            absolute top-full left-0 right-0 mt-2 z-50
            bg-zinc-950/95 backdrop-blur-md border border-zinc-800/60
            rounded-xl shadow-2xl shadow-black/40
            max-h-64 overflow-y-auto
            transition-all duration-200 ease-out
            animate-[fadeInScale_200ms_ease-out_forwards]
          "
        >
          <div className="p-1">
            {models.map((model, index) => (
              <button
                key={model}
                onClick={() => handleModelSelect(model)}
                className={`
                  w-full text-left px-3 py-2.5 rounded-lg text-sm
                  transition-all duration-150 ease-out
                  hover:bg-zinc-800/60 hover:text-zinc-200
                  focus:outline-none focus:bg-zinc-800/60 focus:text-zinc-200
                  ${
                    model === selectedModel
                      ? "bg-zinc-800/80 text-zinc-200 font-medium"
                      : "text-zinc-400"
                  }
                  ${index === 0 ? "mt-0" : ""}
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{model}</span>
                  {model === selectedModel && (
                    <svg
                      className="w-4 h-4 text-zinc-400 ml-2 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}