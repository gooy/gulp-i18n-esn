/**
 * Link this packages with npm
 */
var gulp = require("gulp");
var shell = require("child-process-promise");

gulp.task("npm-link", ["lint","build"], function() {
  return shell.exec("npm link");
});
