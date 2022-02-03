import superagent, {Request, Response, SuperAgentRequest} from 'superagent';
import _ from 'lodash';
import {Utils} from '../../lib/utils'
import  { Logger, TestRunLogger } from '../../lib/logger';
import { interfaces, TestRequest, TestResponse } from "../../modules/interfaces";


interface ObjInterface {
  base64ToHex?: any;
  [key: string]: any; // Add index signature
}


export class DASS {

  url: string = ""; // DASS instance URL
  gUsername: string = ""; // Global username for all the tests
  username: string = "";
  gPassword: string = ""; // Global password for all the tests
  password: string = "";
  method: SuperAgentRequest;
  saveResVar: ObjInterface = {}


  constructor(url: string, username: string, password: string) {
    this.url = url
    this.gUsername = username
    this.gPassword = password
  }

  prepareRequest(entry: [interfaces, TestRequest, TestResponse, number, number]) {
    Logger.debug(`prepareRequest method entry - ${JSON.stringify(entry)}`)
    let request: TestRequest = entry[1];

    // set the user basic auth for api call
    this.setLogin(request)


    // append on request path
    this.appendPath(request)

    // Prepare the payload
    this.createPayload(request);
    Logger.info(`[DASS: [prepareRequest]: DASS API REQUEST: ${JSON.stringify(request)}`);
    TestRunLogger.info(`DASS API REQUEST: ${JSON.stringify(request)}`)
    if (request.method == "GET") {
      this.method = superagent.get(this.url + request.path);
    } else if (request.method == "PUT") {
      this.method = superagent.put(this.url + request.path).send(request.payload);
    } else if (request.method == "POST") {
      this.method = superagent.post(this.url + request.path).send(request.payload);
    } else if (request.method == "DELETE") {
      this.method = superagent.delete(this.url + request.path);
    } else {
      Logger.info("Invalid method provided in testcase");
    }

  }

  async sendRequestAndVerify(entry: [interfaces, TestRequest, TestResponse, number, number], pause: number) {
    let expectedResponse: TestResponse = entry[2];
    let timeout: number = entry[3];
    Logger.debug(`[DASS]: [sendRequestAndVerify]: called`);
    Logger.debug(`[DASS]: [sendRequestAndVerify]: entry : ${JSON.stringify(entry)}`);
    Logger.debug(`[DASS]: [sendRequestAndVerify]: pause : ${pause}`);
    Logger.debug(`[DASS]: [sendRequestAndVerify]: timeout : ${timeout}`);
    await Utils.sTimeout(pause);
    await Utils.sTimeout(timeout);

    try {
      let response: Response = await this.method.auth(this.username, this.password);
      let responseObj: any;
      try {
        responseObj = JSON.parse(response.text);
      } catch (e) {
        responseObj = response.text;
      }
      Logger.info(`[DASS]: [sendRequestAndVerify]: DASS API RESPONSE: ${JSON.stringify(responseObj)}`);
      TestRunLogger.info(`DASS API RESPONSE: ${JSON.stringify(responseObj)}`);


      // Save responses 
      this.saveResponse(expectedResponse, responseObj);

      // Verify the success response
      let result = this.verifyResponse(expectedResponse, response, responseObj);
      Logger.debug(`[DASS]: [sendRequestAndVerify]:  ended`);
      return result

    } catch (err: any) {
      Logger.info(`DASS API RESPONSE ERROR: ${JSON.stringify(err)}`);
      TestRunLogger.info(`DASS API RESPONSE ERROR: ${JSON.stringify(err)}`);
      // Verify error response 
      let result = this.verifyResponse(expectedResponse, err, err.response);
      Logger.debug(`[DASS]: [sendRequestAndVerify]:  ended`);
      return result
    }
    


  }



  // append the path to request
  appendPath(request: TestRequest) {
    Logger.debug(`[DASS]: [appendPath]: called`);
    if (!_.isUndefined(request.appendFrom)) {
      let props = request.appendFrom.split(".");
      let temp = { ...this.saveResVar }
      if (temp) {
        for (let prop of props) {
          if (temp) {
            temp = temp[prop];
          }
        }
        let append = temp;
        if (request.func != undefined) append = request.func(append); //execute eventual function on received data
        Logger.debug(`[DASS]: [appendPath]: Request Path : ${request.path}`)
        Logger.debug(`[DASS]: [appendPath]: Append : ${append}`)
        if (request.orig_path == undefined) request.orig_path = request.path; //in case of repeats
        request.path = request.orig_path + append; //append the eventual restResponse
        Logger.debug(`[DASS]: [appendPath]: Request Append Path : ${request.path}`)
        Logger.debug(`[DASS]: [appendPath]: ended`)
      }
    }
  }

