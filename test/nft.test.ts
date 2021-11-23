import { App, Stack } from 'aws-cdk-lib';
import { NftCheckStack } from '../src/index';
import '@aws-cdk/assert/jest';

test('lambda and bucket', () => {

  const app = new App();
  const stack = new Stack(app);
  new NftCheckStack(stack, 'TestStack');
  // expect(stack).toHaveResource('AWS::Lambda::Function');
  expect(stack).toHaveResource('AWS::S3::Bucket');
  expect(stack).toHaveResource('AWS::Events::Rule');
  expect(stack).toHaveResource('AWS::Lambda::Function', {
    Handler: 'index.handler',
    Runtime: 'nodejs14.x',
  });
});