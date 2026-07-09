import type { CheckResult, SlabInputs } from "@/types";

export interface CheckModule<TInput = SlabInputs> {
  codeName: string;
  checkName: string;
  isImplemented: boolean;
  run: (input: TInput) => CheckResult;
}

export interface DesignCodeAdapter {
  codeName: string;
  checks: CheckModule[];
}
