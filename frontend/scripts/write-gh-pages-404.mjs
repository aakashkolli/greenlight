import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const repo = (process.env.GITHUB_REPOSITORY || '').split('/')[1] || 'greenlight';
const basePath = `/${repo}`;
const outDir = join(process.cwd(), 'out');
const target = join(outDir, '404.html');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Redirecting...</title>
  <script>
    (function () {
      var path = window.location.pathname || '';
      var search = window.location.search || '';
      var hash = window.location.hash || '';
      var base = '${basePath}';
      var normalized = path.indexOf(base) === 0 ? path.slice(base.length) : path;
      var redirectTo = base + '/?p=' + encodeURIComponent(normalized + search + hash);
      window.location.replace(redirectTo);
    })();
  </script>
</head>
<body>
  Redirecting...
</body>
</html>
`;

await mkdir(dirname(target), { recursive: true });
await writeFile(target, html, 'utf8');
await writeFile(join(outDir, '.nojekyll'), '', 'utf8');

console.log(`Generated ${target} and .nojekyll`);
