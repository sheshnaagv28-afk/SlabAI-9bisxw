import { useState, useCallback } from "react";
import type { SlabInputs, ChatMessage, ChatState } from "@/types";
import { CHAT_STEPS, processUserInput, getQuickReplies } from "@/lib/chatbot";
import { DEFAULT_INPUTS } from "@/constants";

export function useChatbot(onComplete: (inputs: SlabInputs) => void) {
  const [state, setState] = useState<ChatState>({
    messages: [
      {
        id: "init",
        role: "assistant",
        content: CHAT_STEPS[0].question,
        timestamp: new Date(),
      },
    ],
    currentStep: 1,
    collectedInputs: { ...DEFAULT_INPUTS },
    isComplete: false,
  });

  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(
    async (userInput: string) => {
      if (state.isComplete || isTyping) return;

      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: userInput,
        timestamp: new Date(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMsg],
      }));

      setIsTyping(true);

      await new Promise((r) => setTimeout(r, 600));

      const currentStep = CHAT_STEPS[state.currentStep];
      if (!currentStep) return;

      let newInputs = { ...state.collectedInputs };
      let errorMsg: string | null = null;
      let nextStepIndex = state.currentStep + 1;

      if (!currentStep.isInfo) {
        const result = processUserInput(userInput, currentStep);
        if (result.error) {
          errorMsg = result.error;
          nextStepIndex = state.currentStep; // stay on same step
        } else if (result.value) {
          newInputs = { ...newInputs, ...result.value };
        }
      }

      const nextStep = CHAT_STEPS[nextStepIndex];
      const isComplete = nextStepIndex >= CHAT_STEPS.length;

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: errorMsg
          ? `⚠️ ${errorMsg}\n\n${currentStep.question}`
          : nextStep
          ? nextStep.question
          : CHAT_STEPS[CHAT_STEPS.length - 1].question,
        timestamp: new Date(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMsg],
        currentStep: nextStepIndex,
        collectedInputs: newInputs,
        isComplete,
      }));

      setIsTyping(false);

      if (isComplete && !errorMsg) {
        const finalInputs = newInputs as SlabInputs;
        onComplete(finalInputs);
      }
    },
    [state, isTyping, onComplete]
  );

  const getCurrentQuickReplies = useCallback(() => {
    const step = CHAT_STEPS[state.currentStep];
    return step ? getQuickReplies(step.id) : [];
  }, [state.currentStep]);

  const resetChat = useCallback(() => {
    setState({
      messages: [
        {
          id: "init",
          role: "assistant",
          content: CHAT_STEPS[0].question,
          timestamp: new Date(),
        },
      ],
      currentStep: 1,
      collectedInputs: { ...DEFAULT_INPUTS },
      isComplete: false,
    });
  }, []);

  const progress = Math.round(
    ((state.currentStep - 1) / (CHAT_STEPS.length - 2)) * 100
  );

  return {
    messages: state.messages,
    isComplete: state.isComplete,
    isTyping,
    currentStep: state.currentStep,
    totalSteps: CHAT_STEPS.length - 2,
    progress: Math.min(100, Math.max(0, progress)),
    collectedInputs: state.collectedInputs,
    quickReplies: getCurrentQuickReplies(),
    sendMessage,
    resetChat,
  };
}
