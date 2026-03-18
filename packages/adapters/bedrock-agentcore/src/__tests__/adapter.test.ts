import { describe, expect, it } from "vitest";
import * as adapterModule from "../index.js";
import { execute } from "../server/execute.js";
import { testEnvironment } from "../server/test.js";

const { type, label, models, agentConfigurationDoc } = adapterModule;

describe("bedrock-agentcore adapter", () => {
  it("has type bedrock_agentcore", () => {
    expect(type).toBe("bedrock_agentcore");
  });

  it("has a label", () => {
    expect(label).toBe("AWS Bedrock AgentCore");
  });

  it("declares models", () => {
    expect(models).toBeInstanceOf(Array);
    expect(models.length).toBeGreaterThan(0);
    for (const model of models) {
      expect(model).toHaveProperty("id");
      expect(model).toHaveProperty("label");
      expect(typeof model.id).toBe("string");
      expect(typeof model.label).toBe("string");
    }
  });

  it("includes Claude Sonnet, Haiku, and Opus models", () => {
    const ids = models.map((m) => m.id);
    expect(ids).toContain("anthropic.claude-sonnet-4-v1:0");
    expect(ids).toContain("anthropic.claude-haiku-4-v1:0");
    expect(ids).toContain("anthropic.claude-opus-4-v1:0");
  });

  it("does not support local agent JWT", () => {
    // The adapter does not export supportsLocalAgentJwt = true.
    // When registered, supportsLocalAgentJwt should be false (or undefined, which is falsy).
    // The field is optional on ServerAdapterModule and defaults to falsy.
    const mod = adapterModule as Record<string, unknown>;
    expect(mod.supportsLocalAgentJwt ?? false).toBe(false);
  });

  it("has an agentConfigurationDoc string", () => {
    expect(typeof agentConfigurationDoc).toBe("string");
    expect(agentConfigurationDoc.length).toBeGreaterThan(0);
    expect(agentConfigurationDoc).toContain("bedrock_agentcore");
  });

  it("has an execute function that throws not-yet-implemented", async () => {
    expect(typeof execute).toBe("function");
    await expect(
      execute({
        runId: "test-run",
        agent: {
          id: "agent-1",
          companyId: "company-1",
          name: "Test Agent",
          adapterType: "bedrock_agentcore",
          adapterConfig: {},
        },
        runtime: {
          sessionId: null,
          sessionParams: null,
          sessionDisplayId: null,
          taskKey: null,
        },
        config: {},
        context: {},
        onLog: async () => {},
      }),
    ).rejects.toThrow("Not yet implemented");
  });

  it("has a testEnvironment function that returns a pass result", async () => {
    expect(typeof testEnvironment).toBe("function");
    const result = await testEnvironment({
      companyId: "company-1",
      adapterType: "bedrock_agentcore",
      config: {},
    });
    expect(result.adapterType).toBe("bedrock_agentcore");
    expect(result.status).toBe("pass");
    expect(result.checks).toBeInstanceOf(Array);
    expect(result.checks.length).toBeGreaterThan(0);
    expect(result.testedAt).toBeTruthy();
  });
});
