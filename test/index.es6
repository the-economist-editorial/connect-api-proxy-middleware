'use strict';

import Proxy from '../index';
import sinon from 'sinon';
import request from 'request';

let chai = require('chai').use(require('chai-as-promised')).should();
let proxy;

describe('API Proxy Middleware', () => {
  before(() => {
    proxy = new Proxy();
  });

  it('has a constructUrl method', () => {
    proxy.constructUrl.should.be.a.function
  });

  it('has a fetch method', () => {
    proxy.fetch.should.be.a.function
  });

  it('has an article method', () => {
    proxy.article.should.be.a.function
  });

  it('has a menu method', () => {
    proxy.menu.should.be.a.function
  });

  describe('constructUrl', () => {
    before(() => {
      proxy = new Proxy('foo/bar/');
    });

    it('constructs the correct api url', () => {
      proxy.constructUrl('baz/','biz').should.equal('foo/bar/baz/biz');
    });
  });

  describe('fetch', () => {
    let body = { foo: 'bar' };

    beforeEach(() => {
      proxy = new Proxy('foo/bar/');

      sinon.stub(request, 'get');
    });

    afterEach(() => {
      request.get.restore();
    });

    it('returns a resolved promise', () => {
      request.get.callsArgWith(1, null, { statusCode: 200 }, body);
      return proxy.fetch('some/api/url').should.eventually.equal(body);
    });

    it('rejects if there is an error', () => {
      request.get.callsArgWith(1, new Error('foo'), { statusCode: 500 });

      return proxy.fetch('some/api/url')
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
      proxy = new Proxy('foo/bar/');

      sinon.stub(proxy, 'fetch').returns(Promise.resolve(response));
    });

    after(() => {
      proxy.fetch.restore();
    });

    it('returns a promise', () => {
      proxy.article(1).should.be.an.instanceOf(Promise);
      proxy.article(1).should.eventually.equal(response);
    });
  });

  describe('menu', () => {
    let response = { bar: 'baz' };

    beforeEach(() => {
      proxy = new Proxy('foo/bar/');

      sinon.stub(proxy, 'fetch').returns(Promise.resolve(response));
    });

    after(() => {
      proxy.fetch.restore();
    });

    it('returns a promise', () => {
      proxy.menu('funky-menu').should.be.an.instanceOf(Promise);
      proxy.menu('funky-menu').should.eventually.equal(response);
    });
  });
});
