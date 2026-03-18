import type {
  AdapterExecutionContext,
  AdapterExecutionResult,
} from "@paperclipai/adapter-utils";

export async function execute(
  _ctx: AdapterExecutionContext,
): Promise<AdapterExecutionResult> {
  throw new Error("bedrock_agentcore execute: Not yet implemented");
}
