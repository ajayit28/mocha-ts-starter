import { parse } from "yargs";
import { TestCase, TestStep, Tags, DASSInstance   } from "../modules/interfaces";
import { Logger } from "./logger";
import boxen from 'boxen';
import path from 'path';
import fs from 'fs';

export class Utils {
  static sTimeout(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }

  static deepGet(obj: any, path: any) {
    var pList = path.split('.');
    var key = pList.pop();
    var pointer = pList.reduce((accumulator: any, currentValue: any) => {
      if (accumulator[currentValue] === undefined) accumulator[currentValue] = {};
      return accumulator[currentValue];
    }, obj);
    return pointer[key]
  }

  static deepReplace(obj: any, path: any, value: any) {
    var pList = path.split('.');
    var key = pList.pop();
    var pointer = pList.reduce((accumulator: any, currentValue: any) => {
      if (accumulator[currentValue] === undefined) accumulator[currentValue] = {};
      return accumulator[currentValue];
    }, obj);
    pointer[key] = value;
    return obj;
  }

  static createPayload(createPayload: any) {
    var source = createPayload.source;
    var replacement = createPayload.replacement;

    var replaceFrom = source.replaceFrom;
    // cloning the source object
    var replaceFromClone = JSON.parse(JSON.stringify(replaceFrom))
    var replaceAtArr = source.replaceAt
    var replaceWith = replacement.replaceWith;
    var takenFromArr = replacement.takenFrom
    var finalReplace;
    switch (typeof (replaceFrom)) {
      case 'object': {
        for (var index in replaceAtArr) {
          var replaceAt = replaceAtArr[index];
          var takenFrom = takenFromArr[index];
          finalReplace = Utils.deepGet(replaceWith, takenFrom)
          replaceFromClone = Utils.deepReplace(replaceFromClone, replaceAt, finalReplace)
        }
        break;
      }

      default: {
        if (typeof (replaceWith) == 'object') {
          finalReplace = Utils.deepGet(replaceWith, takenFromArr)
          replaceFromClone = finalReplace
        } else {
          replaceFromClone = replaceWith;
        }
      }

    }

    if (source.toHex) {
      if (typeof (source.toHex) == 'string') {
        var hexBytes = source.hexBytes || 4;
        var decimalNum = Utils.deepGet(replaceFromClone, source.toHex);
        var hexString = source.func(decimalNum, hexBytes);
        replaceFromClone = Utils.deepReplace(replaceFromClone, source.toHex, hexString)

      } else {
        if (typeof (replaceFromClone) == 'number') {
          replaceFromClone = source.func(replaceFromClone, hexBytes)
        }
      }
    }
    return replaceFromClone;
  }

  static filterUndefinedTestSteps(testCases: Array<TestCase>): Array<TestCase> {
    Logger.debug(`[Utils]: [filterUndefinedTestSteps]: started`);
    for (let index in testCases) {
      let testCase = testCases[index];
      let tempTestCase: TestStep[] = testCase.tests.filter((test: TestStep) => {
        if (test) {
          return test;
        }
      })
      testCases[index].tests = tempTestCase
    }
    Logger.debug(`[Utils]: [filterUndefinedTestSteps]: ended`);
    return testCases;
  }

  static bakeIndexes(testCases: Array<TestCase>): Array<TestCase> {
    Logger.debug(`[Utils]: [bakeIndexes]: started`);
    testCases.forEach(function (testCategory: TestCase, categoryNb: number) {
      testCategory.index = categoryNb.toString();
      testCategory.tests.forEach(function (test: TestStep, testNb: number) {
        test.index = categoryNb.toString() + "." + testNb.toString();
        test.name = test.index + " " + test.name;
      });
    });
    Logger.debug(`[Utils]: [bakeIndexes]: ended`);
    return testCases;
  }

  static listTests(testCases: any, tests: Array<TestCase>) {
    console.log('Listing TestCases: ')
    if (typeof (testCases) == 'boolean') {
      Utils.listTestCases(tests, 0, tests.length);
    } else {
      if (typeof (testCases) == 'number') {
        Utils.listTestCases(tests, testCases, testCases);
      } else if (testCases.indexOf('-') > -1) {
        let splitArr = testCases.split('-');
        Utils.listTestCases(tests, parseInt(splitArr[0]), parseInt(splitArr[1]));
      } else if (Tags.indexOf(testCases) > -1) {
        tests.forEach(function (testCategory: TestCase, categoryNb: number) {
          if (testCategory.tags.indexOf(testCases) > -1) {
            console.log(`${categoryNb} ${testCategory.type}  tags - ${testCategory.tags}`);
          }
        });
        process.exit();
      }
    }
    Utils.setBoxenError('ERROR - Invalid testCases in CLI args', `Example: --testCases -> List all testCases
Example: --testCases 2 -> List testCases for testCase index 2
Example: --testCases 2-5 -> List testCases for testCase index from 2 to 5
Example: --testCases test -> List testCases for test tag`);
  }

