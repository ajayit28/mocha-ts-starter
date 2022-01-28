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

}