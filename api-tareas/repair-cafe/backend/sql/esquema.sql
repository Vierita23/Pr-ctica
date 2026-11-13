CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(30) UNIQUE NOT NULL
);

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  correo VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  rol_id INTEGER NOT NULL REFERENCES roles(id),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE especialidades (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(80) UNIQUE NOT NULL
);

CREATE TABLE expertos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  disponible BOOLEAN NOT NULL DEFAULT TRUE,
  cupo_maximo INTEGER NOT NULL DEFAULT 3 CHECK (cupo_maximo > 0)
);

CREATE TABLE experto_especialidades (
  experto_id INTEGER NOT NULL REFERENCES expertos(id) ON DELETE CASCADE,
  especialidad_id INTEGER NOT NULL REFERENCES especialidades(id),
  PRIMARY KEY (experto_id, especialidad_id)
);

CREATE TABLE eventos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT NOT NULL,
  ubicacion VARCHAR(200) NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  capacidad INTEGER NOT NULL CHECK (capacidad > 0),
  creado_por INTEGER REFERENCES usuarios(id)
);

CREATE TABLE electrodomesticos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  nombre VARCHAR(120) NOT NULL,
  categoria VARCHAR(80) NOT NULL,
  marca VARCHAR(80) NOT NULL,
  modelo VARCHAR(80) NOT NULL,
  problema TEXT NOT NULL,
  foto VARCHAR(255)
);

CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  electrodomestico_id INTEGER NOT NULL REFERENCES electrodomesticos(id),
  evento_id INTEGER NOT NULL REFERENCES eventos(id),
  estado VARCHAR(30) NOT NULL DEFAULT 'Pendiente'
    CHECK (estado IN ('Pendiente', 'Asignado', 'En reparación', 'Reparado', 'No reparable')),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE asignaciones (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  experto_id INTEGER NOT NULL REFERENCES expertos(id),
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'aceptada', 'rechazada')),
  observacion TEXT,
  resultado TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE historial_reparaciones (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  estado_anterior VARCHAR(30),
  estado_nuevo VARCHAR(30) NOT NULL,
  nota TEXT,
  usuario_id INTEGER REFERENCES usuarios(id),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
