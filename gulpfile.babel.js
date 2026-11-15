'use strict';

import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSyncLib from 'browser-sync';
import pjson from './package.json';
import minimist from 'minimist';
import glob from 'glob';

// Load all gulp plugins based on their names
// EX: gulp-copy -> copy
const plugins = gulpLoadPlugins();

const defaultNotification = function(err) {
  return {
    subtitle: err.plugin,
    message: err.message,
    sound: 'Funk',
    onLast: true,
  };
};

let config = Object.assign({}, pjson.config, defaultNotification);

let args = minimist(process.argv.slice(2));
let dirs = config.directories;
let taskTarget = args.production ? dirs.destination : dirs.temporary;

// Create a new browserSync instance
let browserSync = browserSyncLib.create();


// This will grab all js in the `gulp` directory
// in order to load all gulp tasks
glob.sync('./gulp/**/*.js').filter(function(file) {
  return (/\.(js)$/i).test(file);
}).map(function(file) {
  require(file)(gulp, plugins, args, config, taskTarget, browserSync);
});

// Default task
gulp.task('default', ['clean'], () => {
  gulp.start('build');
}, [process.env.NODE_ENV === 'production' ? 'production' : 'development']);

// Build production-ready code
// --headless: release builds (scripts/release.sh) - no BrowserSync, no watch,
// so a release never collides with the dev server's ports.
let buildTasks = [
  'copy',
  'imagemin',
  // 'markdown',
  'nunjucks',
  'sass:build',
  'browserify'
];
if (!args.headless) {
  buildTasks.push('sync-mirror', 'browserSync', 'watch');
}
gulp.task('build', buildTasks);


// Server tasks with watch
// Under `--production` the serve pipeline targets build/ and routes every
// rebuild through sync-mirror, so serving is 1:1 with npm run build.
gulp.task(
  'serve',
  args.production
    ? ['imagemin', 'copy', 'nunjucks', 'sass:build', 'browserify', 'browserSync', 'sync-mirror', 'watch']
    : ['imagemin', 'copy', 'nunjucks', 'sass:dev', 'browserify', 'browserSync', 'mirror', 'watch']
);

// Testing
gulp.task('test', ['eslint']);
