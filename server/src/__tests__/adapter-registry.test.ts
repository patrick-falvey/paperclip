import { describe, expect, it } from "vitest";
import { findServerAdapter, listServerAdapters } from "../adapters/index.js";

describe("adapter registry", () => {
  it("findServerAdapter returns the bedrock_agentcore adapter", () => {
    const adapter = findServerAdapter("bedrock_agentcore");
    expect(adapter).not.toBeNull();
    expect(adapter!.type).toBe("bedrock_agentcore");
  });

  it("listServerAdapters includes bedrock_agentcore", () => {
    const adapters = listServerAdapters();
    const types = adapters.map((a) => a.type);
    expect(types).toContain("bedrock_agentcore");
  });
});
