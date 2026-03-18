import { pgTable, uuid, text, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    subdomain: text("subdomain").notNull(),
    status: text("status").notNull().default("pending"),
    brandLogoUrl: text("brand_logo_url"),
    brandAccentColor: text("brand_accent_color"),
    contactEmail: text("contact_email"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    subdomainUniqueIdx: uniqueIndex("customers_subdomain_idx").on(table.subdomain),
  }),
);

export const cells = pgTable(
  "cells",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id),
    status: text("status").notNull().default("provisioning"),
    awsRegion: text("aws_region").notNull().default("us-east-1"),
    rdsEndpoint: text("rds_endpoint"),
    rdsSecurityGroupId: text("rds_security_group_id"),
    s3BucketArn: text("s3_bucket_arn"),
    ecsServiceArn: text("ecs_service_arn"),
    ecsTaskRoleArn: text("ecs_task_role_arn"),
    agentCoreRuntimeArn: text("agent_core_runtime_arn"),
    kmsKeyArn: text("kms_key_arn"),
    cdkStackName: text("cdk_stack_name"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    customerIdIdx: index("cells_customer_id_idx").on(table.customerId),
  }),
);

export const cellProvisioningEvents = pgTable(
  "cell_provisioning_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cellId: uuid("cell_id")
      .notNull()
      .references(() => cells.id),
    eventType: text("event_type").notNull(),
    message: text("message"),
    metadata: text("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    cellIdIdx: index("cell_provisioning_events_cell_id_idx").on(table.cellId),
  }),
);
