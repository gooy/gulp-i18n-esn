/**
 * Get the file extension from a filepath.
 *
 * @param path        path to analyze
 * @returns {string}  the extracted file extension
 */
export function getExtension(path){
  return path.substr(path.lastIndexOf('.') + 1);
}

/**
 * Create a hash from a translation key.
 *
 * converts 'foo.bar.baz' to:
 *
 * foo:{
 *   bar: {
 *     baz: {
 *     }
 *   }
 * }
 *
 * @param path
 * @param value
 * @param separator
 * @param hash
 * @returns {*|{}}
 */
export function hashFromString(path, value, separator, hash){
  separator = separator || '.';

  if(path.indexOf(separator, path.length - separator.length) >= 0){
    path = path.slice(0, -separator.length);
  }

  let parts = path.split(separator);
  let tmp = hash || {};
  let obj = tmp;

  for(let x = 0; x < parts.length; x++){
    if(x === parts.length - 1){
      tmp[parts[x]] = value;
    }else if(!tmp[parts[x]]){
      tmp[parts[x]] = {};
    }
    tmp = tmp[parts[x]];
  }
  return obj;
}
