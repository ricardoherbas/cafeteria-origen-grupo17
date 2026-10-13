import express from 'express';
import { errorHandler } from './middlewares/error-handler';

// productos
import { ProductosRepository } from './repositories/productos.repository';
import { ProductosService } from './services/productos.service';
import { ProductosController } from './controllers/productos.controller';
import { crearProductosRoutes } from './routes/productos.routes';

// pedidos
import { PedidosRepositoryPg } from './repositories/pedidos.repository';
import { PedidosService } from './services/pedidos.service';
import { PedidosController } from './controllers/pedidos.controller';
import { crearPedidosRoutes } from './routes/pedidos.routes';

// reportes
import reportesRoutes from './routes/reportes.routes';

const app = express();

app.use(express.json());

// armado de productos
const productosRepo = new ProductosRepository();
const productosService = new ProductosService(productosRepo);
const productosController = new ProductosController(productosService);
const productosRoutes = crearProductosRoutes(productosController);

// armado de pedidos
const pedidosRepo = new PedidosRepositoryPg();
const pedidosService = new PedidosService(pedidosRepo, productosRepo);
const pedidosController = new PedidosController(pedidosService);
const pedidosRoutes = crearPedidosRoutes(pedidosController);

app.use('/api/productos', productosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/reportes', reportesRoutes);

app.use(errorHandler);

export default app;