define(["exports", "through2", "gulp-util", "graceful-fs", "deep-extend", "vinyl", "./utils"], function (exports, _through2, _gulpUtil, _gracefulFs, _deepExtend, _vinyl, _utils) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  exports.i18n = i18n;

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var _through = _interopRequireDefault(_through2);

  var _gutil = _interopRequireDefault(_gulpUtil);

  var _fs = _interopRequireDefault(_gracefulFs);

  var _deepExtend2 = _interopRequireDefault(_deepExtend);

  var _File = _interopRequireDefault(_vinyl);

  var minimist = require("minimist");

  var knownOptions = {
    string: "env",
    "default": {
      env: process.env.NODE_ENV || "production",
      verbose: false
    }
  };

  var cmdOptions = minimist(process.argv.slice(2), knownOptions);

  var PluginError = _gutil["default"].PluginError;
  var PLUGIN_NAME = "gulp-i18n-esn";

  var Plugin = (function () {
    function Plugin(opts) {
      _classCallCheck(this, Plugin);

      this.registry = [];
      this.values = {};
      this.nodes = {};

      if (opts) Object.assign(this, opts);
    }

    _createClass(Plugin, [{
      key: "parseTranslations",
      value: function parseTranslations(path, data) {
        var ext = (0, _utils.getExtension)(path);

        switch (ext) {
          case "html":
            if (cmdOptions.verbose) _gutil["default"].log("parse HTML:", path);
            return this.parseHTML(data);
          default:
            if (cmdOptions.verbose) _gutil["default"].log("parse JS:", path);
            return this.parseJavaScript(path);
        }
      }
    }, {
      key: "parseJavaScript",
      value: function parseJavaScript(path) {
        var pos = path.lastIndexOf(".");
        if (pos > -1) path = path.substr(0, pos);

        return System["import"](path).then(function (mod) {
          return mod.translations;
        });
      }
    }, {
      key: "addToRegistry",
      value: function addToRegistry(lang, data) {
        if (!this.registry[lang]) this.registry[lang] = {};

        (0, _deepExtend2["default"])(this.registry[lang], data);
      }
    }, {
      key: "generateAllTranslations",
      value: function generateAllTranslations() {
        if (cmdOptions.verbose) {
          _gutil["default"].log("extracted registry:");
          _gutil["default"].log(this.registry);
        }

        for (var lang in this.registry) {
          if (!this.registry.hasOwnProperty(lang)) continue;
          this.generateTranslation(lang, this.registry[lang]);
        }
      }
    }, {
      key: "generateTranslation",
      value: function generateTranslation(lang) {
        this.registryHash = {};

        var translation = this.registry[lang];

        for (var key in translation) {
          if (!translation.hasOwnProperty(key)) continue;
          this.registryHash = (0, _utils.hashFromString)(key, translation[key], this.keySeparator, this.registryHash);
        }

        var file = new _File["default"]({
          path: "translations-" + lang + ".json",

          contents: new Buffer(JSON.stringify(this.registryHash, null, 2))
        });
        this.stream.push(file);
      }
    }, {
      key: "parse",
      value: function parse() {
        return this.stream = _through["default"].obj(this.transformFile.bind(this), this.flush.bind(this));
      }
    }, {
      key: "transformFile",
      value: function transformFile(file, encoding, done) {
        var _this = this;

        var data = undefined,
            path = undefined;

        if (file.isStream()) {
          this.emit("error", new PluginError(PLUGIN_NAME, "Streams are not supported!"));
          return done();
        }

        if (file.isNull()) {
          path = file.path;
          if (file.stat.isDirectory()) {
            return done();
          } else if (path && _fs["default"].existsSync(path)) {
            data = _fs["default"].readFileSync(path);
          } else {
            this.emit("error", new PluginError(PLUGIN_NAME, "File has no content and is not readable"));
            return done();
          }
        }

        var segments = file.path.split("/");
        var lang = segments[segments.length - 2];

        if (file.isBuffer()) {
          path = file.path.replace(process.cwd() + "/", "");
          data = file.contents.toString();
        }

        if (!data) return done();

        this.parseTranslations(path, data).then(function (trans) {
          _this.addToRegistry(lang, trans);

          done();
        });
      }
    }, {
      key: "flush",
      value: function flush(cb) {
        this.generateAllTranslations();
        cb();
      }
    }]);

    return Plugin;
  })();

  exports.Plugin = Plugin;

  function i18n(opts) {
    return new Plugin(opts).parse();
  }
});
//# sourceMappingURL=index.js.map