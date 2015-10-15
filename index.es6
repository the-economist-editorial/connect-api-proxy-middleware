'use strict';

import fetch from 'node-fetch';
import url from 'url';

export function pathParts (u) {
  return url.parse(u).pathname.match(/([^\/]+)/g);
}

export default (base) => {
  const baseURL = base;

  return (path, options) => {
    return (request, response, next) => {
      let apiUrl = baseURL + path + (pathParts(request.url)[0] || '');

      fetch(apiUrl).then((fetchResponse) => {
        const fetchResponseHeaders = {
          ...fetchResponse.headers.raw(),
          ...options.headerOverrides
        };

        for (const header in fetchResponseHeaders) {
          response.setHeader(header, fetchResponseHeaders[header]);
        }

        response.statusCode = fetchResponse.status;

        fetchResponse.body.pipe(response).on('end', next);

      }).catch(next);
    }
  }
}
