import through from 'through2';
import gutil from 'gulp-util';
import fs from 'graceful-fs';
import deepExtend from 'deep-extend';
import File from 'vinyl';
import {getExtension, hashFromString} from './utils';

const minimist = require('minimist');

let knownOptions = {
  string: 'env',
  default: {
    env: process.env.NODE_ENV || 'production',
    verbose: false,
  },
};

let cmdOptions = minimist(process.argv.slice(2), knownOptions);

let PluginError = gutil.PluginError;
const PLUGIN_NAME = 'gulp-i18n-esn';

export class Plugin{

  registry = [];
  values = {};
  nodes = {};

  constructor(opts){
    if(opts) Object.assign(this, opts);
  }

  /**
   * Figures out how to parse the data based on file extension.
   *
   * @param path          path to the file
   * @param data          data of the file
   * @returns {Promise}   resolved when data has been parsed
   */
  parseTranslations(path, data){
    let ext = getExtension(path);

    switch(ext){
      case 'html':
        if(cmdOptions.verbose) gutil.log('parse HTML:', path);
        return this.parseHTML(data);
      default:
        if(cmdOptions.verbose) gutil.log('parse JS:', path);
        return this.parseJavaScript(path);
    }
  }

  parseJavaScript(path){
    let pos = path.lastIndexOf('.');
    if(pos > -1) path = path.substr(0, pos);

    return System.import(path).then(mod=>{
      return mod.translations;
    });
  }

  /**
   * Parse and add keys to the registry.
   * @param keys
   */
  addToRegistry(lang, data){
    if(!this.registry[lang]) this.registry[lang] = {};

    deepExtend(this.registry[lang], data);
  }

  generateAllTranslations(){
    if(cmdOptions.verbose) {
      gutil.log('extracted registry:');
      gutil.log(this.registry);
    }

    for(let lang in this.registry){
      if(!this.registry.hasOwnProperty(lang)) continue;
      this.generateTranslation(lang, this.registry[lang]);
    }
  }

  generateTranslation(lang){
    this.registryHash = {};

    let translation = this.registry[lang];

    // turn the array of keys
    // into an associative object
    // ==========================
    for(let key in translation){
      if(!translation.hasOwnProperty(key)) continue;
      this.registryHash = hashFromString(key, translation[key], this.keySeparator, this.registryHash);
    }

    // push files back to the stream
    let file = new File({
      path: `translations-${lang}.json`,
      // base: locale,
      contents: new Buffer(JSON.stringify(this.registryHash, null, 2)),
    });
    this.stream.push(file);
  }


  // --------- Stream functions

  parse(){
    return this.stream = through.obj(this.transformFile.bind(this), this.flush.bind(this));
  }

  transformFile(file, encoding, done){
    let data, path;

    // we do not handle streams
    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
      return done();
    }

    // read the file manually if a filepath was passed.
    if(file.isNull()){
      path = file.path;
      if(file.stat.isDirectory()){
        return done();
      }else if(path && fs.existsSync(path)){
        data = fs.readFileSync(path);
      }else{
        this.emit('error', new PluginError(PLUGIN_NAME, 'File has no content and is not readable'));
        return done();
      }
    }

    let segments = file.path.split('/');
    let lang = segments[segments.length - 2];

    if (file.isBuffer()) {
      path = file.path.replace(process.cwd() + '/', '');
      data = file.contents.toString();
    }

    // skip if no data was found
    if(!data) return done();

    this.parseTranslations(path, data).then(trans=>{
      this.addToRegistry(lang, trans);
      // tell the stream engine that we are done with this file
      done();
    });
  }

  flush(cb){
    // extract values from the aurelia application where possible
    this.generateAllTranslations();
    cb();
  }
}

/**
 * The main plugin function
 *
 * @param opts
 * @returns {Stream}
 */
export function i18n(opts) {
  return new Plugin(opts).parse();
}
