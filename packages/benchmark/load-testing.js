const autocannon = require('autocannon');

autocannon({
  url: 'http://localhost:8888/my-app/my-context/other/getOther',
  headers: {
    'x-id-number': 55555,
    'user-id': 'cwashington'
  },
  connections: 10, //default
  pipelining: 1, // default
  duration: 60, // default
  workers: 4
}, console.log)