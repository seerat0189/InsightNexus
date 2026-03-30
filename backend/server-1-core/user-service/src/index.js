require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const routes = require('./routes/company.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/user', routes);

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, service: 'user-service', status: 'running' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
  });
});