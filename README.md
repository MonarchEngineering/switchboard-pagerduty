# Switchboard / PagerDuty Integration Lambda

This project contains a lambda that integrates the Switchboard API with PagerDuty to automatically create a room during a PagerDuty incident. This README contains developement and deployment instructions. For more detailed Switchboard API documentation you can visit the [Switchboard Developer Docs](https://switchboard-app.notion.site/Switchboard-Developer-Documentation-76029857308d4a2e87af1c9c03217ecf).

## Installation/deployment instructions

- Run `npm install -g serverless` to install serverless globally
- Run `nvm use 20` to use NodeJS v20
  - This project may run fine with earlier versions of NodeJS, but it hasn't been fully tested
- Run `cp sample.env .env` to copy the `dotenv` template
  - Edit `.env` to replace the placeholder values with your API keys

Depending on your preferred package manager, follow the instructions below to deploy your project.

### Using NPM

- Run `npm i` to install the project dependencies
- Run `npx sls deploy` to deploy this stack to AWS

### Using Yarn

- Run `yarn` to install the project dependencies
- Run `yarn sls deploy` to deploy this stack to AWS

## Modify and test this lambda

This lambda, upon receipt of a PagerDuty webhook incident event, will create a room and paste the link as a note in the incident. If you want to modify this behavior you can change the code in `src/functions/pagerduty-webhook/handler.ts`.

### Running locally

- Run `yarn serverless offline`
  - You will see the endpoint printed in the console. You can `curl` this endpoint, or use [Ngrok](https://ngrok.com) to forward PagerDuty traffic from your integration to your local environment.

