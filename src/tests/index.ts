import { TestCase } from "../modules/interfaces";

 let testCase: TestCase = {
  "type": "Demo testing", "tags": ["test"], tests: [
    {
      name: `DASS: Get devices`,
      test: ['D', { method: "GET", path: "/nodes/cccccccccccccccc" }, { ignore: true }, 0, 0]
    },
    {
      name: `DASS: Get devices`,
      test: ['D', { method: "GET", path: "/nodes/cccccccccccccccc" }, { ignore: true }, 0, 0]
    },
    {
      name: `DASS: Get devices`,
      test: ['D', { method: "GET", path: "/nodes/cccccccccccccccc" }, { ignore: true }, 0, 0]
    },
    {
      name: `DASS: Get devices`,
      test: ['D', { method: "GET", path: "/nodes/cccccccccccccccc" }, { ignore: true }, 0, 0]
    },
    {
      name: `DASS: Get devices`,
      test: ['D', { method: "GET", path: "/nodes/cccccccccccccccc" }, { ignore: true }, 0, 0]
    }
  ]
}


export let test = [ testCase ];