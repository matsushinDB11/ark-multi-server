import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {VpcEc2} from "./resource/vpc-ec2";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ArkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'ArkQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    const vpcEc2 = new VpcEc2(this, 'ArkVpcEc2')
  }
}
