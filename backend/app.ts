import express from 'express';
import { errorHandler } from './middlewares/error-handler';

const app = express();

app.use(express.json());

// TODO: rutas de cada bloque. agregar solo la propia linea
// app.use('/productos', productosRoutes);   // ricardo
// app.use('/pedidos', pedidosRoutes);       // gonzalo
// app.use('/reportes', reportesRoutes);     // celina

app.use(errorHandler);

export default app;