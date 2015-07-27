# gulp-i18n-esn

Concatinates objects from es6 modules and generates a json file.

## Installation

```bash
npm install gooy/gulp-i18n-esn
```
## Usage

```javascript
var gulp = require('gulp');
var i18n_esn = require("gulp-i18n-esn").i18n_esn;

return gulp.src(patterns)
  .pipe(i18n_esn())
  .pipe(gulp.dest(output));
```


## Translations

Each translation file is created as an ES6 module that export a translation object.

```javascript
export var translations = {

  //basic example
  'title': `ANXBTC`,

  //namespaced example
  'example.foo': `foo`,
  'example.bar': `bar`,

  //nested example
  'example-nested': {
    'foo' : `foo`,
    'bar' : `bar`
  },

  //multi line example
  'example-multi-line': `lorem

  ipsum <br/>
  dolor sit amet.

  `
};
```

The file above would produce an output like this

```javascript
{
  "welcome": "Welcome",
  "title": "ANXBTC",
  "example": {
    "foo": "foo",
    "bar": "bar"
  },
  "example-nested": {
    "foo": "foo",
    "bar": "bar"
  },
  "example-multi-line": "lorem\n\n  ipsum <br/>\n  dolor sit amet.\n\n  "
}
```
