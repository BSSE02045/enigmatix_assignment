const express = require('express');
const cors = require('cors');
require('dotenv').config();

const buildContainer = require('./src/container');
const buildRouter = require('./src/presentation/routes');
const errorHandler = require('./src/presentation/middleware/errorHandler');

const app = express();
const { controllers, authenticate, authorize } = buildContainer();

app.use(cors({ origin: (process.env.CORS_ORIGIN || '*').split(',') }));
app.use(express.json());

app.use('/api', buildRouter({ controllers, authenticate, authorize }));

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT} (Clean Architecture)`));
