import type { AWS } from "@serverless/typescript";

import pagerdutyWebhook from "@functions/pagerduty-webhook";

const serverlessConfiguration: AWS = {
  service: "switchboard-pagerduty",
  frameworkVersion: "3",
  plugins: [
    "serverless-esbuild",
    "serverless-offline",
    "serverless-dotenv-plugin",
  ],
  provider: {
    name: "aws",
    runtime: "nodejs20.x",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    role: process.env.IAM_ROLE,
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      SB_WORKSPACE_ID: process.env.SB_WORKSPACE_ID,
      SB_API_KEY: process.env.SB_API_KEY,
      PD_API_KEY: process.env.PD_API_KEY,
      PD_FROM_EMAIL: process.env.PD_FROM_EMAIL,
    },
  },
  // import the function via paths
  functions: { pagerdutyWebhook },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node20",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
