import { useEffect, useRef, useState } from "react";
import { Send, RotateCcw, CheckCircle, Bot, User } from "lucide-react";
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
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground font-medium">
            Design Input Progress
          </span>
          <span className="font-mono text-xs text-primary font-semibold tabular-nums">
            {isComplete ? "Complete!" : `Step ${Math.min(currentStep, totalSteps)} of ${totalSteps}`}
          </span>
        </div>
        <div className="h-[3px] bg-border overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
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
                "flex-shrink-0 h-8 w-8 rounded-[3px] flex items-center justify-center text-xs font-bold",
                msg.role === "assistant"
                  ? "bg-primary/15 text-primary border border-border"
                  : "bg-secondary text-foreground border border-border"
              )}
            >
              {msg.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>
            <div
              className={cn(
                "max-w-[80%] rounded-[4px] px-4 py-3 text-sm leading-relaxed",
                msg.role === "assistant"
                  ? "bg-secondary text-foreground"
                  : "bg-primary text-primary-foreground"
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
            <div className="h-8 w-8 rounded-[3px] bg-primary/15 border border-border flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-secondary rounded-[4px] px-4 py-3 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {isComplete && (
          <div className="flex items-center gap-2 justify-center py-2">
            <CheckCircle className="h-5 w-5 text-success" />
            <span className="text-sm text-success font-medium">All inputs collected — running design checks...</span>
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
              className="text-xs px-3 py-1.5 rounded-[3px] border border-primary/50 text-primary hover:bg-primary/10 transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={isComplete ? "Design complete!" : "Type your answer..."}
            disabled={isComplete || isTyping}
            className="flex-1 bg-background border border-border rounded-[3px] px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isComplete || isTyping}
            className="h-10 w-10 rounded-[3px] bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <Send className="h-4 w-4 text-primary-foreground" />
          </button>
          <button
            onClick={resetChat}
            title="Reset conversation"
            className="h-10 w-10 rounded-[3px] border border-border hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
