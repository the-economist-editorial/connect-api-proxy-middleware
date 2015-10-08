'use strict';

import request from 'request';

export function constructUrl(endpoint, id) {
  return 'http://dev-cms-worldin.economist.com/contentasjson/' + endpoint + id;
}

export function fetch (url) {
  return new Promise(function(resolve, reject) {
    request.get(url, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        resolve(body);
      } else {
        let error = new Error('HTTP request ' + response.statusCode + ' to ' + url);
				error.status = response.statusCode;
        reject(error);
      }
    });
  }).catch(function(error) {
    throw error;
  });
}

export function article (id) {
  return fetch(constructUrl('node/', id));
}

export function menu (menu) {
  return fetch(constructUrl('menu/', menu));
}

export default function(app) {
  app.get('api/article/:id([0-9]+)', function(req, res, next) {
    let id = req.params.id;

    article(id).then(function(data) {
      res.setHeader('Cache-Control', 'public, max-age=60');
      res.json(data);
    }).catch(next);
  });

  app.get('api/:menuName', function(req, res, next) {
    let menuName = req.params.menuName;

    menu(menuName).then(function(data) {
      res.setHeader('Cache-Control', 'public, max-age=60');
      res.json(data);
    }).catch(next);
  });
}
