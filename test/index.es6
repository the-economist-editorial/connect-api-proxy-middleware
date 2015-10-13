'use strict';

import proxy, { fetch, pathParts } from '../index';
import sinon from 'sinon';
import request from 'request';
import connect from 'connect';
import supertest from 'supertest-as-promised';

const testArticle = JSON.stringify({"type":"twi_2016_article","id":"10515","attributes":{"metaTags":[{"property":"og:type","content":"twi_2016_article"},{"property":"og:title","content":"Optimistic IMF forecasts could be undone by financial woes"},{"property":"og:description","content":"The developing world is catching up with advanced economies, but no longer as quickly as they would like."},{"property":"og:image","content":"http:\/\/dev-cms-worldin.economist.com\/sites\/default\/files\/landscape\/Night-Traffic-background-hd-wallpaper-hd-wallpaper-1440x900-3-54232f2699c72-1831.jpg"},{"property":"og:image:width","content":"1440"},{"property":"og:image:height","content":"900"},{"property":"twi_2016_article:published_time","content":"2015-10-08T17:05:33:712Z"},{"property":"twi_2016_article:modified_time","content":"2015-10-08T17:05:53:712Z"},{"property":"twi_2016_article:section","content":"Business"},{"property":"twi_2016_article:tag","content":"IMF"},{"property":"twi_2016_article:tag","content":"financial"}],"show_as_published_web":"1","section":"Business","mainimage":{"1.0x":"http:\/\/dev-cms-worldin.economist.com\/sites\/default\/files\/landscape\/Night-Traffic-background-hd-wallpaper-hd-wallpaper-1440x900-3-54232f2699c72-1831.jpg","1.3x":"http:\/\/dev-cms-worldin.economist.com\/sites\/default\/files\/styles\/width1190\/public\/landscape\/Night-Traffic-background-hd-wallpaper-hd-wallpaper-1440x900-3-54232f2699c72-1831.jpg?itok=HMTbq2jm","1.5x":"http:\/\/dev-cms-worldin.economist.com\/sites\/default\/files\/styles\/width1024\/public\/landscape\/Night-Traffic-background-hd-wallpaper-hd-wallpaper-1440x900-3-54232f2699c72-1831.jpg?itok=uFoO6Yyv","2.0x":"http:\/\/dev-cms-worldin.economist.com\/sites\/default\/files\/styles\/width568\/public\/landscape\/Night-Traffic-background-hd-wallpaper-hd-wallpaper-1440x900-3-54232f2699c72-1831.jpg?itok=W5TDOdcG","3.0x":"http:\/\/dev-cms-worldin.economist.com\/sites\/default\/files\/portrait\/1220city2.png"},"title":"Optimistic IMF forecasts could be undone by financial woes","toc":"The developing world is catching up with advanced economies, but no longer as quickly as they would like.","flytitle":"The developing world is catching up with advanced economies, but no longer as quickly as they would like.","slug":"content\/optimistic-imf-forecasts-could-be-undone-financial-woes","dateline":"","rubric":"","content":"The developing world is catching up with advanced economies, but no longer as quickly as they would like. That has spooked investors. The slump in commodity prices and fears of an increase in interest rates in America led to 2015 being the first year since 1988 in which there will be a net capital ouflow from emerging markets.\r\n\r\nThe IMF\u2019s new World Economic Outlook, published yesterday, offers little comfort. Some of the IMF\u2019s headline projections seem relatively chirpy. Despite deepening recessions in Brazil and Russia, the BRICS economies as a whole are still growing at a decent speed of 4.8% this year, and growth is projected to rise to nearly 6.0% in 2020. Last month Citi warned that a global recession led by an emerging-market slowdown is on the way; the IMF are positively bullish by contrast. In 2016 the IMF expects China to steam ahead at 6.3% growth, and India at a whopping 7.5%."}});
const goodResponse = { statusCode: 200, headers: { 'content-type': 'application/json' } };
const bad500Response = { statusCode: 500, headers: { 'content-type': 'application/json' } };
const bad404Response = { statusCode: 404, headers: { 'content-type': 'application/json' } };

let app = connect();
let chai = require('chai').use(require('chai-as-promised')).should();

app.use('/api/article', proxy.bind({
  api: 'http://dev-cms-worldin.economist.com/contentjson/node/',
  cache: 60
}));

app.use('/api/something', proxy);

describe('API Proxy Middleware', () => {
  it('has a fetch method', () => {
    fetch.should.be.a.function
  });

  it('has a pathParts method', () => {
    pathParts.should.be.a.function
  });

  describe('pathParts', () => {
    it('returns an array of part parts', () => {
      pathParts('http://a.b.com/one/two').should.deep.equal(['one','two']);
    });
  });

  describe('fetch', () => {
    beforeEach(() => {
      sinon.stub(request, 'get');
    });

    afterEach(() => {
      request.get.restore();
    });

    it('returns a resolved promise', () => {
      request.get.callsArgWith(1, null, goodResponse, testArticle);
      return fetch('some/api/url')
        .should
        .eventually
        .deep
        .equal(testArticle);
    });

    it('rejects with a 500 if there is an internal error', () => {
      request.get.callsArgWith(1, new Error('foo'), bad500Response);

      return fetch('some/api/url')
        .then(function() {
          throw new Error('Promise should not succeed');
        }, function(e) {
          e.status.should.equal(500);
          e.should.be.an.instanceOf(Error);
        });
    });

    it('rejects with a 404 if a 404 is returned from the API', () => {
      request.get.callsArgWith(1, null, bad404Response);

      return fetch('some/api/url')
        .then(function() {
          throw new Error('Promise should not succeed');
        }, function(e) {
          e.status.should.equal(404);
          e.should.be.an.instanceOf(Error);
        });
    });

    it('rejects with a 400 if the API URL is not provided', () => {
      return fetch()
        .then(function() {
          throw new Error('Promise should not succeed');
        }, function(e) {
          e.status.should.equal(400);
          e.should.be.an.instanceOf(Error);
        });
    })
  });

  describe('Route', () => {
    beforeEach(() => {
      sinon.stub(request, 'get');
    });

    afterEach(() => {
      request.get.restore();
    });

    it('returns data', () => {
      request.get.callsArgWith(1, null, goodResponse, testArticle);

      return supertest(app)
        .get('/api/article/10515')
        .expect(200) //this is a supertest expect
        .then(function(res) {
          res.text.should.be.a('string');
        });
    });

    it('sets public cache header', () => {
      request.get.callsArgWith(1, null, goodResponse, testArticle);

      return supertest(app)
        .get('/api/article/10515')
        .expect('Cache-Control', 'public, max-age=60');
    });

    it('sets content type of application/json', () => {
      request.get.callsArgWith(1, null, goodResponse, testArticle);

      return supertest(app)
        .get('/api/article/10515')
        .expect('Content-Type', 'application/json');
    });
  });
});
