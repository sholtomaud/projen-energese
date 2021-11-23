import { join } from 'path';
import { Duration, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { Rule, Schedule } from 'aws-cdk-lib/lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/lib/aws-events-targets';
import { Runtime } from 'aws-cdk-lib/lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/lib/aws-lambda-nodejs';
import { Bucket, BlockPublicAccess } from 'aws-cdk-lib/lib/aws-s3';
import { Construct } from 'constructs';

export class NftCheckStack extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const nftChecks = new Bucket(this, 'nftChecks', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    const nftChecker = new NodejsFunction(this, 'handler', {
      entry: join(__dirname, '..', 'functions/nftChecker/index.ts'),
      runtime: Runtime.NODEJS_14_X,
      bundling: {
        externalModules: [
          'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
        ],
        nodeModules: ['ethers'],
        minify: true, // minify code, defaults to false
        sourceMap: true, // include source map, defaults to false
      },
      environment: {
        BUCKET_NAME: nftChecks.bucketName,
        CONTRACT_ADDRESS: '0x25ed58c027921e14d86380ea2646e3a1b5c55a8b',
        AWS_ACCOUNT_ID: Stack.of(this).account,
        REGION: Stack.of(this).region,
      },
    });

    nftChecks.grantWrite(nftChecker);

    const rule = new Rule(this, 'nftCheckRule', {
      schedule: Schedule.rate(Duration.hours(1)),
    });

    rule.addTarget(new LambdaFunction(nftChecker));
  }
}