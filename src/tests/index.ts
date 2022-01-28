import { TestCase } from "../modules/interfaces";





 let testCase: TestCase = {
  "type": "Demo testing", tests: [
    {
      name: `DASS: Get devices`,
      test: ['D', { method: "GET", path: "/nodes/" }, { ignore: true }, 0, 0]
    },
    {
      name: `DASS: Get devices`,
      test: ['D', { method: "GET", path: "/nodes/" }, { ignore: true }, 0, 0]
    },
    {
      name: `DASS: Get devices`,
      test: ['D', { method: "GET", path: "/nodes/" }, { ignore: true }, 0, 0]
    },
    {
      name: `DASS: Get devices`,
      test: ['D', { method: "GET", path: "/nodes/" }, { ignore: true }, 0, 0]
    },
    {
      name: `DASS: Get devices`,
      test: ['D', { method: "GET", path: "/nodes/" }, { ignore: true }, 0, 0]
    }
  ]
}


export let test = [ testCase ];