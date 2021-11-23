const { AwsCdkConstructLibrary } = require('projen');
const project = new AwsCdkConstructLibrary({
  author: 'Sholto Maud',
  authorAddress: 'sholto.maud@gmail.com',
  cdkVersion: '1.95.2',
  defaultReleaseBranch: 'main',
  region: 'eu-central-1',
  account: '434583088386',
  name: 'pj-nft',
  repositoryUrl: 'https://github.com/Code-Bullet/Flappy-Bird-AI.git',
  cdkVersion: '2.0.0-rc.30',
  cdkDependencies: ['aws-cdk-lib'],
  devDeps: ['constructs@10.0.5', 'esbuild', 'pre-commit', 'aws-cdk-lib@2.0.0-rc.30'],
  deps: ['aws-sdk', 'jszip'],
  bundledDeps: ['aws-sdk', 'jszip'],

  // cdkDependencies: undefined,      /* Which AWS CDK modules (those that start with "@aws-cdk/") does this library require when consumed? */
  // cdkTestDependencies: undefined,  /* AWS CDK modules required for testing. */
  // deps: [],                        /* Runtime dependencies of this module. */
  // description: undefined,          /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],                     /* Build dependencies for this module. */
  // packageName: undefined,          /* The "name" in package.json. */
  // release: undefined,              /* Add release management to this project. */
});
project.synth();