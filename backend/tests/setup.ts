import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

afterAll(async () => {
    const { default: conexionDB } = await import('../config/conexion-db');
    await conexionDB.end();
});