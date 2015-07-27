var gulp = require("gulp");
var shell = require("child-process-promise");

gulp.task("git-repush-tag", function(){
  return shell.exec("git tag -d "+gulp.pkg.version).then(function(){
      return shell.exec("git push origin :refs/tags/"+gulp.pkg.version);
    }).then(function(){
      return shell.exec("git tag "+gulp.pkg.version);
    }).then(function(){
      return shell.exec("git push --tags");
    });
});
