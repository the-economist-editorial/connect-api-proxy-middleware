'use strict';

import proxy, { pathParts } from '../index';
import connect from 'connect';
import chai from 'chai';
import chaiHttp from 'chai-http';
import Replay from 'replay';

// Replay.mode = 'record';

const subDomain = (process.env.NODE_ENV === 'production') ? 'cms-worldin' : 'dev-cms-worldin';
const economistProxy = proxy(`http://${subDomain}.economist.com/contentasjson/`);

let app = connect();

chai.use(chaiHttp).use(spies).should();

app.use('/api/article', economistProxy('node/', {
  headerOverrides: {
    'cache-control': 'public, max-age=60',
  }
}));

describe('API Proxy Middleware', () => {
  it('has a pathParts method', () => {
    pathParts.should.be.a('function');
  });

  describe('pathParts', () => {
    it('returns an array of part parts', () => {
      pathParts('http://a.b.com/one/two').should.deep.equal(['one','two']);
    });
  });

  describe('Route', () => {
    it('overides headers where specified', () => {
      return chai.request(app)
        .get('/api/article/10523')
        .then((res) =>{
          res.status.should.equal(200);
          res.should.have.header('content-type', 'application/json');
          res.should.have.header('cache-control', 'public, max-age=60');
          res.should.be.json;
        });
    });

    it('should return a 404 status code for an invalid API end point', () => {
      return chai.request(app)
        .get('/api/article/10520')
        .then((res) =>{
          res.status.should.equal(404);
          res.should.have.header('content-type', 'application/json');
          res.should.have.header('cache-control', 'public, max-age=60');
          res.should.be.json;
        });
    });
  });
});
