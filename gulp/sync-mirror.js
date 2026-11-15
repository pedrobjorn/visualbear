'use strict';

import { execFileSync } from 'child_process';
import path from 'path';

// Keeps `npm run build:gulp` 1:1 with `npm run build`: after the gulp
// pipeline writes the public build/ tree, re-run scripts/release-mirror.js
// so the air-locked mirror (pruned secret pages, noindex, injected
// mirror-only cards, visuai link) carries the same content.
//
// Skipped when `--headless` - scripts/release.sh runs the sync itself
// after its settle detector, and a double run is wasted work.

export default function (gulp, plugins, args, config) {
  gulp.task('sync-mirror', ['copy', 'imagemin', 'nunjucks', 'sass:build'], done => {
    if (!args.production || args.headless) {
      done();
      return;
    }
    try {
      execFileSync(process.execPath, [path.resolve('scripts', 'release-mirror.js')], {
        stdio: 'inherit'
      });
    } catch (e) {
      plugins.util.log(plugins.util.colors.red('sync-mirror failed: ' + e.message));
    }
    done();
  });
}
