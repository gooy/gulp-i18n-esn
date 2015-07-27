define(['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.getExtension = getExtension;
  exports.hashFromString = hashFromString;

  function getExtension(path) {
    return path.substr(path.lastIndexOf('.') + 1);
  }

  function hashFromString(path, value, separator, hash) {
    separator = separator || '.';

    if (path.indexOf(separator, path.length - separator.length) >= 0) {
      path = path.slice(0, -separator.length);
    }

    var parts = path.split(separator);
    var tmp = hash || {};
    var obj = tmp;

    for (var x = 0; x < parts.length; x++) {
      if (x === parts.length - 1) {
        tmp[parts[x]] = value;
      } else if (!tmp[parts[x]]) {
        tmp[parts[x]] = {};
      }
      tmp = tmp[parts[x]];
    }
    return obj;
  }
});
//# sourceMappingURL=utils.js.map