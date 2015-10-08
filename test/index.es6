'use strict';

import { constructUrl, fetch, article, menu } from '../index';
import sinon from 'sinon';
import request from 'request';

let chai = require('chai').use(require('chai-as-promised')).should();

describe('API Proxy Middleware', () => {
  it('has a constructUrl method', () => {
    constructUrl.should.be.a.function
  });

  it('has a fetch method', () => {
    fetch.should.be.a.function
  });

  it('has an article method', () => {
    article.should.be.a.function
  });

  it('has a menu method', () => {
    menu.should.be.a.function
  });

  describe('constructUrl', () => {
    it('constructs the correct api url', () => {
      constructUrl('baz/','biz').should.equal('http://dev-cms-worldin.economist.com/contentasjson/baz/biz');
    });
  });

  describe('fetch', () => {
    let body = { foo: 'bar' };

    beforeEach(() => {
      sinon.stub(request, 'get');
    });

    afterEach(() => {
      request.get.restore();
    });

    it('returns a resolved promise', () => {
      request.get.callsArgWith(1, null, { statusCode: 200 }, body);
      return fetch('some/api/url').should.eventually.equal(body);
    });

    it('rejects if there is an error', () => {
      request.get.callsArgWith(1, new Error('foo'), { statusCode: 500 });

      return fetch('some/api/url')
        .then(function() {
          throw new Error('Promise should not succeed');
        }, function(e) {
          e.should.be.an.instanceOf(Error);
        });
    });
  });

  describe('article', () => {
    let response = { bar: 'baz' };

    before(() => {
      sinon.stub(request, 'get').returns(Promise.resolve(response));
    });

    after(() => {
      request.get.restore();
    });

    it('returns a promise', () => {
      article(1).should.be.an.instanceOf(Promise);
      article(1).should.eventually.equal(response);
    });
  });

  describe('menu', () => {
    let response = { bar: 'baz' };

    before(() => {
      sinon.stub(request, 'get').returns(Promise.resolve(response));
    });

    after(() => {
      request.get.restore();
    });

    it('returns a promise', () => {
      menu('funky-menu').should.be.an.instanceOf(Promise);
      menu('funky-menu').should.eventually.equal(response);
    });
  });
});
