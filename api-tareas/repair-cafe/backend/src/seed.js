import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { pool } from './db.js';

dotenv.config();

const adminHash = await bcrypt.hash('Admin123', 10);
const usuarioHash = await bcrypt.hash('Usuario123', 10);
const expertoHash = await bcrypt.hash('Experto123', 10);

await pool.query('BEGIN');
try {
  await pool.query(`INSERT INTO roles (nombre) VALUES ('administrador'), ('usuario'), ('experto')`);
  await pool.query(`
    INSERT INTO especialidades (nombre) VALUES
    ('Refrigeradores'), ('Lavadoras'), ('Celulares'), ('Computadores'), ('Microondas')
  `);
  const admin = await pool.query(
    `INSERT INTO usuarios (nombre, correo, password_hash, rol_id)
     VALUES ('Esteban', 'admin@repaircafe.com', $1, (SELECT id FROM roles WHERE nombre = 'administrador'))
     RETURNING id`,
    [adminHash],
  );
  await pool.query(
    `INSERT INTO usuarios (nombre, correo, password_hash, rol_id)
     VALUES ('Ana Torres', 'ana@correo.com', $1, (SELECT id FROM roles WHERE nombre = 'usuario'))`,
    [usuarioHash],
  );
  const carlos = await pool.query(
    `INSERT INTO usuarios (nombre, correo, password_hash, rol_id)
     VALUES ('Carlos Ruiz', 'carlos@correo.com', $1, (SELECT id FROM roles WHERE nombre = 'experto'))
     RETURNING id`,
    [expertoHash],
  );
  const lucia = await pool.query(
    `INSERT INTO usuarios (nombre, correo, password_hash, rol_id)
     VALUES ('Lucía Gómez', 'lucia@correo.com', $1, (SELECT id FROM roles WHERE nombre = 'experto'))
     RETURNING id`,
    [expertoHash],
  );
  const expertoCarlos = await pool.query(
    `INSERT INTO expertos (usuario_id, disponible, cupo_maximo) VALUES ($1, TRUE, 2) RETURNING id`,
    [carlos.rows[0].id],
  );
  const expertoLucia = await pool.query(
    `INSERT INTO expertos (usuario_id, disponible, cupo_maximo) VALUES ($1, TRUE, 2) RETURNING id`,
    [lucia.rows[0].id],
  );
  await pool.query(
    `INSERT INTO experto_especialidades (experto_id, especialidad_id)
     VALUES ($1, (SELECT id FROM especialidades WHERE nombre = 'Refrigeradores')),
            ($2, (SELECT id FROM especialidades WHERE nombre = 'Celulares'))`,
    [expertoCarlos.rows[0].id, expertoLucia.rows[0].id],
  );
  await pool.query(
    `INSERT INTO eventos (nombre, descripcion, ubicacion, fecha, hora_inicio, hora_fin, capacidad, creado_por)
     VALUES ('Repair Café del barrio', 'Jornada gratuita para reparar electrodomésticos.', 'Parque Central', CURRENT_DATE + 7, '09:00', '13:00', 10, $1)`,
    [admin.rows[0].id],
  );
  await pool.query('COMMIT');
  console.log('Datos de prueba listos.');
} catch (error) {
  await pool.query('ROLLBACK');
  console.error(error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
