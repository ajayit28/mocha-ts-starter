// const yargs = require('yargs/yargs')
// const { hideBin } = require('yargs/helpers')
// const argv = yargs(hideBin(process.argv)).argv

import yargs from 'yargs';
const { hideBin } = require('yargs/helpers')
import { setLogLevel, addConsoleTransports } from './logger';
import { initConfig } from './create-config';
import { Utils } from './utils';
import { TestCase } from "../modules/interfaces";


export class CLIArgs {

    static init(tests: Array<TestCase>) {
      let argv: any = yargs(hideBin(process.argv))
      .usage('Usage: $0 command_line_args')
      .alias('l', 'info')
      .describe('l', 'Set the log level info')
      .alias('d', 'debug')
      .describe('d', 'Set the log level debug')
      .alias('tc', 'testCases')
      .describe('tc', 'List testCases')
      .example('$0 --testCases', 'List test cases')
      .alias('ts', 'testSteps')
      .describe('ts', 'List testSteps')
      .example('$0 --testCases 5', 'List test steps for test index 5')
      .example('$0 --testCases 5-7', 'List test steps for test index 5 to 7')
      .example('$0 --testCases noisedevice', 'List test steps for tag noisedevice')
      .alias('r', 'run')
      .describe('r', 'Run testcases')
      .example('$0 --run 5', 'Run test index 5')
      .example('$0 --run 5-7', 'Run test index 5 to 7')
      .example('$0 --run noisedevice', 'Run test for tag noisedevice')
      .alias('i', 'init')
      .describe('i', 'Initializes the test config')
      .help('h')
      .alias('h', 'help')
      .argv;

      console.log(argv);

      switch (true) {
        case argv.debug == true: 
          addConsoleTransports();
          setLogLevel('debug');
          break;
        case argv.info == true:
          addConsoleTransports();
          setLogLevel('info');
          break;
        case (['string', 'number', 'boolean'].indexOf(typeof(argv.testCases)) > -1):
          Utils.listTests(argv.testCases, tests)
          break;
        case (['string', 'number', 'boolean'].indexOf(typeof(argv.testSteps)) > -1):
          Utils.listSteps(argv.testSteps, tests);
          break;
        case (['string', 'number'].indexOf(typeof(argv.run)) > -1):
          Utils.filterTests(argv.run, tests);
          break;
        case argv.init == true:
          initConfig();
          break;
      }

    }
}