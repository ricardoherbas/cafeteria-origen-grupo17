CREATE TABLE tamanios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE variedades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE,
    acidez VARCHAR(50) NOT NULL,
    cuerpo VARCHAR(50) NOT NULL,
    notas VARCHAR(100) NOT NULL
);

CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL
        CHECK (tipo IN ('expreso', 'filtrado', 'pasteleria')),
    variedad_id INTEGER,
    tamanio_id INTEGER,
    gramos INTEGER
        CHECK (gramos IS NULL OR gramos > 0),
    precio_base NUMERIC(10,2) NOT NULL
        CHECK (precio_base >= 0),
    precio_por_gramo NUMERIC(10,2)
        CHECK (precio_por_gramo IS NULL OR precio_por_gramo >= 0),

    CONSTRAINT fk_producto_variedad
        FOREIGN KEY (variedad_id)
        REFERENCES variedades(id),

    CONSTRAINT fk_producto_tamanio
        FOREIGN KEY (tamanio_id)
        REFERENCES tamanios(id)
);

CREATE TABLE mesas (
    id SERIAL PRIMARY KEY,
    numero INTEGER NOT NULL UNIQUE,
    capacidad INTEGER NOT NULL
        CHECK (capacidad > 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'libre'
        CHECK (estado IN ('libre', 'ocupada'))
);

CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    mesa_id INTEGER,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'confirmado', 'cancelado')),
    total NUMERIC(10,2) NOT NULL DEFAULT 0
        CHECK (total >= 0),

    CONSTRAINT fk_pedido_mesa
        FOREIGN KEY (mesa_id)
        REFERENCES mesas(id)
);

CREATE TABLE pedido_items (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL,
    producto_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL
        CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL
        CHECK (precio_unitario >= 0),
    subtotal NUMERIC(10,2) NOT NULL
        CHECK (subtotal >= 0),

    CONSTRAINT fk_item_pedido
        FOREIGN KEY (pedido_id)
        REFERENCES pedidos(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_item_producto
        FOREIGN KEY (producto_id)
        REFERENCES productos(id)
);

INSERT INTO tamanios (nombre)
VALUES
    ('Pocillo'),
    ('Mediano'),
    ('Taza grande');

INSERT INTO variedades
(nombre, acidez, cuerpo, notas)
VALUES
    ('Brasil', 'Baja', 'Denso', 'Avellana'),
    ('Colombia', 'Media', 'Equilibrado', 'Cítricas y florales'),
    ('Etiopía', 'Viva', 'Ligero', 'Frutales');

INSERT INTO mesas (numero, capacidad)
VALUES
    (1, 2),
    (2, 2),
    (3, 4),
    (4, 4),
    (5, 6);

INSERT INTO productos
(nombre, tipo, variedad_id, tamanio_id, gramos, precio_base, precio_por_gramo)
VALUES
    ('Expreso Pocillo', 'expreso', 1, 1, 18, 2500, 140),
    ('Expreso Pocillo', 'expreso', 2, 1, 18, 2500, 180),
    ('Expreso Pocillo', 'expreso', 3, 1, 18, 2500, 240),

    ('Expreso Mediano', 'expreso', 1, 2, 27, 2500, 140),
    ('Expreso Mediano', 'expreso', 2, 2, 27, 2500, 180),
    ('Expreso Mediano', 'expreso', 3, 2, 27, 2500, 240),

    ('Expreso Taza grande', 'expreso', 1, 3, 36, 2500, 140),
    ('Expreso Taza grande', 'expreso', 2, 3, 36, 2500, 180),
    ('Expreso Taza grande', 'expreso', 3, 3, 36, 2500, 240),

    ('Filtrado Pocillo', 'filtrado', 1, 1, 6, 3200, 140),
    ('Filtrado Pocillo', 'filtrado', 2, 1, 6, 3200, 180),
    ('Filtrado Pocillo', 'filtrado', 3, 1, 6, 3200, 240),

    ('Filtrado Mediano', 'filtrado', 1, 2, 15, 3200, 140),
    ('Filtrado Mediano', 'filtrado', 2, 2, 15, 3200, 180),
    ('Filtrado Mediano', 'filtrado', 3, 2, 15, 3200, 240),

    ('Filtrado Taza grande', 'filtrado', 1, 3, 25, 3200, 140),
    ('Filtrado Taza grande', 'filtrado', 2, 3, 25, 3200, 180),
    ('Filtrado Taza grande', 'filtrado', 3, 3, 25, 3200, 240),

    ('Muffin de chocolate', 'pasteleria', NULL, NULL, NULL, 2500, NULL),
    ('Porción de torta selva negra', 'pasteleria', NULL, NULL, NULL, 4200, NULL); 