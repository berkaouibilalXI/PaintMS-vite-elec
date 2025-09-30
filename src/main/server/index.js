import express from "express";
import cors from "cors";
import dotenv from "dotenv";

//importer les routes tw3na
import {invoiceRoutes} from './routes/invoiceRoutes.js';
import {clientRoutes} from './routes/clientRoutes.js';
import {productRoutes} from './routes/productRoutes.js';
import {authRoutes} from './routes/authRoutes.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Determine if we're in development or production
const isDevelopment = process.env.NODE_ENV === 'development';

// CORS configuration for both dev and production
const corsOptions = {
  origin: [
    'http://localhost:5173',  // Vite dev server
    'tauri://localhost',      // Tauri production
    'https://tauri.localhost',
    'tauri://localhost',      // Alternative Tauri production
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
};

//Middlewares globaux
app.use(cors(corsOptions));
app.use(express.json());

//importer les middlewarew tw3na
import {requestLogger} from "./middlewares/requestLogger"
import {errorHandler} from "./middlewares/errorHandler"
import {auth} from "./middlewares/authMiddleware"
// const errorHandler = require('./middlewares/errorHandler');
// const auth = require('./middlewares/authMiddleware');


//nkhdmou b logger en mode dev
if (isDevelopment) {
  app.use(requestLogger);
}

// <=========ROUTES==================>
// utilisation te3 les routes avec protection mn 3nd auth middleware
app.use('/api/v1/invoices', auth, invoiceRoutes);
app.use('/api/v1/clients', auth, clientRoutes);
app.use('/api/v1/products', auth, productRoutes);
app.use('/api/v1/auth', authRoutes);

// route check health
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'TOUT EST PARFAIT', message: 'MRHBAAA BIIIIIKK' });
});

app.get('/', async (req, res) => {
  res.status(200).send("Working Fine Sahbbi");
});

//gestion des erreurs
app.use(errorHandler);

//demarrage du serveur

export function startServer(port = PORT) {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log("Backend lancé");
      resolve({ server, port });
    });
  });
}

module.exports = { app };