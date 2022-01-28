# cli-ts-starter
---
A simple typescript starter for building CLI application

Includes:

  - [TypeScript](https://www.typescriptlang.org/), for writing good code
  - [Mocha](https://www.npmjs.com/package/mocha), for writing good tests
  - [Yargs](https://www.npmjs.com/package/yargs), for build interactive command line tools
  - [Pkg](https://www.npmjs.com/package/pkg), for building cross-platform native executables

Your application will be install from npm or by sharing your native executables.

# Usage
---

## clean

`npm run clean`

Removes any built code.

## build

`npm run build`

Removes any built code and then tsc complies the typescript code into javascript into dist folder

## serve/start

`npm run serve` or `npm run start`

Build the code and then runs the CLI application.

You can pass arguments to your application by running npm run dev -- --your-argument. The extra -- is so that your arguments are passed to your CLI application, and not npm.

## watch-node

`npm run watch-node`

Automatically restarting the node application when file changes in the directory are detected.

## watch-node

`npm run watch-ts`

Automatically compile the typescripts files into javascript files when file changes in the directory are detected.

## watch

`npm run watch`

Automatically compile the typescripts files into javascript files when file changes in the directory are detected and  Restart the node application.

## test

`npm run test`

Clean, Build and test the build

## bundle

`npm run bundle`

Cleans, then builds, then run the npm link to run the command globally from any location in pc.







