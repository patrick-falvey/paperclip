export interface InvokeInput {
  runtimeArn: string;
  prompt: string;
  sessionId: string;
  memoryId?: string;
  guardrailId?: string;
  guardrailVersion?: string;
}

export function buildInvokeParams(input: InvokeInput) {
  return {
    agentRuntimeArn: input.runtimeArn,
    inputText: input.prompt,
    sessionId: input.sessionId,
    memoryId: input.memoryId,
    ...(input.guardrailId && {
      guardrailConfiguration: {
        guardrailIdentifier: input.guardrailId,
        guardrailVersion: input.guardrailVersion ?? "DRAFT",
      },
    }),
  };
}
