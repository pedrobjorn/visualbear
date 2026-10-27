'use strict';

import path from 'path';

export default function(gulp, plugins, args, config, taskTarget, browserSync) {
  let dirs = config.directories;
  let dest = path.join(taskTarget);

  // Copy
  gulp.task('copy', () => {
    return gulp.src([
      path.join(dirs.source, '**/*'),
      '!' + path.join(dirs.source, '{**/\_*,**/\_*/**}'),
      '!' + path.join(dirs.source, '**/*.nunjucks'),
      // Source archive of the case-study PDFs (hosted on Google Drive);
      // unreferenced by the site and ~31MB per deploy
      '!' + path.join(dirs.source, 'case-studies{,/**}')
    ])
    .pipe(plugins.changed(dest))
    .pipe(gulp.dest(dest));
  });
}
