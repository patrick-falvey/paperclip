export interface AgentCoreConfig {
  region: string;
  runtimeArn: string;
  memoryId?: string;
  guardrailId?: string;
  guardrailVersion?: string;
}
