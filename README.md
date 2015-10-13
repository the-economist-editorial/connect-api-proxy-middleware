# connect-api-proxy-middleware

This is a [connect middleware][] (can be used with express, or plain old
`require('http')` as long as you give it a next function) that channels routes through to the Drupal microsite API (e.g. World In/World If).

#### `template`

Example:

```js
import proxy from '@economist/connect-api-proxy-middleware';
import connect from 'connect';

let app = connect();

app
  .use('/api/article', proxy.article) //expects an article id
  .use('/api/menu', proxy.menu); //expects a menu name
```

[connect middleware]: https://github.com/senchalabs/connect
