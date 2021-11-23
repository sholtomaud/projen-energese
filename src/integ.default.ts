import { App, Stack } from 'aws-cdk-lib';
import { NftCheckStack } from './index';

const envEU = { account: '434583088386', region: 'eu-central-1' };
// 434583088386 eu-central-1
const app = new App();
const stack = new Stack(app, 'MyStack', { env: envEU });

new NftCheckStack(stack, 'NftCheckStackTest');