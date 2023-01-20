import { RemovalPolicy, Token } from 'aws-cdk-lib';
import {
  AmazonLinuxGeneration,
  AmazonLinuxImage,
  CfnKeyPair,
  Instance,
  InstanceClass,
  InstanceSize,
  InstanceType,
  IpAddresses,
  SubnetType,
  Vpc,
} from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class VpcEc2 extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const vpc = new Vpc(scope, 'ArkVpc', {
      ipAddresses: IpAddresses.cidr('10.0.0.0/16'),
      vpcName: 'ark-vpc',
    });

    const keyPair = new CfnKeyPair(scope, 'ArkKeyPair', {
      keyName: 'ark-key',
      keyType: 'ED25519',
    });
    keyPair.applyRemovalPolicy(RemovalPolicy.DESTROY);

    const ec2 = new Instance(scope, 'ArkEc2', {
      vpc: vpc,
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MEDIUM),
      machineImage: new AmazonLinuxImage({
        generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      keyName: Token.asString(keyPair.ref),
      vpcSubnets: vpc.selectSubnets({ subnetType: SubnetType.PUBLIC }),
    });
  }
}
