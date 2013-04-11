var path = require('path');
var spmrc = require('spmrc');
var grunt = require('spm-grunt');

exports = module.exports = function(options) {
  options = options || {};
  var pkgfile = options.pkgfile || 'package.json';
  var pkg = {};
  if (grunt.file.exists(pkgfile)) {
    pkg = grunt.file.readJSON('package.json');
  }

  var installpath = spmrc.get('install.path');
  options.paths = [installpath];
  if (installpath !== 'sea-modules') {
    options.paths.push('sea-modules');
  }
  var globalpath = path.join(spmrc.get('user.home'), '.spm', 'sea-modules');
  options.paths.push(globalpath);

  var scripts = pkg.scripts || {};
  if (scripts.build) {
    childexec(scripts.build, function() {
      log.info('success', 'build finished.');
    });
  } else {
    grunt.invokeTask('build', options, function(grunt) {
      exports.loadBuildTasks(options, pkg);
      grunt.task.options({'done': function() {
        log.info('success', 'build finished.');
      }});
      grunt.registerInitTask('build', ['spm-build']);
    });
  }
};

exports.loadBuildTasks = function(options, pkg, deepMerge) {
  grunt.log.writeln('load spm-build');
  options = options || {};
  pkg = pkg || grunt.file.readJSON('package.json');

  var config = {pkg: pkg};
  config.src = options.inputDirectory || 'src';
  config.dest = options.outputDirectory || 'dist';
  config.paths = options.paths || ['sea-modules'];

  require('./lib/config').initConfig(grunt, config, deepMerge);

  [
    'grunt-cmd-transport',
    'grunt-cmd-concat',
    'grunt-contrib-uglify',
    'grunt-contrib-copy',
    'grunt-contrib-cssmin',
    'grunt-contrib-clean'
  ].forEach(function(task) {
    var taskdir = path.join(__dirname, 'node_modules', task, 'tasks');
    if (grunt.file.exists(taskdir)) {
      grunt.loadTasks(taskdir);
    }
  });
};
