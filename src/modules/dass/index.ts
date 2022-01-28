import superagent from 'superagent';
import _ from 'lodash';
import {Utils} from '../../lib/utils'
import Logger from '../../lib/logger';


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
  method: any = ""
  saveResVar: ObjInterface = {}


  constructor(url: string, username: string, password: string) {
    this.url = url
    this.gUsername = username
    this.gPassword = password
  }

  prepareRequest(entry: any) {
    Logger.debug(`prepareRequest method entry - ${JSON.stringify(entry)}`)
    let request = entry[1];

    // set the user basic auth for api call
    this.setLogin(request)


    // append on request path
    this.appendPath(request)

    // Prepare the payload
    this.createPayload(request);
    Logger.debug(`DASS API REQUEST : ${JSON.stringify(request)}`)

    if (request.method == "GET") {
      this.method = superagent.get(this.url + request.path);
    } else if (request.method == "PUT") {
      this.method = superagent.put(this.url + request.path).send(request.payload)
    } else if (request.method == "POST") {
      this.method = superagent.post(this.url + request.path).send(request.payload)
    } else if (request.method == "DELETE") {
      this.method = superagent.delete(this.url + request.path)
    } else {
      Logger.info("Invalid method provided in testcase")
    }

  }

  async sendRequestAndVerify(entry: any, pause: any) {
    let expectedResponse = entry[2];
    let timeout = entry[3];
    Logger.debug(`sendRequestAndVerify entry : ${JSON.stringify(entry)}`)
    Logger.debug(`sendRequestAndVerify pause : ${pause}`)
    Logger.debug(`sendRequestAndVerify timeout : ${timeout}`)
    await Utils.sTimeout(pause)
    await Utils.sTimeout(timeout)

    try {
      let response: any = await this.method.auth(this.username, this.password);
      let responseObj: any;
      try {
        responseObj = JSON.parse(response.text);
      } catch (e) {
        responseObj = response.text;
      }
      Logger.debug(`DASS API RESPONSE : ${JSON.stringify(responseObj)}`)

      // Save responses 
      this.saveResponse(expectedResponse, responseObj)

      // Verify the success response
      let result = this.verifyResponse(expectedResponse, response, responseObj);
      return result

    } catch (err: any) {
      Logger.debug(`DASS API RESPONSE ERROR : ${JSON.stringify(err)}`)
      // Verify error response 
      let result = this.verifyResponse(expectedResponse, err, err.response);
      return result
    }


  }



  // append the path to request
  appendPath(request: any) {
    Logger.debug(`appendPath method called`)
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
        Logger.debug(`Request Path : ${request.path}`)
        Logger.debug(`append : ${append}`)
        if (request.orig_path == undefined) request.orig_path = request.path; //in case of repeats
        request.path = request.orig_path + append; //append the eventual restResponse
        Logger.debug(`Request Append Path : ${request.path}`)

      }
    }
  }

  // Verify the response 
  verifyResponse(expectedResponse: any, response: any, responseObj: any) {
    Logger.debug(`verifyResponse method called`)
    Logger.debug(`Expected Response : ${JSON.stringify(expectedResponse)}`)
    Logger.debug(`DASS API Response : ${JSON.stringify(response)}`)
    Logger.debug(`DASS API Response Object : ${JSON.stringify(responseObj)}`)
    // Ignore the teststep result whatever the test response from an API
    if (expectedResponse.ignore) {
      return true
    }

    // Verify response status
    if (expectedResponse && expectedResponse.status && response && response.status && response.status == expectedResponse.status) {
      return true
    }

    // Verify response properties
    let result = this.verifyResponseProperty(expectedResponse, responseObj);
    return result;
  }

  // Verify the reponse property
  verifyResponseProperty(expectedResponse: any, responseObj: any) {
    Logger.debug(`verifyResponseProperty method called`)
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
      return true
    }
  }

  // Save the response
  saveResponse(expectedResponse: any, responseObj: any) {
    Logger.debug(`saveResponse method called`)
    if (!_.isUndefined(expectedResponse) && !_.isUndefined(expectedResponse.saveResponseAsVariable)) {
      Logger.debug(`expectedResponse saveResponseAsVariable : ${expectedResponse.saveResponseAsVariable}`)
      this.saveResVar[expectedResponse.saveResponseAsVariable] = responseObj
    }
  }

  // Create payload for request
  createPayload(request: any) {
    if (!_.isUndefined(request.createPayload)) {
      Logger.debug(`Request CreatePayload : ${request.createPayload}`);
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

        Logger.debug(`create payload output : ${JSON.stringify(request.payload)}`)

      }
    }
  }

  // Set the user basic auth from dass rest api call
  setLogin(request: any) {

    // Check request login username and password is not undefined
    if (!_.isUndefined(request) && !_.isUndefined(request.login) &&
      !_.isUndefined(request.login.userid) && !_.isUndefined(request.login.password)) {
      this.username = request.login.userid;
      this.password = request.login.password
      // Check request login forward
    } else if (!_.isUndefined(request) && !_.isUndefined(request.loginforward) && !_.isUndefined(this.saveResVar[request.loginforward]) && !_.isUndefined(this.saveResVar[request.loginforward][0]) && !_.isUndefined(this.saveResVar[request.loginforward][0].ownerid)) {
      Logger.debug(`Login Forward ${this.username}/${this.saveResVar[request.loginforward][0].ownerid}`)
      this.username = `${this.username}/${this.saveResVar[request.loginforward][0].ownerid}`
      // Set the orbiwise username and password for basic auth
    } else {
      this.username = this.gUsername
      this.password = this.gPassword
    }

    Logger.debug(`DASS API login set to username: ${this.username} password: ${this.password}`)

  }

}