import express from 'express';
//importing mongodb database from dbconfig.js
import { connection, collectionName } from './dbconfig.js';
const app = express();

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(3000, () => async () => {

    const db = await connection();
  console.log('Server is running on http://localhost:3000');
});