export type CustomerStatus = "pending" | "provisioning" | "active" | "suspended" | "deprovisioning";
export type CellStatus = "provisioning" | "active" | "degraded" | "destroying" | "destroyed";
export type ProvisioningEventType =
  | "started"
  | "resource_created"
  | "migration_complete"
  | "active"
  | "error"
  | "destroy_started"
  | "destroyed";
