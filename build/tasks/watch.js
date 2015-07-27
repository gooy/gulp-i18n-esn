var gulp = require("gulp");
var dirs = gulp.pkg.directories;
var gutil = require("gulp-util");

gulp.task("watch", function() {
  gulp.watch(dirs.lib + "/**/*.js", ["lint", "build-commonjs"]).on("change", reportChange);
});

// outputs changes to files to the console
function reportChange(event){
  gutil.log("File " + event.path + " was " + event.type + ", running tasks...");
}
