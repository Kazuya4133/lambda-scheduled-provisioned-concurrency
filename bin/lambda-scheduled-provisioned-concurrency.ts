#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LambdaScheduledProvisionedConcurrencyStack } from '../lib/lambda-scheduled-provisioned-concurrency-stack';
import * as dotenv from 'dotenv';

dotenv.config();

const app = new cdk.App();

const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION;

new LambdaScheduledProvisionedConcurrencyStack(app, 'LambdaScheduledProvisionedConcurrencyStack', {
  env: {
    account: account,
    region: region
  }
});