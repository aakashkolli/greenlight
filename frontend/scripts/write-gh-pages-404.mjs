import fs from 'fs';
import path from 'path';

const outDir = path.resolve(process.cwd(), 'out');
const target = path.join(outDir, '404.html');

const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0; url=/" />
    <meta name="robots" content="noindex" />
    <script>
      // client-side fallback for SPA routes
      (function () {
        try {
          var p = location.pathname;
          var base = document.querySelector('base')?.getAttribute('href') || '/';
          var target = base + p.replace(/^\//, '') + (location.search || '') + location.hash;
          // try to rewrite to root so GH Pages serves index for client routing
          location.replace(target);
        } catch (e) { /* ignore */ }
      })();
    </script>
  </head>
  <body>
    Redirecting...
  </body>
</html>`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(target, html, 'utf8');
console.log('Wrote', target);
