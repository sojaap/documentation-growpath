const express = require('express');
const app = express();
const skillRoutes = require('./routes'); // Import file routes.js

app.use(express.json());
app.use('/api', skillRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server on: http://localhost:${PORT}`);
});