'use strict';

import path from 'path';

export default function(gulp, plugins, args, config, taskTarget, browserSync) {
  let dirs = config.directories;

  // Watch task
  // NOTE: This project runs Gulp 3, so watchers use task-name arrays
  // instead of the Gulp 4 only `gulp.series()`.
  gulp.task('watch', () => {
    if (!args.production) {
      // Styles - compile and stream CSS updates via browserSync.stream()
      // in the sass task (no reload needed)
      gulp.watch([
        path.join(dirs.source, dirs.styles, '**/*.{scss,sass}'),
        path.join(dirs.source, dirs.modules, '**/*.{scss,sass}')
      ], ['sass:dev']);

      // Nunjucks Templates - the nunjucks task reloads the browser on end
      gulp.watch([
        path.join(dirs.source, '**/*.nunjucks'),
        path.join(dirs.source, dirs.data, '**/*.{json,yaml,yml}')
      ], ['nunjucks']);

      // Copy
      gulp.watch([
        path.join(dirs.source, '**/*'),
        '!' + path.join(dirs.source, '{**/\_*,**/\_*/**}'),
        '!' + path.join(dirs.source, '**/*.nunjucks')
      ], ['copy']);

      // Images
      gulp.watch([
        path.join(dirs.source, dirs.images, '**/*.{jpg,jpeg,gif,svg,png}')
      ], ['imagemin']);

      // HTML/JS changes in the build output - reload
      gulp.watch([
        path.join(dirs.temporary, '**/*.html'),
        path.join(dirs.temporary, '**/*.js')
      ]).on('change', browserSync.reload);
    }
  });
}
