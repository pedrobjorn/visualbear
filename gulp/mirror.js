'use strict';

import fs from 'fs';
import path from 'path';

// Selected-works: a 1:1 copy of the rendered home page with the
// mirror-only cards injected at the top of its gallery. Runs after
// `nunjucks` on every serve so it always sees a fresh index.html.
export default function (gulp, plugins, args, config, taskTarget, browserSync) {
  const dirs = config.directories;
  const MARK = '<div class="content gallery">';
  const MIRROR_DIR = 'selected-works';

  gulp.task('mirror', () => {
    const homePath = path.join(taskTarget, 'index.html');
    if (!fs.existsSync(homePath)) return;

    const cardsFile = path.join(dirs.source, dirs.data, 'mirror-card.json');
    if (!fs.existsSync(cardsFile)) return;

    let html = fs.readFileSync(homePath, 'utf8');
    const cards = JSON.parse(fs.readFileSync(cardsFile, 'utf8')).cards || [];
    const cardsHtml = cards
      .map(function (card) {
        return (
          '<a href="' +
          card.href +
          '"' +
          (card.target ? ' target="' + card.target + '"' : '') +
          '>\n' +
          '  <div class="row">\n' +
          '    <div class="col s12 m12">\n' +
          '      <div class="card-container card medium">\n' +
          '        <div class="card-container card-image" style="background-image: url(' +
          card.img +
          ')" data-mobile-image="' +
          card.img +
          '">\n' +
          '          <span class="card-title">\n' +
          '            <h2>\n' +
          '              ' +
          card.title +
          '\n' +
          '            </h2>\n' +
          '            <p class="card-content">\n' +
          '              ' +
          card.subtitle +
          '\n' +
          '            </p>\n' +
          '          </span>\n' +
          '        </div>\n' +
          '      </div>\n' +
          '    </div>\n' +
          '  </div>\n' +
          '</a>\n'
        );
      })
      .join('\n');

    html = html.replace('<div style="width:100%">', '<div style="width:100%">' + cardsHtml);

    const mirrorDir = path.join(taskTarget, MIRROR_DIR);
    if (!fs.existsSync(mirrorDir)) fs.mkdirSync(mirrorDir, { recursive: true });
    fs.writeFileSync(path.join(mirrorDir, 'index.html'), html);
    console.log('mirror: injected ' + cards.length + ' card(s) into selected-works/index.html');
  });
}