  // Verify the response 
  verifyResponse(expectedResponse: TestResponse, response: Response, responseObj: any) {
    Logger.debug(`[DASS]: [verifyResponse]: called`);
    Logger.debug(`[DASS]: [verifyResponse]: Expected Response: ${JSON.stringify(expectedResponse)}`)
    Logger.debug(`[DASS]: [verifyResponse]: DASS API Response: ${JSON.stringify(response)}`)
    Logger.debug(`[DASS]: [verifyResponse]: DASS API Response Object: ${JSON.stringify(responseObj)}`)
    // Ignore the teststep result whatever the test response from an API
    if (expectedResponse.ignore) {
      return true;
    }

    // Verify response status
    if (expectedResponse && expectedResponse.status && response && response.status && response.status == expectedResponse.status) {
      return true
    }

    // Verify response properties
    let result = this.verifyResponseProperty(expectedResponse, responseObj);
    Logger.debug(`[DASS]: [verifyResponse]: ended`)
    return result;
  }

  // Verify the reponse property
  verifyResponseProperty(expectedResponse: TestResponse, responseObj: any) {
    Logger.debug(`[DASS]: [verifyResponseProperty]: called`);
    if (!_.isUndefined(expectedResponse.responseProperty) && !_.isUndefined(expectedResponse.responseProperty[0]) && _.isObject(responseObj)) {

      for (let i = 0; i < expectedResponse.responseProperty.length; i = i + 2) {
        let tempArr = expectedResponse.responseProperty[i].split(".")
        let cloneResponseObj = JSON.parse(JSON.stringify(responseObj));
        for (let ele of tempArr) {
          if (cloneResponseObj) {
            cloneResponseObj = cloneResponseObj[ele]
          }
        }
        if (cloneResponseObj != expectedResponse.responseProperty[i + 1]) {
          return false
        }
      }
      Logger.debug(`[DASS]: [verifyResponseProperty]: ended`);
      return true
    }
  }

  // Save the response
  saveResponse(expectedResponse: TestResponse, responseObj: any) {
    Logger.debug(`[DASS: [saveResponse]: called`);
    if (!_.isUndefined(expectedResponse) && !_.isUndefined(expectedResponse.saveResponseAsVariable)) {
      Logger.debug(`[DASS: [saveResponse]: expectedResponse saveResponseAsVariable: ${expectedResponse.saveResponseAsVariable}`)
      this.saveResVar[expectedResponse.saveResponseAsVariable] = responseObj
    }
    Logger.debug(`[DASS: [saveResponse]: ended`);
  }

  // Create payload for request
  createPayload(request: TestRequest) {
    Logger.debug(`[DASS]: [createPayload]: called`);
    if (!_.isUndefined(request.createPayload)) {
      Logger.debug(`[DASS]: [createPayload]: Request CreatePayload: ${request.createPayload}`);
      if (!_.isUndefined(request.createPayload.source) && !_.isUndefined(request.createPayload.replacement)) {
        // Pick the source from saved response
        if (_.isString(request.createPayload.source.replaceFrom)) {
          let replaceForm = request.createPayload.source.replaceFrom
          if (!_.isUndefined(this.saveResVar[replaceForm])) {
            request.createPayload.source.replaceFrom = this.saveResVar[replaceForm]
          }
        }

        // Pick the replace from saved response
        if (_.isString(request.createPayload.replacement.replaceWith)) {
          let replaceWith = request.createPayload.replacement.replaceWith
          if (!_.isUndefined(this.saveResVar[replaceWith])) {
            request.createPayload.replacement.replaceWith = this.saveResVar[replaceWith]
          }
        }

        // If the replace is array then check saved response in array
        if (_.isArray(request.createPayload.replacement.replaceWith)) {
          let tempReplaceWith = request.createPayload.replacement.replaceWith;
          for (let index in tempReplaceWith) {
            if (_.isString(tempReplaceWith[index]) && !_.isUndefined(this.saveResVar[tempReplaceWith[index]])) {
              request.createPayload.replacement.replaceWith[index] = this.saveResVar[tempReplaceWith[index]];
            }
          }
        }

        request.payload = Utils.createPayload(request.createPayload);

        Logger.debug(`[DASS]: [createPayload]: create payload output: ${JSON.stringify(request.payload)}`)
        Logger.debug(`[DASS]: [createPayload]: ended`);
      }
    }
  }

  // Set the user basic auth from dass rest api call
  setLogin(request: TestRequest) {
    Logger.debug(`[DASS]: [setLogin]: called`);
    // Check request login username and password is not undefined
    if (!_.isUndefined(request) && !_.isUndefined(request.login) &&
      !_.isUndefined(request.login.userID) && !_.isUndefined(request.login.password)) {
      this.username = request.login.userID;
      this.password = request.login.password
      // Check request login forward
    } else if (!_.isUndefined(request) && !_.isUndefined(request.loginForward) && !_.isUndefined(this.saveResVar[request.loginForward]) && !_.isUndefined(this.saveResVar[request.loginForward][0]) && !_.isUndefined(this.saveResVar[request.loginForward][0].ownerID)) {
      Logger.debug(`[DASS]: [setLogin]: Login Forward ${this.username}/${this.saveResVar[request.loginForward][0].ownerID}`)
      this.username = `${this.username}/${this.saveResVar[request.loginForward][0].ownerID}`
      // Set the orbiwise username and password for basic auth
    } else {
      this.username = this.gUsername
      this.password = this.gPassword
    }

    Logger.debug(`[DASS]: [setLogin]: DASS API login set to username: ${this.username} password: ${this.password}`)
    Logger.debug(`[DASS]: [setLogin]: ended`);
  }

}