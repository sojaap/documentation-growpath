require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// root route
app.get('/', (req, res) => {
  res.send('api growpath running');
});

// api routes
app.use('/api', require('./src/routes'));

app.listen(3000, () => {
  console.log('server running on http://localhost:3000');
});