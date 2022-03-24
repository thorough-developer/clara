import { loadTest } from "./load-test"

const express = require('express')
const app = express()
const port = 3000

app.get('/app/controller/route', (req: any, res:any) => {
  res.send({
    'a-route': 'a-win'
  });
});

app.listen(port, () => {
    loadTest('http://localhost:3000/app/controller/route');
});