import MochaTest, {TestFunction}  from 'mocha'
import Logger from '../../lib/logger';
import boxen from 'boxen';

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
    this.mochaTest.addFile('./modules/mocha/test-run.js')

    this.mochaTest.run()
    .on('start', ()=> {
      Logger.info(`Test Start Time: ${new Date().toISOString()}`);
    })
    .on('test', (test: TestFunction) => {
      Logger.info(`test in progress`);
    })
    .on('pass', (test: TestFunction) => {
      this.passes++
      Logger.info(`Passes: ${this.passes}`)
    })
    .on('fail', (test: TestFunction) => {
      this.failures;
      Logger.info(`Failures: ${this.failures}`)
    })
    .on('end', (test: TestFunction) => {
      console.log(boxen(`
      Total TestCases: ${this.passes + this.failures}
      Passes: ${this.passes}
      Failures: ${this.failures}`, {title: 'Test Execution Summary', titleAlignment: 'center'}))
    })


  }
}


