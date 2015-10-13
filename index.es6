'use strict';

import request from 'request';
import url from 'url';

export function fetch (url) {
  return new Promise(function(resolve, reject) {

    if (!url) {
      let error = new Error('API not provided');
      error.status = 400;
      reject(error);
    }

    request.get(url, function(error, response, body) {
      if (error) {
        error = new Error('HTTP request ' + error.message + ' to ' + url);
        error.status = 500;
        return reject(error);
      }

      if (!response || response.statusCode > 399) {
        error = new Error('HTTP request ' + response.statusCode + ' to ' + url);
				error.status = response.statusCode;
        return reject(error);
      }

      return resolve(body);
    });
  }).catch(function(error) {
    throw error;
  });
}

export function pathParts (u) {
  return url.parse(u).pathname.match(/([^\/]+)/g);
}

export default function(request, response, next) {
  let opts = this || {};

  return fetch(opts.api + (pathParts(request.url)[0] || '' ))
    .then(function(data) {
      response.setHeader('Cache-Control', 'public, max-age=' + opts.cache || 60);
      response.setHeader('Content-Type', opts.contentType || 'application/json');
      response.end(data);
    }).catch(next);
}
