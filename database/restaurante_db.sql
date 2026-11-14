
CREATE DATABASE IF NOT EXISTS restaurante_db
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE restaurante_db;

CREATE TABLE IF NOT EXISTS usuario (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre        VARCHAR(100)    NOT NULL,
    apellido      VARCHAR(100)    NOT NULL,
    email         VARCHAR(150)    NOT NULL UNIQUE,
    password      VARCHAR(255)    NOT NULL,
    rol           ENUM('ADMIN','MESERO','COCINERO','CAJERO') NOT NULL DEFAULT 'MESERO',
    activo        BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at    DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categoria (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre        VARCHAR(100)    NOT NULL UNIQUE,
    descripcion   VARCHAR(255)    NULL,
    activa        BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at    DATETIME        DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS plato (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre        VARCHAR(150)    NOT NULL,
    descripcion   TEXT            NULL,
    precio        DECIMAL(10,2)   NOT NULL CHECK (precio > 0),
    imagen_url    VARCHAR(500)    NULL,
    disponible    BOOLEAN         NOT NULL DEFAULT TRUE,
    categoria_id  BIGINT          NOT NULL,
    created_at    DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_plato_categoria FOREIGN KEY (categoria_id) REFERENCES categoria(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS mesa (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero        INT             NOT NULL UNIQUE,
    capacidad     INT             NOT NULL CHECK (capacidad > 0),
    ubicacion     VARCHAR(100)    NULL,
    estado        ENUM('DISPONIBLE','OCUPADA','RESERVADA') DEFAULT 'DISPONIBLE',
    created_at    DATETIME        DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pedido (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    mesa_id           BIGINT          NOT NULL,
    mesero_id         BIGINT          NOT NULL,
    estado            ENUM('PENDIENTE','EN_PREPARACION','LISTO','ENTREGADO','PAGADO','CANCELADO')
                                      DEFAULT 'PENDIENTE',
    total             DECIMAL(10,2)   DEFAULT 0.00,
    observaciones     TEXT            NULL,
    tipo_comprobante  VARCHAR(20)     NULL DEFAULT 'BOLETA',
    serie_numero      VARCHAR(30)     NULL,
    cliente_documento VARCHAR(150)    NULL DEFAULT 'Cliente General',
    metodo_pago       VARCHAR(50)     NULL DEFAULT 'Efectivo',
    fecha_creacion    DATETIME        DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre      DATETIME        NULL,
    CONSTRAINT fk_pedido_mesa FOREIGN KEY (mesa_id) REFERENCES mesa(id) ON DELETE CASCADE,
    CONSTRAINT fk_pedido_mesero FOREIGN KEY (mesero_id) REFERENCES usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS detalle_pedido (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    pedido_id       BIGINT          NOT NULL,
    plato_id        BIGINT          NOT NULL,
    cantidad        INT             NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2)   NOT NULL,
    subtotal        DECIMAL(10,2)   NOT NULL,
    notas           VARCHAR(255)    NULL,
    CONSTRAINT fk_detalle_pedido FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_plato FOREIGN KEY (plato_id) REFERENCES plato(id) ON DELETE CASCADE
) ENGINE=InnoDB;


INSERT INTO usuario (nombre, apellido, email, password, rol) VALUES
('Admin', 'Sistema', 'admin@elbuensabor.pe', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN'),
('Carlos', 'Mendoza', 'cmendoza@elbuensabor.pe', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'MESERO'),
('Jorge', 'Ramírez', 'jramirez@elbuensabor.pe', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'COCINERO'),
('Lucía', 'Paredes', 'lparedes@elbuensabor.pe', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'CAJERO');

INSERT INTO categoria (nombre, descripcion) VALUES
('Entradas',        'Platos de entrada y aperitivos criollos'),
('Platos de Fondo', 'Platos principales de la carta'),
('Bebidas',         'Refrescos naturales, jugos y cocteles'),
('Postres',         'Dulces tradicionales y postres de la casa');

INSERT INTO mesa (numero, capacidad, ubicacion, estado) VALUES
(1, 4, 'Salón principal', 'DISPONIBLE'),
(2, 4, 'Salón principal', 'OCUPADA'),
(3, 2, 'Salón principal', 'OCUPADA'),
(4, 6, 'Salón principal', 'DISPONIBLE'),
(5, 2, 'Salón principal', 'OCUPADA'),
(6, 4, 'Salón principal', 'RESERVADA'),
(7, 4, 'Terraza',         'OCUPADA'),
(8, 2, 'Terraza',         'DISPONIBLE'),
(9, 8, 'Terraza',         'OCUPADA'),
(10, 8, 'Terraza',        'DISPONIBLE');

INSERT INTO plato (nombre, descripcion, precio, disponible, categoria_id) VALUES
('Papa a la Huancaína', 'Papa amarilla con crema de ají amarillo y queso fresco', 18.00, TRUE, 1),
('Ceviche Clásico',     'Pescado fresco del día marinado en limón con cebolla y camote', 38.00, TRUE, 1),
('Lomo Saltado',        'Trozos de lomo fino salteados al wok con cebolla, tomate y papas fritas', 35.00, TRUE, 2),
('Ají de Gallina',      'Pechuga deshilachada en crema de ají amarillo, nueces y parmesano', 28.00, TRUE, 2),
('Arroz con Mariscos',  'Arroz arbóreo salteado con mariscos selectos al vino blanco y culantro', 42.00, TRUE, 2),
('Chicha Morada 1L',    'Bebida tradicional de maíz morado con piña, membrillo y canela', 14.00, TRUE, 3),
('Pisco Sour Catedral', 'Coctel bandera con pisco quebranta, limón, jarabe de goma y amargo', 22.00, TRUE, 3),
('Suspiro a la Limeña', 'Manjar blanco de yemas coronado con merengue al oporto', 15.00, TRUE, 4);

INSERT INTO pedido (mesa_id, mesero_id, estado, total, observaciones, tipo_comprobante, serie_numero, cliente_documento, metodo_pago, fecha_creacion, fecha_cierre) VALUES
(7, 2, 'PENDIENTE',       84.00, 'Lomo saltado término medio, servir entrada primero', NULL, NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 4 MINUTE), NULL),
(9, 2, 'PENDIENTE',      112.00, 'Mesa familiar en terraza, traer vasos con hielo',   NULL, NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 7 MINUTE), NULL),
(2, 2, 'EN_PREPARACION',  56.00, 'Sin ají picante para niños',                        NULL, NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 14 MINUTE), NULL),
(5, 2, 'LISTO',           53.00, 'Cliente con prisa, emplatado clásico',              NULL, NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 19 MINUTE), NULL),
(3, 2, 'ENTREGADO',       60.00, 'Todo entregado en mesa, pendiente de cuenta',       NULL, NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 32 MINUTE), NULL),
(1, 2, 'PAGADO',          84.00, 'Atención almuerzo ejecutivo',                       'BOLETA',  'B001-000141', '72849103 - Juan Pérez',              'Yape / Plin', DATE_SUB(NOW(), INTERVAL 95 MINUTE), DATE_SUB(NOW(), INTERVAL 55 MINUTE)),
(4, 2, 'PAGADO',         136.00, 'Almuerzo corporativo',                              'FACTURA', 'F001-000038', '20604581239 - Consultora Andina SAC', 'Tarjeta POS', DATE_SUB(NOW(), INTERVAL 140 MINUTE), DATE_SUB(NOW(), INTERVAL 90 MINUTE)),
(8, 2, 'PAGADO',          53.00, 'Mesa terraza',                                      'BOLETA',  'B001-000142', 'Cliente General',                     'Efectivo',    DATE_SUB(NOW(), INTERVAL 180 MINUTE), DATE_SUB(NOW(), INTERVAL 135 MINUTE));

INSERT INTO detalle_pedido (pedido_id, plato_id, cantidad, precio_unitario, subtotal, notas) VALUES
(1, 3, 2, 35.00, 70.00, 'Término medio'),
(1, 6, 1, 14.00, 14.00, 'Helada'),
(2, 2, 1, 38.00, 38.00, 'Con rocoto aparte'),
(2, 5, 1, 42.00, 42.00, 'Bien caliente'),
(2, 1, 1, 18.00, 18.00, 'Entrada al centro'),
(2, 6, 1, 14.00, 14.00, 'Sin hielo'),
(3, 4, 2, 28.00, 56.00, 'Sin ají fuerte'),
(4, 2, 1, 38.00, 38.00, 'Ceviche del día'),
(4, 8, 1, 15.00, 15.00, 'Para después del fondo'),
(5, 2, 1, 38.00, 38.00, NULL),
(5, 7, 1, 22.00, 22.00, NULL),
(6, 3, 2, 35.00, 70.00, NULL),
(6, 6, 1, 14.00, 14.00, NULL),
(7, 5, 2, 42.00, 84.00, NULL),
(7, 1, 2, 18.00, 36.00, NULL),
(7, 8, 1, 16.00, 16.00, NULL),
(8, 2, 1, 38.00, 38.00, NULL),
(8, 8, 1, 15.00, 15.00, NULL);
