var gulp = require("gulp");
var eslint = require("gulp-eslint");

var dirs = gulp.pkg.directories;

gulp.task("lint", function(){
  gulp.src([dirs.lib + "/**/*.js", dirs.unit + "/**/*.js", dirs.e2e + "/**/*.js", "*.js"])
  .pipe(eslint())
  .pipe(eslint.format());
});

gulp.task("default", ["lint"]);
