import {
  AmazonLinuxGeneration,
  AmazonLinuxImage,
  BlockDeviceVolume,
  CfnKeyPair,
  EbsDeviceVolumeType,
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
import { CfnOutput, RemovalPolicy } from 'aws-cdk-lib';

export class VpcEc2 extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const vpc = new Vpc(this, 'ArkVpc', {
      ipAddresses: IpAddresses.cidr('10.0.0.0/16'),
      vpcName: 'ark-vpc',
      maxAzs: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'ark-public-subnet-1',
          subnetType: SubnetType.PUBLIC,
        },
      ],
    });

    const ec2SecurityGroup = new SecurityGroup(this, 'ark-ec2-security-group', {
      vpc: vpc,
      allowAllOutbound: true,
    });
    ec2SecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(22), 'ssh');
    ec2SecurityGroup.addIngressRule(Peer.anyIpv4(), Port.udp(27015), 'Steam server browser query');
    ec2SecurityGroup.addIngressRule(Peer.anyIpv4(), Port.udp(7777), 'Game client');
    ec2SecurityGroup.addIngressRule(Peer.anyIpv4(), Port.udp(7778), 'UDP Socket');
    ec2SecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(27020), 'RCON');

    const keyPair = new CfnKeyPair(this, 'ArkKeyPair', {
      keyName: 'ark-key-pair',
      keyType: 'ed25519',
    });
    keyPair.applyRemovalPolicy(RemovalPolicy.DESTROY);

    new CfnOutput(this, 'GetSSHKey', {
      value: `aws ssm get-parameter --name /ec2/keypair/${keyPair.getAtt(
        'KeyPairId'
      )} --with-decryption --query Parameter.Value --output text`,
    });

    const ec2 = new Instance(this, 'ArkEc2', {
      vpc: vpc,
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.LARGE),
      machineImage: new AmazonLinuxImage({
        generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      vpcSubnets: vpc.selectSubnets({ subnetType: SubnetType.PUBLIC }),
      securityGroup: ec2SecurityGroup,
      keyName: keyPair.keyName,
      blockDevices: [
        {
          deviceName: '/dev/xvda',
          volume: BlockDeviceVolume.ebs(100, {
            volumeType: EbsDeviceVolumeType.GP3,
            deleteOnTermination: false
          }),
        },
      ],
    });
  }
}
