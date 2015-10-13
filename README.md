# connect-api-proxy-middleware

This is a [connect middleware][] (can be used with express, or plain old
`require('http')` as long as you give it a next function) that channels routes through to the Drupal microsite API (e.g. World In/World If).

Example:

```js
import proxy from '@economist/connect-api-proxy-middleware';
import connect from 'connect';

let app = connect();

app
  .use('/api/article', proxy.bind({  // expects url param to be an article id or menu name
    api: 'http://www.someapi.com/thing', // Required
    cache: 3600, //seconds - 60 by default
    contentType: 'application/xml' // application/json by default
  }))
  .use('/api/menu', proxy.bind({  // expects url param to be an article id or menu name
    api: 'http://www.someotherapi.com/stuff', // Required
    cache: 120, //seconds - 60 by default
    contentType: 'text/xml' // application/json by default
  }))
```

[connect middleware]: https://github.com/senchalabs/connect
