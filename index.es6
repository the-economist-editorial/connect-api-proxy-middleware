import fetch from 'node-fetch';
import urljoin from 'url-join';

export function constructUrl(base, path, reqUrl) {
  return urljoin(base, path, reqUrl);
}

export default (base) => {
  const baseUrl = base;
  return (path, overrides = {}) => {
    return (request, response, next) => {
      const apiUrl = constructUrl(baseUrl, path, request.url);
      fetch(apiUrl).then((fetchResponse) => {
        const fetchResponseHeaders = {
          ...fetchResponse.headers.raw(),
          ...overrides.headerOverrides,
        };
        for (const header in fetchResponseHeaders) {
          response.setHeader(header, fetchResponseHeaders[header]);
        }
        response.statusCode = fetchResponse.status;
        fetchResponse.body.pipe(response).on('end', next);
      }).catch(next);
    };
  };
};
