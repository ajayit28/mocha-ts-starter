#!/usr/bin/env node

import { Mocha } from './modules/mocha';

// Start Mocha test runner
let mocha = new Mocha();
mocha.start();

process.on('uncaughtException', err => {
  console.log(err, 'Uncaught Exception thrown');
  process.exit(1);
});
