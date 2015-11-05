# connect-api-proxy-middleware

This is a [connect middleware][] (can be used with express, or plain old
`require('http')` as long as you give it a next function) and allows URLs, paths and headers to be supplied and overridden.

Example:

```js
import proxy from '@economist/connect-api-proxy-middleware';
import connect from 'connect';

let app = connect();

const subDomain = (process.env.NODE_ENV === 'production') ? 'cms-worldin' : 'dev-cms-worldin';
const economistProxy = proxy(`http://${subDomain}.economist.com/contentasjson/`);

app
  .use('/api/article', economistProxy('node', { //expects an id e.g. /api/article/1234 or /api/menu/a-drupal-menu-name
    headerOverrides: {
      'cache-control': 'public, max-age=60'
    }
  }))...
```

[connect middleware]: https://github.com/senchalabs/connect
