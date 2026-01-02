// "use strict"

// const cors = require("cors");

// module.exports = function (app) {
//   var corsOptions = { exposedHeaders: "*" };
//   app.use(cors(corsOptions));
// };


"use strict"

const cors = require("cors");

module.exports = function (app) {
  const corsOptions = {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        'http://localhost:5175',
        'http://localhost:5173',
        'http://localhost:3000',
        'https://www.informingscience.fyi',
        'https://informingscience.fyi'
      ];

      if (allowedOrigins.includes(origin)) {
        console.log('CORS allowed for origin:', origin);
        callback(null, true);
      } else {
        console.log('CORS rejected for origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,  // ← THIS IS CRITICAL for cookies/auth
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-Requested-By'
    ],
    exposedHeaders: [
      'Content-Range',
      'X-Content-Range',
      'Content-Disposition',
      'Authorization'
    ],
    maxAge: 86400  // 24 hours for preflight cache
  };

  // Apply CORS to all routes
  app.use(cors(corsOptions));

  // Handle preflight OPTIONS requests for all routes
  app.options('*', cors(corsOptions));

  console.log('CORS middleware configured with credentials support');
};