/* global describe it  */
import proxy, { constructUrl } from '../.';
import connect from 'connect';
import chai from 'chai';
import chaiHttp from 'chai-http';
import Replay from 'replay'; // eslint-disable-line
Replay.mode = 'record';

const articleId = 10523;
const subDomain = (process.env.NODE_ENV === 'production') ? 'cms-worldin' : 'dev2-cms-worldin';
const economistProxy = proxy(`http://${subDomain}.economist.com/contentasjson/`);
const app = connect();
const responseCodes = {
  success: 200,
  clientError: 404,
};
chai.use(chaiHttp).should();

app
  .use('/api/article', economistProxy('node', {
    headerOverrides: {
      'cache-control': 'public, max-age=60',
      'last-modified': 'Wed, 21 Oct 2015 10:00:00 GMT',
    },
  }))
  .use('/api/article-override/', economistProxy('node', {
    headerOverrides: {
      'cache-control': 'public, max-age=60',
      'last-modified': 'Wed, 21 Oct 2015 10:00:00 GMT',
    },
    dataOverrides: (data) => {
      const title = data.attributes.title;
      data = {};
      data.title = title;
      return data;
    },
  }));

describe('API Proxy Middleware', () => {
  it('has a constructUrl method', () => {
    constructUrl.should.be.a('function');
  });

  describe('constructUrl', () => {
    it('returns a concatonated string', () => {
      constructUrl('base/', 'path', '/requestUrl').should.equal('base/path/requestUrl');
    });
  });

  describe('Route', () => {
    it('overides headers where specified', () => {
      return chai.request(app)
        .get(`/api/article/${articleId}`)
        .then((res) => {
          res.status.should.equal(responseCodes.success);
          // sent from server
          res.should.have.header('content-type', 'application/json');
          // overriden by config
          res.should.have.header('cache-control', 'public, max-age=60');
          // overriden by config but not really something that would be done - just for test purposes.
          res.should.have.header('last-modified', 'Wed, 21 Oct 2015 10:00:00 GMT');
        });
    });

    it('overrides the response data with a callback function', () => {
      return chai.request(app)
        .get(`/api/article-override/${articleId}`)
        .then((res) => {
          res.status.should.equal(responseCodes.success);
          res.body.should.deep.equal({ title: 'Test article' });
        });
    });

    it('should return a 404 status code for an unavailable article id', () => {
      return chai.request(app)
        .get('/api/article/10520')
        .then((res) => {
          res.status.should.equal(responseCodes.clientError);
          res.should.have.header('content-type', 'application/json');
          res.should.have.header('cache-control', 'public, max-age=60');
        });
    });

    it('should expose the status code from the server for an invalid request URL', () => {
      return chai.request(app)
        .get('/api/article/bananas:javascript:javascript:alert(1)')
        .then((res) => {
          res.status.should.equal(responseCodes.clientError);
        });
    });
  });
});
