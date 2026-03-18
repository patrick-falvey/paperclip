#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import type { CellStackConfig } from "../lib/cell-config.js";
import { CellStack } from "../lib/cell-stack.js";

const app = new cdk.App();

const subdomain = app.node.tryGetContext("subdomain");
const customerId = app.node.tryGetContext("customerId");
const region = app.node.tryGetContext("region") ?? "us-east-1";
const vpcId = app.node.tryGetContext("vpcId");
const albListenerArn = app.node.tryGetContext("albListenerArn");
const paperclipImage = app.node.tryGetContext("paperclipImage");

if (!subdomain || !customerId || !vpcId || !albListenerArn || !paperclipImage) {
  throw new Error(
    "Missing required context values. Provide: subdomain, customerId, vpcId, albListenerArn, paperclipImage",
  );
}

const config: CellStackConfig = {
  subdomain,
  customerId,
  region,
  vpcId,
  albListenerArn,
  paperclipImage,
};

new CellStack(app, `paperclip-cell-${subdomain}`, config, {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region },
});

app.synth();
