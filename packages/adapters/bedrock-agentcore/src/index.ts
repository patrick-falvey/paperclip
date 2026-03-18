export const type = "bedrock_agentcore";
export const label = "AWS Bedrock AgentCore";

export const models = [
  { id: "anthropic.claude-sonnet-4-v1:0", label: "Claude Sonnet 4 (Bedrock)" },
  { id: "anthropic.claude-haiku-4-v1:0", label: "Claude Haiku 4 (Bedrock)" },
  { id: "anthropic.claude-opus-4-v1:0", label: "Claude Opus 4 (Bedrock)" },
];

export const agentConfigurationDoc = `# bedrock_agentcore agent configuration

Adapter: bedrock_agentcore

Use when:
- You are running Paperclip in a multi-tenant cell deployment on AWS.
- Agent execution must go through AWS Bedrock AgentCore (no local process spawning).

Don't use when:
- You are running agents locally with Claude Code CLI.
- Your deployment does not use AWS Bedrock AgentCore.

Core fields:
- region (string, required): AWS region for Bedrock AgentCore (e.g. us-east-1)
- runtimeArn (string, required): AgentCore runtime endpoint ARN
- memoryId (string, optional): AgentCore memory identifier for session continuity
- guardrailId (string, optional): Bedrock Guardrail identifier
- guardrailVersion (string, optional): Bedrock Guardrail version (required if guardrailId is set)

Notes:
- All agent execution is routed through AgentCore; no local processes are spawned.
- The adapter does not support local agent JWT since agents are managed by AgentCore.
- AWS credentials are resolved from the environment (IAM role, instance profile, etc.).
`;

export type { AgentCoreConfig } from "./types.js";
