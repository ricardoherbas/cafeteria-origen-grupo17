import { Router } from 'express';// herramienta de express para agrupar rutas relacionadas en un archivo aparte
import { getFacturacion, getMasVendido } from '../controllers/reportes.controller';

const router = Router();

router.get('/facturacion', getFacturacion);
router.get('/mas-vendido', getMasVendido);

export default router;