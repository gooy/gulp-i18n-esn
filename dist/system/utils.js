System.register([], function (_export) {
  'use strict';

  _export('getExtension', getExtension);

  _export('hashFromString', hashFromString);

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

  return {
    setters: [],
    execute: function () {}
  };
});
//# sourceMappingURL=utils.js.map