  static setBoxenError(title: string, message: string) {
    console.log(boxen(message, { title: title, titleAlignment: 'center' }));
    process.exit()
  }



  static listSteps(testSteps: any, tests: Array<TestCase>) {

    if (typeof (testSteps) == 'number') {
      Utils.listTestSteps(tests, testSteps, testSteps);
    } else if (typeof (testSteps) == 'string' && testSteps.indexOf('-') > -1) {
      let splitArr = testSteps.split('-');
      Utils.listTestSteps(tests, parseInt(splitArr[0]), parseInt(splitArr[1]));
    } else if (Tags.indexOf(testSteps) > -1) {
      tests.forEach(function (testCategory: TestCase, categoryNb: number) {
        if (testCategory.tags.indexOf(testSteps) > -1) {
          console.log(`${categoryNb} ${testCategory.type}  tags - ${testCategory.tags}`);
          if (tests[categoryNb].tests) {
            tests[categoryNb].tests.forEach(function (test: TestStep, index: number) {
              if (test.pause) {
                console.log(`    ${categoryNb}.${index} pause ${test.pause}`);
              } else {
                console.log(`   ${test.name}`);
              }
            })
          }
        }
      });
      process.exit();
    }

    Utils.setBoxenError('ERROR - Invalid testSteps in CLI args', `Example: --testCases 2 -> List testCases for testCase index 2
Example: --testCases 2-5 -> List testCases for testCase index from 2 to 5
Example: --testCases test -> List testCases for test tag`);


  }

  static listTestCases(tests: Array<TestCase>, startIndex: number, endIndex: number) {
    console.log("Listing TestCases");
    if (endIndex < tests.length) {
      for (let i = startIndex; i <= endIndex; i++) {
        if (tests && tests[i]) {
          console.log(`${i} ${tests[i].type} tags - ${tests[i].tags}`);
        }
      }
      process.exit();
    }
  }

  static listTestSteps(tests: Array<TestCase>, startIndex: number, endIndex: number) {
    console.log("Listing TestSteps");
    if (endIndex < tests.length) {
      for (let i = startIndex; i <= endIndex; i++) {
        if (tests && tests[i]) {
          console.log(`${i} ${tests[i].type} tags - ${tests[i].tags}`);
          if (tests[i].tests) {
            tests[i].tests.forEach(function (test: TestStep, index: number) {
              if (test.pause) {
                console.log(`    ${i}.${index} pause ${test.pause}`);
              } else {
                console.log(`   ${test.name}`);
              }
            })
          }
        }
      }
      process.exit();
    }
  }

  static filterTests(run: any, tests: Array<TestCase>) {

    if (typeof (run) == 'number') {
      Utils.filterTestCases(tests, run, run);
    } else if (run.indexOf('-') > -1) {
      let splitArr = run.split('-');
      Utils.filterTestCases(tests, parseInt(splitArr[0]), parseInt(splitArr[1]));
    } else if (Tags.indexOf(run) > -1) {
      tests.forEach(function (testCategory: TestCase, categoryNb: number) {
        if (testCategory.tags.indexOf(run) == -1) {
          tests.splice(categoryNb, 1);
        }
      });
    } else {
      console.log(`Running all the test cases`);
    }
  }

  static filterTestCases(tests: Array<TestCase>, startIndex: number, endIndex: number) {
    tests.splice(0, startIndex);
    tests.splice(endIndex - startIndex, tests.length);
  }

  static async getInstances(): Promise<DASSInstance[]> {
    try {
      let instances: DASSInstance[] = await Utils.readFile(path.resolve(__dirname, `../../config/instances.json`));
      return instances;
    } catch(e) {
      console.log(e, `config file not exist - instances.json}`);
      process.exit();
    }
  }

   // Read the file in promise way
   public static readFile(path: string): any {
    return new Promise((resolve, reject) => {
      fs.readFile(path, 'utf-8', (err, data: string) => {
        if(err) reject(err);
        try {
          data = JSON.parse(data);
          if (process.argv[2] == 'debug') console.log(`readFile method end`);
          resolve(data);
        } catch(e) {
          console.log(e, `invalid json file - ${path}`);
          process.exit();
        }
      })
    })
  }

}

