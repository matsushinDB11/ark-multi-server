#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ArkStack } from '../lib/ark-stack';
import { DefaultStackSynthesizer } from 'aws-cdk-lib';

const app = new cdk.App();
new ArkStack(app, 'ArkStack', {
  synthesizer: new DefaultStackSynthesizer({
    fileAssetsBucketName: 'ark-multi-server-asset',
  }),
  description: 'This is ark survival evolved multi play server',
});
