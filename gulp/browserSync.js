'use strict';

import net from 'net';

// Ports are fixed in the config, but other browsersync instances on this
// machine (other projects) can hold them - and an EADDRINUSE at browserSync
// init crashes the whole gulp process (this bit the dev loop when the
// training-prototype server held UI port 3005). So: per-serve, probe for a
// free port and only fall back to the configured one if everything is taken.
// BS_PORT / BS_UI_PORT override the probing explicitly.
function freePort(start, maxHops, fallback, cb) {
  const tryPort = p => {
    if (p >= start + maxHops) return cb(fallback);
    const srv = net.createServer();
    srv.once('error', () => srv.close(() => tryPort(p + 1)));
    srv.listen(p, '127.0.0.1', () => {
      srv.close(() => cb(p));
    });
  };
  tryPort(start);
}

function envPort(name, fallback) {
  const n = parseInt(process.env[name], 10);
  return Number.isFinite(n) ? n : fallback;
}

export default function (gulp, plugins, args, config, taskTarget, browserSync) {
  // BrowserSync
  gulp.task('browserSync', () => {
    freePort(envPort('BS_PORT', 3000), 10, config.port || 3000, port => {
      freePort(envPort('BS_UI_PORT', 3005), 10, 3005, uiPort => {
        browserSync.init({
          open: args.open ? 'local' : false,
          startPath: config.baseUrl,
          port: port,
          ui: { port: uiPort },
          server: {
            baseDir: taskTarget,
            routes: (() => {
              let routes = {};

              // Map base URL to routes
              routes[config.baseUrl] = taskTarget;

              return routes;
            })()
          }
        });
      });
    });
  });
}
