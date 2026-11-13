import bcrypt from 'bcrypt';
import { Router } from 'express';
import { consultar, uno } from './db.js';
import { exigirAuth, firmar } from './auth.js';

export const authRouter = Router();

authRouter.post('/registro', async (req, res) => {
  const nombre = texto(req.body.nombre);
  const correo = texto(req.body.correo).toLowerCase();
  const password = String(req.body.password ?? '');
  const rol = texto(req.body.rol) || 'usuario';
  const especialidades = Array.isArray(req.body.especialidades) ? req.body.especialidades : [];
  const cupo = Number(req.body.cupoMaximo ?? 3);

  if (!nombre || !correo || password.length < 6) {
    return res.status(400).json({ mensaje: 'Nombre, correo y una contraseña de al menos 6 caracteres son obligatorios.' });
  }
  if (!['usuario', 'experto'].includes(rol)) {
    return res.status(400).json({ mensaje: 'El rol debe ser usuario o experto.' });
  }
  if (rol === 'experto' && especialidades.length === 0) {
    return res.status(400).json({ mensaje: 'Un experto debe indicar al menos una especialidad.' });
  }

  const existe = await uno('SELECT id FROM usuarios WHERE correo = $1', [correo]);
  if (existe) {
    return res.status(409).json({ mensaje: 'Ese correo ya está registrado.' });
  }

  const hash = await bcrypt.hash(password, 10);
  const usuario = await uno(
    `INSERT INTO usuarios (nombre, correo, password_hash, rol_id)
     VALUES ($1, $2, $3, (SELECT id FROM roles WHERE nombre = $4))
     RETURNING id, nombre, correo`,
    [nombre, correo, hash, rol],
  );

  let expertoId = null;
  if (rol === 'experto') {
    const experto = await uno(
      `INSERT INTO expertos (usuario_id, disponible, cupo_maximo)
       VALUES ($1, TRUE, $2) RETURNING id`,
      [usuario.id, Number.isInteger(cupo) && cupo > 0 ? cupo : 3],
    );
    expertoId = experto.id;
    for (const especialidadId of especialidades) {
      await consultar(
        `INSERT INTO experto_especialidades (experto_id, especialidad_id)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [expertoId, Number(especialidadId)],
      );
    }
  }

  const sesion = { ...usuario, rol, experto_id: expertoId };
  return res.status(201).json({ token: firmar(sesion), usuario: publico(sesion) });
});

authRouter.post('/login', async (req, res) => {
  const correo = texto(req.body.correo).toLowerCase();
  const password = String(req.body.password ?? '');
  const usuario = await uno(
    `SELECT u.id, u.nombre, u.correo, u.password_hash, r.nombre AS rol, e.id AS experto_id
     FROM usuarios u
     JOIN roles r ON r.id = u.rol_id
     LEFT JOIN expertos e ON e.usuario_id = u.id
     WHERE u.correo = $1`,
    [correo],
  );
  if (!usuario || !(await bcrypt.compare(password, usuario.password_hash))) {
    return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos.' });
  }
  return res.json({ token: firmar(usuario), usuario: publico(usuario) });
});

authRouter.get('/yo', exigirAuth, async (req, res) => {
  res.json({ usuario: req.usuario });
});

function publico(usuario) {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol,
    expertoId: usuario.experto_id ?? null,
  };
}

function texto(valor) {
  return String(valor ?? '').trim();
}
