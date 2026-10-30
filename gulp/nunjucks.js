'use strict';

import fs from 'fs';
import path from 'path';
import foldero from 'foldero';
import nunjucks from 'gulp-nunjucks-html';
import yaml from 'js-yaml';
import { Transform } from 'stream';
import markdownRender from '../markdown-render.js';

const { mdPage, mdResume, mdMeta } = markdownRender;

export default function (gulp, plugins, args, config, taskTarget, browserSync) {
  let dirs = config.directories;
  let dest = path.join(taskTarget);
  let dataPath = path.join(dirs.source, dirs.data);

  // Nunjucks template compile
  gulp.task('nunjucks', () => {
    let siteData = {};
    if (fs.existsSync(dataPath)) {
      // Convert directory to JS Object
      siteData = foldero(dataPath, {
        recurse: true,
        whitelist: '(.*/)*.+.(json|ya?ml|md)$',
        loader: function loadAsString(file) {
          let json = {};
          try {
            if (path.extname(file).match(/\.md$/)) {
              // Markdown loads raw — pages render it through the
              // mdpage / mdresume filters
              json = fs.readFileSync(file, 'utf8');
            } else if (path.extname(file).match(/^.ya?ml$/)) {
              json = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
            } else {
              json = JSON.parse(fs.readFileSync(file, 'utf8'));
            }
          } catch (e) {
            console.log('Error Parsing DATA file: ' + file);
            console.log('==== Details Below ====');
            console.log(e);
          }
          return json;
        }
      });
    }

    // Add --debug option to your gulp task to view
    // what data is being loaded into your templates
    if (args.debug) {
      console.log('==== DEBUG: site.data being injected to templates ====');
      console.log(siteData);
      console.log('\n==== DEBUG: package.json config being injected to templates ====');
      console.log(config);
    }

    return (
      gulp
        .src([
          path.join(dirs.source, '**/*.nunjucks'),
          '!' + path.join(dirs.source, '{**/_*,**/_*/**}')
        ])
        .pipe(plugins.changed(dest))
        .pipe(plugins.plumber())
        .pipe(
          plugins.data({
            config: config,
            debug: !args.production,
            site: {
              data: siteData
            }
          })
        )
        .pipe(
          nunjucks({
            searchPaths: [path.join(dirs.source), path.join(dirs.source, dirs.layouts)],
            ext: '.html',
            setUp: function (env) {
              env.addFilter('mdpage', mdPage);
              env.addFilter('mdresume', mdResume);
              env.addFilter('mdmeta', mdMeta);
              return env;
            }
          }).on('error', function (err) {
            plugins.util.log(err);
          })
        )
        .on('error', plugins.notify.onError(config.defaultNotification))
        // AI-attribution guard (DR-0006): the [ai] chip shows on the dev server
        // only. Production strips the marker — and warns loudly, so AI-drafted
        // copy never ships unnoticed.
        .pipe(
          plugins.if(
            args.production,
            new Transform({
              objectMode: true,
              transform: function (file, enc, cb) {
                const html = String(file.contents);
                const count = (html.match(/data-ai="true"/g) || []).length;
                if (count) {
                  plugins.util.log(
                    plugins.util.colors.yellow.bold(
                      '⚠️  AI-ATTRIBUTED CONTENT: ' +
                        count +
                        ' block(s) marked [ai] in ' +
                        file.relative +
                        ' — rewrite in your own voice before publishing.'
                    )
                  );
                }
                file.contents = new Buffer(
                  html
                    .replace(/ ?<div class="ai-mark">[^<]*<\/div>/g, '')
                    .replace(/ data-ai="true"/g, '')
                );
                cb(null, file);
              }
            })
          )
        )
        .pipe(
          plugins.htmlmin({
            collapseBooleanAttributes: true,
            conservativeCollapse: true,
            removeCommentsFromCDATA: true,
            removeEmptyAttributes: true,
            removeRedundantAttributes: true
          })
        )
        .pipe(gulp.dest(dest))
        .on('end', browserSync.reload)
    );
  });
}
