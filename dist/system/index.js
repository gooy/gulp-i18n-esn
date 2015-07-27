System.register(["through2", "gulp-util", "graceful-fs", "deep-extend", "vinyl", "./utils"], function (_export) {
  "use strict";

  var through, gutil, fs, deepExtend, File, getExtension, hashFromString, minimist, knownOptions, cmdOptions, PluginError, PLUGIN_NAME, Plugin;

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  _export("i18n", i18n);

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function i18n(opts) {
    return new Plugin(opts).parse();
  }

  return {
    setters: [function (_through2) {
      through = _through2["default"];
    }, function (_gulpUtil) {
      gutil = _gulpUtil["default"];
    }, function (_gracefulFs) {
      fs = _gracefulFs["default"];
    }, function (_deepExtend) {
      deepExtend = _deepExtend["default"];
    }, function (_vinyl) {
      File = _vinyl["default"];
    }, function (_utils) {
      getExtension = _utils.getExtension;
      hashFromString = _utils.hashFromString;
    }],
    execute: function () {
      minimist = require("minimist");
      knownOptions = {
        string: "env",
        "default": {
          env: process.env.NODE_ENV || "production",
          verbose: false
        }
      };
      cmdOptions = minimist(process.argv.slice(2), knownOptions);
      PluginError = gutil.PluginError;
      PLUGIN_NAME = "gulp-i18n-esn";

      Plugin = (function () {
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
            var ext = getExtension(path);

            switch (ext) {
              case "html":
                if (cmdOptions.verbose) gutil.log("parse HTML:", path);
                return this.parseHTML(data);
              default:
                if (cmdOptions.verbose) gutil.log("parse JS:", path);
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

            deepExtend(this.registry[lang], data);
          }
        }, {
          key: "generateAllTranslations",
          value: function generateAllTranslations() {
            if (cmdOptions.verbose) {
              gutil.log("extracted registry:");
              gutil.log(this.registry);
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
              this.registryHash = hashFromString(key, translation[key], this.keySeparator, this.registryHash);
            }

            var file = new File({
              path: "translations-" + lang + ".json",

              contents: new Buffer(JSON.stringify(this.registryHash, null, 2))
            });
            this.stream.push(file);
          }
        }, {
          key: "parse",
          value: function parse() {
            return this.stream = through.obj(this.transformFile.bind(this), this.flush.bind(this));
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
              } else if (path && fs.existsSync(path)) {
                data = fs.readFileSync(path);
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

      _export("Plugin", Plugin);
    }
  };
});
//# sourceMappingURL=index.js.map