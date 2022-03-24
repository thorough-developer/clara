import autocannon = require('autocannon');

export function loadTest(url: string, headers?: any) {
  return autocannon({
    url,
    headers,
    connections: 10, //default
    pipelining: 1, // default
    duration: 60, // default
  }, console.log)
}