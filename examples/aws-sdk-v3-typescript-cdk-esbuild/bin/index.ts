#!/usr/bin/env node

import {
  MainAppStack,
  MainAppStackProps,
} from "../lib/constructs/MainAppStack";
import { App, Aws } from "aws-cdk-lib";

export const DEFAULT_REGION = "us-west-1";
export const BACKUP_REGION = "us-west-2";
export const STAGE_NAME_VERSION = "v1"; // stage of api, keep default as v1
export enum StagingEnvironment {
  DEV = "dev",
  PROD = "prod",
}


const app = new App();

const DEFAULT_PROPS = {
  env: { account: Aws.ACCOUNT_ID, region: DEFAULT_REGION },
};

// DEVELOPMENT

// 1. Define props for dev

const DEV_PROPS: MainAppStackProps = {
  ...DEFAULT_PROPS,
  stage: StagingEnvironment.DEV,
  pointInTimeRecoveryEnabled: false,
  defaultRegion: DEFAULT_PROPS.env.region,
  backupRegion: BACKUP_REGION,
  appName: "aws-sdk-v3-typescript-cdk-esbuild",
};

try {
  // 2. Create nested app stack
  new MainAppStack(app, "aws-sdk-v3-typescript-cdk-esbuild", {
    ...DEV_PROPS,
  });
  console.log("Everything built");
} catch (error) {
  console.error({ error }, "Error building stack");
}

app.synth();
