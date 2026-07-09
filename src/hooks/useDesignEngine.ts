import { useState, useCallback } from "react";
import type { SlabInputs, DesignResults } from "@/types";
import { runACI318Design, getGovernResults, generateRecommendations } from "@/lib/calculations/aci318";
import { runIS456Design } from "@/lib/calculations/is456";

export function useDesignEngine() {
  const [results, setResults] = useState<DesignResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const runDesign = useCallback(async (inputs: SlabInputs) => {
    setIsCalculating(true);
    await new Promise((r) => setTimeout(r, 800)); // simulate processing

    const checks =
      inputs.designCode === "ACI318"
        ? runACI318Design(inputs)
        : runIS456Design(inputs);

    const { governingDCR, governingCheck, overallStatus } = getGovernResults(checks);
    const recommendations = generateRecommendations(checks, inputs);

    const result: DesignResults = {
      inputs,
      checks,
      governingDCR,
      governingCheck,
      overallStatus,
      recommendations,
      timestamp: new Date().toISOString(),
    };

    setResults(result);
    setIsCalculating(false);

    // Persist to localStorage
    try {
      const history = JSON.parse(localStorage.getItem("slab-design-history") || "[]");
      history.unshift({ ...result, id: Date.now() });
      localStorage.setItem("slab-design-history", JSON.stringify(history.slice(0, 10)));
    } catch {}

    return result;
  }, []);

  return { results, isCalculating, runDesign };
}
