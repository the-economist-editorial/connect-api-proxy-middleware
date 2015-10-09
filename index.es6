'use strict';

import request from 'request';
import url from 'url';

export function constructUrl(endpoint, id) {
  let apiHost = (process.env.NODE_ENV === 'production') ? 'cms-worldin' : 'dev-cms-worldin';
  return 'http://' + apiHost +  '.economist.com/contentasjson/' + endpoint + id;
}

export function fetch (url) {
  return new Promise(function(resolve, reject) {
    request.get(url, function(error, response, body) {
      if (!error && response.statusCode === 200 && response.headers['content-type'] === 'application/json') {
          resolve(body);
      } else {
        let err = new Error('HTTP request ' + response.statusCode + ' to ' + url);
				err.status = response.statusCode;
        reject(err);
      }
    });
  }).catch(function(error) {
    throw error;
  });
}

export function pathParts (u) {
  return url.parse(u).pathname.match(/([^\/]+)/g);
}

export function article (request, response, next) {
  return fetch(constructUrl('node/', pathParts(request.url)[0])).then(function(data) {
      response.setHeader('Cache-Control', 'public, max-age=60');
      response.end(data);
    }).catch(next);
}

export function menu (request, response, next) {
  return fetch(constructUrl('menu/', pathParts(request.url)[0])).then(function(data) {
      response.setHeader('Cache-Control', 'public, max-age=60');
      response.end(data);
    }).catch(next);
}
