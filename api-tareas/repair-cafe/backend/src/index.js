import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './rutas.js';
import { datosRouter } from './datos.js';

dotenv.config();

const app = express();
app.use(cors({ origin: ['http://127.0.0.1:4201', 'http://localhost:4201'] }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/auth', authRouter);
app.use('/api', datosRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ mensaje: 'Ocurrió un error en el servidor.' });
});

app.listen(process.env.PORT, () => {
  console.log(`Repair Café API en http://127.0.0.1:${process.env.PORT}`);
});
