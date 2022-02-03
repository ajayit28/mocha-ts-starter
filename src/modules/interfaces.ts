export declare type interfaces = 'D' | 'N';
export declare type tags = 'test';
export let Tags: Array<tags> = ['test'];

export interface TestResponse {
  ignore?: boolean; 
  status?: number;
  saveResponseAsVariable?: any;
  responseProperty?: any;
}


export interface TestRequest {
  method: string;
  path: string;
  login?: Login;
  loginForward?: any;
  appendFrom?: string;
  func?: Function;
  orig_path?: string;
  createPayload?: CreatePayload;
  payload?: object;

}

export interface TestDetail {
  [0]: 'D' | 'N';
  [1]: TestRequest;
  [2]: TestResponse;
  [3]: number;
  [4]: number;

}

export interface CreatePayload {
  source: {
    replaceFrom: any;
    replaceAt: any;
  };
  replacement: {
    replaceWith: any;
    takenFrom: any;
  };
}



export interface TestStep {
  name: string;
  pause?: number;
  index?: string;
  test: [interfaces, TestRequest, TestResponse, number, number]
}

export interface Login {
  userID: string;
  password: string;
}

export interface TestCase {
  type: string;
  tags: Array<tags>
  index?: string;
  tests: TestStep[]
}


export interface DASSInstance {
  ip: string;
  alias: string;
  user: string;
  password: string; 
}


export interface ConfigInterface {
  region: string;
  dass_instance: string;
}
