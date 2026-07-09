import { useEffect, useRef, useState } from "react";
import { Send, RotateCcw, CheckCircle, Loader2, Bot, User } from "lucide-react";
import { useChatbot } from "@/hooks/useChatbot";
import type { SlabInputs } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  onComplete: (inputs: SlabInputs) => void;
}

export default function ChatBot({ onComplete }: Props) {
  const { messages, isTyping, progress, totalSteps, currentStep, quickReplies, isComplete, sendMessage, resetChat } =
    useChatbot(onComplete);

  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (value?: string) => {
    const msg = value ?? input.trim();
    if (!msg) return;
    sendMessage(msg);
    setInput("");
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Progress Bar */}
      <div className="px-4 py-3 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 font-medium">
            Design Input Progress
          </span>
          <span className="text-xs text-sky-400 font-semibold">
            {isComplete ? "Complete!" : `Step ${Math.min(currentStep, totalSteps)} of ${totalSteps}`}
          </span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${isComplete ? 100 : progress}%` }}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
          >
            <div
              className={cn(
                "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold",
                msg.role === "assistant"
                  ? "bg-gradient-to-br from-sky-500 to-blue-600 text-white"
                  : "bg-slate-600 text-slate-200"
              )}
            >
              {msg.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "assistant"
                  ? "bg-slate-800 text-slate-200 rounded-tl-sm"
                  : "bg-sky-600 text-white rounded-tr-sm"
              )}
            >
              {msg.content.split("\n").map((line, i) => (
                <p key={i} className={i > 0 ? "mt-1" : ""}>
                  {line.replace(/\*\*(.*?)\*\*/g, "$1")}
                </p>
              ))}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {isComplete && (
          <div className="flex items-center gap-2 justify-center py-2">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <span className="text-sm text-emerald-400 font-medium">All inputs collected — running design checks...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick Replies */}
      {quickReplies.length > 0 && !isComplete && !isTyping && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              onClick={() => handleSend(reply)}
              className="text-xs px-3 py-1.5 rounded-full border border-sky-500/40 text-sky-400 hover:bg-sky-500/10 transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={isComplete ? "Design complete!" : "Type your answer..."}
            disabled={isComplete || isTyping}
            className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:opacity-50 transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isComplete || isTyping}
            className="h-10 w-10 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <Send className="h-4 w-4 text-white" />
          </button>
          <button
            onClick={resetChat}
            title="Reset conversation"
            className="h-10 w-10 rounded-xl border border-slate-600 hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <RotateCcw className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
