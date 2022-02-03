import MochaTest, {TestFunction}  from 'mocha'
import {Logger} from '../../lib/logger';
import boxen from 'boxen';
import path from 'path';

export class Mocha {
  mochaTest: MochaTest;
  passes: number;
  failures: number;


  constructor() {
    this.mochaTest = new  MochaTest({
      timeout: 25000, retries: 3, reporter: "mocha-multi-reporters", reporterOptions: {
        "reporterEnabled": "Spec,Progress",
      }
     })
     this.passes = 0
     this.failures = 0;

  }

  start() {
    Logger.debug(`[MOCHA]: [start()]: addFile test-run.js`);
    this.mochaTest.addFile(path.resolve(__dirname, './test-run.js'))

    this.mochaTest.run()
    .on('start', ()=> {
      Logger.debug(`[MOCHA]: [on start]: testing started`);
    })
    .on('test', (test: TestFunction) => {
      Logger.debug(`[MOCHA]: [on test]: ${test.name} in progress`);
    })
    .on('pass', (test: TestFunction) => {
      this.passes++
      Logger.debug(`[MOCHA]: [on pass]: ${test.name} passed`);
      
    })
    .on('fail', (test: TestFunction) => {
      this.failures;
      Logger.debug(`[MOCHA]: [on fail]: ${test.name} failed`);
    })
    .on('end', (test: TestFunction) => {
      Logger.debug(`[MOCHA]: [on end]: testing ended`);
      console.log(boxen(`
      Total TestCases: ${this.passes + this.failures}
      Passes: ${this.passes}
      Failures: ${this.failures}`, {title: 'Test Execution Summary', titleAlignment: 'center'}))
    })


  }
}


