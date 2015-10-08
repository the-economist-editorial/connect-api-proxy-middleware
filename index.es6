'use strict';

import request from 'request';

export default class Proxy {
  constructor (api) {
    // http://dev-cms-worldin.economist.com/contentasjson/
    this.api = api;
  }

  constructUrl (endpoint, id) {
    return this.api + endpoint + id;
  }

  fetch (url) {
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

  article (id) {
    return this.fetch(this.constructUrl('node/', id));
  }

  menu (menu) {
    return this.fetch(this.constructUrl('menu/', menu));
  }
}
