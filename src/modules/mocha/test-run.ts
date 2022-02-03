import { DASS } from "../dass";
import { test } from "../../tests";
import _ from 'lodash';
import { Logger, TestRunLogger } from "../../lib/logger";
import { expect } from 'chai';
import { TestCase, TestStep, ConfigInterface, DASSInstance } from "../interfaces";
import { Utils } from "../../lib/utils";
import { CLIArgs } from "../../lib/cliArgs";
import fs from 'fs';
import path from 'path';


class TestRun {

  dass: DASS;
  nextPause: number | undefined;
  pauses: any;
  filterTestCases: Array<TestCase>;
  testWithIndex: Array<TestCase>;
  dass_instance: DASSInstance;
  config: ConfigInterface;

  constructor() {
    Logger.debug(`[TestRun]: [constructor]: called`);
    this.nextPause = 0;
    this.pauses = {};
    this.filterTestCases = Utils.filterUndefinedTestSteps(test);
    this.testWithIndex = Utils.bakeIndexes(this.filterTestCases);
    Logger.debug(`[TestRun]: [constructor]: ended`);

  }

  init() {

    CLIArgs.init(this.testWithIndex);

    try {
      this.config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../config.json'), 'utf8'));
    } catch (e) {
      console.log(e, 'error while parsing config.json');
      process.exit();
    }

  }

  run = async () => {
    
    Logger.debug(`[TestRun]: [run]: called`);
    let self = this;
    before(async function () {
      // initialize before test starts
      Logger.debug(`[TestRun]: [run]: before hook`);
      let instances: Array<DASSInstance> = await Utils.getInstances()
      for (let ins of instances) {
        if (self.config.dass_instance.indexOf(ins.ip) > -1) {
          self.dass_instance = ins;
        }
      }
      console.log(self.dass_instance)
      self.dass = new DASS(`https://${self.dass_instance.ip}/rest`, self.dass_instance.user, self.dass_instance.password);
      
    })


    for (let index in this.testWithIndex) {
      let testCase: TestCase = test[index];
      // this variable will not accessible inside the for each function

      describe(testCase.type, function () {
        testCase.tests.forEach(function (testStep: TestStep) {
          if (!_.isUndefined(testStep.pause)) {
            self.nextPause = testStep.pause;
          } else {
            describe("", async function () {
              if (_.isUndefined(testStep)) {
                it.skip("")
              }
              this.retries(testStep.test[4]);
              this.slow(5000 + (self.nextPause == undefined ? 0 : self.nextPause)); //extend the value of "slow" in order to account for the pause.
              this.timeout(this.timeout() + (self.nextPause == undefined ? 0 : self.nextPause)); //extend the value of timeout in order to account for the pause.
              it(testStep.name, async function () {
                Logger.info(`[TestRun]: [run]: ${testStep.name}`);
                TestRunLogger.info(`TestCase Name: ${testStep.name}`);
                TestRunLogger.info(`TestCase Test: ${JSON.stringify(testStep.test)}`);
                if (testStep.test[0] === "D") {
                  self.dass.prepareRequest(testStep.test);
                  const response = await self.dass.sendRequestAndVerify(testStep.test, self.pauses[testStep.name]);
                  expect(response).to.equal(true);
                }
                TestRunLogger.info('--------------------------------------------------------');
                TestRunLogger.info('--------------------------------------------------------');
              });
            });
            if (self.nextPause != undefined) {
              self.pauses[testStep.name] = self.nextPause;
              self.nextPause = undefined;
            }
          }
        });
      });
    }

    after(async () => {
      // 
    });

    Logger.debug(`[TestRun]: [run]: end`);
  }

  async end() {

  }
}



let testRun = new TestRun()
testRun.init()
testRun.run()
