import express from 'express';

const app = express();

app.use(express.json());

// TODO: rutas de cada bloque. agregar solo la propia linea
// app.use('/productos', productosRoutes);   // ricardo
// app.use('/pedidos', pedidosRoutes);       // gonzalo
// app.use('/reportes', reportesRoutes);     // celina
// TODO: error-handler al final, despues de las rutas

export default app;