export declare type interfaces = 'D' | 'N';

export interface TestResponse {
  ignore?: boolean; 
  status?: number;
}


export interface TestRequest {
  method: string;
  path: string;
}

export interface TestDetail {
  [0]: 'D' | 'N';
  [1]: TestRequest;
  [2]: TestResponse;
  [3]: number;
  [4]: number;

}




export interface TestStep {
  name: string;
  pause?: number;
  test: [interfaces, TestRequest, TestResponse, number, number]
}

export interface TestCase {
  type: string;
  tests: TestStep[]
}

