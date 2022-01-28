import { DASS } from "../dass";
import { test } from "../../tests";
import _ from 'lodash';
import Logger from "../../lib/logger";
import {expect} from 'chai';
import { TestCase, TestStep, TestRequest, TestResponse, TestDetail } from "../interfaces";


class TestRun {

  dass: DASS;
  nextPause: number | undefined;
  pauses: any;

  constructor() {
    
  
    this.dass = new DASS(`https://home.eu.qa.internal.orbiwise.com/rest`, `orbiwise`, `aBjuhNbcR6mS`);
    this.nextPause = 0;
    this.pauses = {};
    
  }

  init() {
    
  }

  run() {

    // before(async function () {
    //   // initialize before test starts
      
    // })  
    for (let index in test) {
      let testCase: TestCase = test[index];
      // this variable will not accessible inside the for each function
      let self = this;
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
                
                if (testStep.test[0] === "D") {
                  self.dass.prepareRequest(testStep.test);
                  const response = await self.dass.sendRequestAndVerify(testStep.test, self.pauses[testStep.name]);
                  expect(response).to.equal(true);
                } 
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
  }

  end() {
   
  }
}


let testRun = new TestRun()
testRun.init();
testRun.run();
testRun.end();