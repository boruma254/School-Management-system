const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const loggerMiddleware = require('./middleware/loggerMiddleware');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const app = express();

app.use(helmet());
const defaultDevCorsOriginRegex = /^http:\/\/localhost:517\d$/;
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser tools (no Origin header)
      if (!origin) return callback(null, true);

      const configured = process.env.CORS_ORIGIN;
      if (configured) return callback(null, origin === configured);

      // Dev-friendly: allow Vite default ports (5173, 5174, ...)
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, defaultDevCorsOriginRegex.test(origin));
      }

      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(xss());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(loggerMiddleware);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

app.use(errorHandler);

module.exports = app;

