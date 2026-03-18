import { describe, expect, it } from "vitest";
import { buildInvokeParams } from "../server/client.js";

describe("AgentCore client", () => {
  it("builds invoke params from execution context", () => {
    const params = buildInvokeParams({
      runtimeArn: "arn:aws:bedrock-agentcore:us-east-1:123:runtime/test-rt",
      memoryId: "mem-123",
      prompt: "Review the open issues and prioritize them",
      sessionId: "session-abc",
    });
    expect(params.agentRuntimeArn).toBe(
      "arn:aws:bedrock-agentcore:us-east-1:123:runtime/test-rt",
    );
    expect(params.inputText).toBe(
      "Review the open issues and prioritize them",
    );
    expect(params.sessionId).toBe("session-abc");
    expect(params.memoryId).toBe("mem-123");
  });

  it("omits memoryId when not provided", () => {
    const params = buildInvokeParams({
      runtimeArn: "arn:aws:bedrock-agentcore:us-east-1:123:runtime/test-rt",
      prompt: "Do something",
      sessionId: "session-abc",
    });
    expect(params.memoryId).toBeUndefined();
  });

  it("includes guardrail config when guardrailId is provided", () => {
    const params = buildInvokeParams({
      runtimeArn: "arn:aws:bedrock-agentcore:us-east-1:123:runtime/test-rt",
      prompt: "Do something",
      sessionId: "session-abc",
      guardrailId: "guard-123",
      guardrailVersion: "1",
    });
    expect(params.guardrailConfiguration).toEqual({
      guardrailIdentifier: "guard-123",
      guardrailVersion: "1",
    });
  });

  it("defaults guardrail version to DRAFT when not specified", () => {
    const params = buildInvokeParams({
      runtimeArn: "arn:aws:bedrock-agentcore:us-east-1:123:runtime/test-rt",
      prompt: "Do something",
      sessionId: "session-abc",
      guardrailId: "guard-123",
    });
    expect(params.guardrailConfiguration?.guardrailVersion).toBe("DRAFT");
  });

  it("omits guardrail config when guardrailId is not provided", () => {
    const params = buildInvokeParams({
      runtimeArn: "arn:aws:bedrock-agentcore:us-east-1:123:runtime/test-rt",
      prompt: "Do something",
      sessionId: "session-abc",
    });
    expect(params.guardrailConfiguration).toBeUndefined();
  });
});
