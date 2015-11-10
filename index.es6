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
      fetch(apiUrl).then((fetchResponseRaw) => {
        const fetchResponseHeaders = {
          ...fetchResponseRaw.headers.raw(),
          ...overrides.headerOverrides,
        };
        for (const header in fetchResponseHeaders) {
          response.setHeader(header, fetchResponseHeaders[header]);
        }
        response.statusCode = fetchResponseRaw.status;
        return fetchResponseRaw.json();
      }).then((fetchResponse) => {
        const dataCallback = overrides.dataOverrides;
        fetchResponse = (dataCallback && typeof dataCallback === 'function') ?
          dataCallback(fetchResponse) : fetchResponse;
        response.end(JSON.stringify(fetchResponse));
      })
      .catch(next);
    };
  };
};
