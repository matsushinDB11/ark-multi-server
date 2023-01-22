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
  Peer,
  Port,
  SecurityGroup,
  SubnetType,
  Vpc,
} from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class VpcEc2 extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const vpc = new Vpc(this, 'ArkVpc', {
      ipAddresses: IpAddresses.cidr('10.0.0.0/16'),
      vpcName: 'ark-vpc',
    });

    const keyPair = new CfnKeyPair(this, 'ArkKeyPair', {
      keyName: 'ark-key',
      keyType: 'ED25519',
    });
    keyPair.applyRemovalPolicy(RemovalPolicy.DESTROY);

    const ec2SecurityGroup = new SecurityGroup(this, 'ark-ec2-security-group', {
      vpc: vpc,
      allowAllOutbound: true,
    });
    ec2SecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(22), 'ssh');
    ec2SecurityGroup.addIngressRule(Peer.anyIpv4(), Port.udp(27015), 'Steam server browser query');
    ec2SecurityGroup.addIngressRule(Peer.anyIpv4(), Port.udp(7777), 'Game client');
    ec2SecurityGroup.addIngressRule(Peer.anyIpv4(), Port.udp(7778), 'UDP Socket');
    ec2SecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(27020), 'RCON');

    const ec2 = new Instance(this, 'ArkEc2', {
      vpc: vpc,
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MEDIUM),
      machineImage: new AmazonLinuxImage({
        generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      keyName: Token.asString(keyPair.ref),
      vpcSubnets: vpc.selectSubnets({ subnetType: SubnetType.PUBLIC }),
      securityGroup: ec2SecurityGroup,
    });
  }
}
