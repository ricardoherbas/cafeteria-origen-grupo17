import conexionDB from '../../config/conexion-db';
import { ProductosRepository } from '../../repositories/productos.repository';
import { Expreso } from '../../models/expreso';
import { Pasteleria } from '../../models/pasteleria';

jest.mock('../../config/conexion-db', () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
}));

describe('ProductosRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('debe consultar los productos en la base de datos', async () => {
      (conexionDB.query as jest.Mock).mockResolvedValue({
        rows: [],
      });

      const repository = new ProductosRepository();

      await repository.findAll();

      expect(conexionDB.query).toHaveBeenCalledTimes(1);
      expect(conexionDB.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM productos')
      );
    });

    it('debe transformar los registros de café en instancias de Expreso', async () => {
      (conexionDB.query as jest.Mock).mockResolvedValue({
        rows: [
          {
            id: 1,
            nombre: 'Expreso Pocillo',
            tipo: 'expreso',
            precio_base: '2500.00',
            gramos: 18,
            precio_por_gramo: '140.00',
            tamanio: 'Pocillo',
            variedad: 'Brasil',
            acidez: 'Baja',
            cuerpo: 'Denso',
            notas: 'Avellana',
          },
        ],
      });

      const repository = new ProductosRepository();
      const productos = await repository.findAll();

      expect(productos[0]).toBeInstanceOf(Expreso);
      expect(productos[0].calcularPrecio()).toBe(5020);
    });

    it('debe transformar los registros de pastelería en instancias de Pasteleria', async () => {
      (conexionDB.query as jest.Mock).mockResolvedValue({
        rows: [
          {
            id: 2,
            nombre: 'Torta selva negra',
            tipo: 'pasteleria',
            precio_base: '4200.00',
            gramos: null,
            precio_por_gramo: null,
            tamanio: null,
            variedad: null,
            acidez: null,
            cuerpo: null,
            notas: null,
          },
        ],
      });

      const repository = new ProductosRepository();
      const productos = await repository.findAll();

      expect(productos[0]).toBeInstanceOf(Pasteleria);
      expect(productos[0].calcularPrecio()).toBe(4200);
    });
  });

  describe('findById', () => {
    it('debe buscar un producto por su ID y devolver una instancia de Expreso', async () => {
      (conexionDB.query as jest.Mock).mockResolvedValue({
        rows: [
          {
            id: 1,
            nombre: 'Expreso Pocillo',
            tipo: 'expreso',
            precio_base: '2500.00',
            gramos: 18,
            precio_por_gramo: '140.00',
            tamanio: 'Pocillo',
            variedad: 'Brasil',
            acidez: 'Baja',
            cuerpo: 'Denso',
            notas: 'Avellana',
          },
        ],
      });

      const repository = new ProductosRepository();
      const producto = await repository.findById(1);

      expect(producto).toBeInstanceOf(Expreso);
      expect(producto?.id).toBe(1);
      expect(producto?.calcularPrecio()).toBe(5020);
    });

    it('debe devolver null cuando el producto no existe', async () => {
      (conexionDB.query as jest.Mock).mockResolvedValue({
        rows: [],
      });

      const repository = new ProductosRepository();
      const producto = await repository.findById(999);

      expect(producto).toBeNull();
    });

    it('debe utilizar el ID como parámetro de la consulta SQL', async () => {
      (conexionDB.query as jest.Mock).mockResolvedValue({
        rows: [],
      });

      const repository = new ProductosRepository();
      await repository.findById(5);

      expect(conexionDB.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE p.id = $1'),
        [5]
      );
    });
  });
});
