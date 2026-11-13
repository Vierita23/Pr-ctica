import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { consultar, uno } from './db.js';
import { exigirAuth, exigirRol } from './auth.js';
import { cambiarEstado, emparejar, registrarHistorial } from './emparejamiento.js';

const ESTADOS = ['Pendiente', 'Asignado', 'En reparación', 'Reparado', 'No reparable'];

const almacenamiento = multer.diskStorage({
  destination: 'uploads',
  filename: (_req, archivo, callback) => {
    const extension = path.extname(archivo.originalname).toLowerCase();
    callback(null, `${Date.now()}${extension}`);
  },
});
const subirFoto = multer({
  storage: almacenamiento,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, archivo, callback) => {
    const permitida = ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(archivo.originalname).toLowerCase());
    callback(null, permitida);
  },
});

export const datosRouter = Router();

datosRouter.get('/especialidades', async (_req, res) => {
  res.json(await consultar('SELECT id, nombre FROM especialidades ORDER BY nombre'));
});

datosRouter.use(exigirAuth);

datosRouter.get('/eventos', async (_req, res) => {
  res.json(await consultar(
    `SELECT id, nombre, descripcion, ubicacion, fecha, hora_inicio, hora_fin, capacidad
     FROM eventos ORDER BY fecha, hora_inicio`,
  ));
});

datosRouter.post('/eventos', exigirRol('administrador'), async (req, res) => {
  const evento = leerEvento(req.body);
  if (!evento) {
    return res.status(400).json({ mensaje: 'Completa nombre, descripción, ubicación, fecha, horario y capacidad.' });
  }
  const creado = await uno(
    `INSERT INTO eventos (nombre, descripcion, ubicacion, fecha, hora_inicio, hora_fin, capacidad, creado_por)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [evento.nombre, evento.descripcion, evento.ubicacion, evento.fecha, evento.horaInicio, evento.horaFin, evento.capacidad, req.usuario.id],
  );
  res.status(201).json(creado);
});

datosRouter.put('/eventos/:id', exigirRol('administrador'), async (req, res) => {
  const evento = leerEvento(req.body);
  if (!evento) {
    return res.status(400).json({ mensaje: 'Completa todos los datos del evento.' });
  }
  const actualizado = await uno(
    `UPDATE eventos
     SET nombre=$2, descripcion=$3, ubicacion=$4, fecha=$5, hora_inicio=$6, hora_fin=$7, capacidad=$8
     WHERE id=$1 RETURNING *`,
    [req.params.id, evento.nombre, evento.descripcion, evento.ubicacion, evento.fecha, evento.horaInicio, evento.horaFin, evento.capacidad],
  );
  if (!actualizado) {
    return res.status(404).json({ mensaje: 'El evento no existe.' });
  }
  res.json(actualizado);
});

datosRouter.delete('/eventos/:id', exigirRol('administrador'), async (req, res) => {
  const usados = await uno('SELECT id FROM tickets WHERE evento_id = $1 LIMIT 1', [req.params.id]);
  if (usados) {
    return res.status(409).json({ mensaje: 'No se puede eliminar un evento que ya tiene tickets.' });
  }
  const borrado = await uno('DELETE FROM eventos WHERE id = $1 RETURNING id', [req.params.id]);
  if (!borrado) {
    return res.status(404).json({ mensaje: 'El evento no existe.' });
  }
  res.status(204).end();
});

datosRouter.get('/tickets', async (req, res) => {
  const filtros = [];
  const parametros = [];
  if (req.usuario.rol === 'usuario') {
    parametros.push(req.usuario.id);
    filtros.push(`e.usuario_id = $${parametros.length}`);
  }
  if (req.usuario.rol === 'experto') {
    parametros.push(req.usuario.expertoId);
    filtros.push(`EXISTS (
      SELECT 1 FROM asignaciones ax
      WHERE ax.ticket_id = t.id AND ax.experto_id = $${parametros.length}
    )`);
  }
  const donde = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
  res.json(await consultar(`${consultaTickets()} ${donde} ORDER BY t.creado_en DESC`, parametros));
});

datosRouter.get('/tickets/:id', async (req, res) => {
  const ticket = await uno(`${consultaTickets()} WHERE t.id = $1`, [req.params.id]);
  if (!ticket || !puedeVer(req.usuario, ticket)) {
    return res.status(404).json({ mensaje: 'El ticket no existe.' });
  }
  if (req.usuario.rol === 'experto') {
    const asignada = await uno(
      'SELECT id FROM asignaciones WHERE ticket_id = $1 AND experto_id = $2',
      [req.params.id, req.usuario.expertoId],
    );
    if (!asignada) {
      return res.status(404).json({ mensaje: 'El ticket no existe.' });
    }
  }
  const historial = await consultar(
    `SELECT h.estado_anterior, h.estado_nuevo, h.nota, h.creado_en, u.nombre AS autor
     FROM historial_reparaciones h
     LEFT JOIN usuarios u ON u.id = h.usuario_id
     WHERE h.ticket_id = $1 ORDER BY h.creado_en`,
    [req.params.id],
  );
  res.json({ ...ticket, historial });
});

datosRouter.post('/tickets', exigirRol('usuario'), subirFoto.single('foto'), async (req, res) => {
  const nombre = texto(req.body.nombre);
  const categoria = texto(req.body.categoria);
  const marca = texto(req.body.marca);
  const modelo = texto(req.body.modelo);
  const problema = texto(req.body.problema);
  const eventoId = Number(req.body.eventoId);
  if (!nombre || !categoria || !marca || !modelo || !problema || !eventoId) {
    return res.status(400).json({ mensaje: 'Faltan datos del aparato o del evento.' });
  }
  const evento = await uno('SELECT id FROM eventos WHERE id = $1', [eventoId]);
  if (!evento) {
    return res.status(404).json({ mensaje: 'El evento no existe.' });
  }
  const aparato = await uno(
    `INSERT INTO electrodomesticos (usuario_id, nombre, categoria, marca, modelo, problema, foto)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [req.usuario.id, nombre, categoria, marca, modelo, problema, req.file ? `/uploads/${req.file.filename}` : null],
  );
  const ticket = await uno(
    `INSERT INTO tickets (codigo, electrodomestico_id, evento_id)
     VALUES ('TMP', $1, $2) RETURNING id`,
    [aparato.id, eventoId],
  );
  const codigo = `RC-${String(ticket.id).padStart(4, '0')}`;
  await consultar('UPDATE tickets SET codigo = $2 WHERE id = $1', [ticket.id, codigo]);
  await registrarHistorial(ticket.id, null, 'Pendiente', 'Ticket creado', req.usuario.id);
  const emparejado = await emparejar(ticket.id);
  const completo = await uno(`${consultaTickets()} WHERE t.id = $1`, [ticket.id]);
  res.status(201).json({ ...completo, emparejado });
});

datosRouter.post('/tickets/:id/emparejar', exigirRol('administrador'), async (req, res) => {
  const resultado = await emparejar(Number(req.params.id));
  if (!resultado.ok) {
    return res.status(409).json(resultado);
  }
  res.json(resultado);
});

datosRouter.post('/tickets/:id/asignar', exigirRol('administrador'), async (req, res) => {
  const expertoId = Number(req.body.expertoId);
  const ticket = await uno('SELECT id, estado, evento_id FROM tickets WHERE id = $1', [req.params.id]);
  const experto = await uno('SELECT id, cupo_maximo, disponible FROM expertos WHERE id = $1', [expertoId]);
  if (!ticket || !experto) {
    return res.status(404).json({ mensaje: 'Ticket o experto no encontrado.' });
  }
  if (!experto.disponible) {
    return res.status(409).json({ mensaje: 'Ese experto no está disponible.' });
  }
  const carga = await uno(
    `SELECT COUNT(*)::int AS total FROM asignaciones a
     JOIN tickets t ON t.id = a.ticket_id
     WHERE a.experto_id = $1 AND a.estado IN ('pendiente', 'aceptada')
       AND t.estado NOT IN ('Reparado', 'No reparable')`,
    [expertoId],
  );
  if (carga.total >= experto.cupo_maximo) {
    return res.status(409).json({ mensaje: 'Ese experto ya alcanzó su cupo.' });
  }
  await consultar(
    `INSERT INTO asignaciones (ticket_id, experto_id, estado) VALUES ($1, $2, 'pendiente')`,
    [ticket.id, expertoId],
  );
  res.status(201).json({ ok: true });
});

datosRouter.post('/asignaciones/:id/responder', exigirRol('experto'), async (req, res) => {
  const decision = texto(req.body.decision);
  if (!['aceptada', 'rechazada'].includes(decision)) {
    return res.status(400).json({ mensaje: 'La decisión debe ser aceptada o rechazada.' });
  }
  const asignacion = await uno(
    `SELECT a.id, a.ticket_id, t.estado
     FROM asignaciones a JOIN tickets t ON t.id = a.ticket_id
     WHERE a.id = $1 AND a.experto_id = $2 AND a.estado = 'pendiente'`,
    [req.params.id, req.usuario.expertoId],
  );
  if (!asignacion) {
    return res.status(404).json({ mensaje: 'La asignación no está pendiente.' });
  }
  await consultar(
    `UPDATE asignaciones SET estado = $2, observacion = $3 WHERE id = $1`,
    [asignacion.id, decision, texto(req.body.observacion) || null],
  );
  if (decision === 'aceptada') {
    await cambiarEstado(asignacion.ticket_id, 'Asignado', 'El experto aceptó la reparación', req.usuario.id);
  }
  res.json({ ok: true });
});

datosRouter.patch('/tickets/:id', exigirRol('experto', 'administrador'), async (req, res) => {
  const estado = texto(req.body.estado);
  if (!ESTADOS.includes(estado)) {
    return res.status(400).json({ mensaje: 'El estado no es válido.' });
  }
  if (req.usuario.rol === 'experto') {
    const propia = await uno(
      `SELECT id FROM asignaciones
       WHERE ticket_id = $1 AND experto_id = $2 AND estado = 'aceptada'`,
      [req.params.id, req.usuario.expertoId],
    );
    if (!propia) {
      return res.status(403).json({ mensaje: 'Solo puedes actualizar una reparación que aceptaste.' });
    }
  }
  const nota = texto(req.body.observacion);
  const resultado = texto(req.body.resultado);
  const actualizado = await cambiarEstado(Number(req.params.id), estado, nota || `Estado cambiado a ${estado}`, req.usuario.id);
  if (!actualizado) {
    return res.status(404).json({ mensaje: 'El ticket no existe.' });
  }
  if (resultado || nota) {
    await consultar(
      `UPDATE asignaciones SET observacion = COALESCE($2, observacion), resultado = COALESCE($3, resultado)
       WHERE ticket_id = $1 AND estado = 'aceptada'`,
      [req.params.id, nota || null, resultado || null],
    );
  }
  res.json(actualizado);
});

datosRouter.get('/expertos', async (_req, res) => {
  res.json(await consultar(
    `SELECT e.id, u.nombre, u.correo, e.disponible, e.cupo_maximo,
            COALESCE(string_agg(s.nombre, ', ' ORDER BY s.nombre), '') AS especialidades,
            COUNT(a.id) FILTER (
              WHERE a.estado IN ('pendiente', 'aceptada')
                AND t.estado NOT IN ('Reparado', 'No reparable')
            )::int AS carga
     FROM expertos e
     JOIN usuarios u ON u.id = e.usuario_id
     LEFT JOIN experto_especialidades ee ON ee.experto_id = e.id
     LEFT JOIN especialidades s ON s.id = ee.especialidad_id
     LEFT JOIN asignaciones a ON a.experto_id = e.id
     LEFT JOIN tickets t ON t.id = a.ticket_id
     GROUP BY e.id, u.nombre, u.correo
     ORDER BY u.nombre`,
  ));
});

datosRouter.patch('/expertos/me', exigirRol('experto'), async (req, res) => {
  const disponible = Boolean(req.body.disponible);
  const cupo = Number(req.body.cupoMaximo);
  if (!Number.isInteger(cupo) || cupo < 1) {
    return res.status(400).json({ mensaje: 'El cupo debe ser un número mayor que cero.' });
  }
  const experto = await uno(
    `UPDATE expertos SET disponible = $2, cupo_maximo = $3 WHERE id = $1 RETURNING id, disponible, cupo_maximo`,
    [req.usuario.expertoId, disponible, cupo],
  );
  res.json(experto);
});

datosRouter.get('/usuarios', exigirRol('administrador'), async (_req, res) => {
  res.json(await consultar(
    `SELECT u.id, u.nombre, u.correo, r.nombre AS rol, u.creado_en
     FROM usuarios u JOIN roles r ON r.id = u.rol_id
     ORDER BY u.creado_en DESC`,
  ));
});

datosRouter.delete('/usuarios/:id', exigirRol('administrador'), async (req, res) => {
  if (Number(req.params.id) === req.usuario.id) {
    return res.status(409).json({ mensaje: 'No puedes eliminar tu propio usuario.' });
  }
  const borrado = await uno('DELETE FROM usuarios WHERE id = $1 RETURNING id', [req.params.id]);
  if (!borrado) {
    return res.status(404).json({ mensaje: 'El usuario no existe.' });
  }
  res.status(204).end();
});

datosRouter.get('/dashboard', exigirRol('administrador'), async (_req, res) => {
  const totales = await uno(
    `SELECT
       (SELECT COUNT(*)::int FROM usuarios) AS usuarios,
       (SELECT COUNT(*)::int FROM eventos WHERE fecha >= CURRENT_DATE) AS eventos,
       (SELECT COUNT(*)::int FROM tickets WHERE estado = 'Pendiente') AS pendientes,
       (SELECT COUNT(*)::int FROM tickets WHERE estado = 'Reparado') AS reparadas,
       (SELECT COUNT(*)::int FROM expertos WHERE disponible) AS expertos,
       (SELECT COUNT(*)::int FROM tickets WHERE estado IN ('Reparado', 'No reparable')) AS cerradas`,
  );
  const porEstado = await consultar(
    `SELECT estado, COUNT(*)::int AS total FROM tickets GROUP BY estado ORDER BY estado`,
  );
  const cerradas = totales.cerradas || 0;
  res.json({
    ...totales,
    porcentajeExito: cerradas === 0 ? 0 : Math.round((totales.reparadas * 100) / cerradas),
    porEstado,
  });
});

function consultaTickets() {
  return `SELECT t.id, t.codigo, t.estado, t.creado_en, t.evento_id,
            ev.nombre AS evento, ev.fecha, ev.ubicacion,
            e.nombre AS aparato, e.categoria, e.marca, e.modelo, e.problema, e.foto, e.usuario_id AS dueno_id,
            u.nombre AS dueno,
            a.id AS asignacion_id, a.estado AS asignacion_estado, a.observacion, a.resultado,
            exp.nombre AS experto
     FROM tickets t
     JOIN electrodomesticos e ON e.id = t.electrodomestico_id
     JOIN usuarios u ON u.id = e.usuario_id
     JOIN eventos ev ON ev.id = t.evento_id
     LEFT JOIN LATERAL (
       SELECT id, experto_id, estado, observacion, resultado
       FROM asignaciones
       WHERE ticket_id = t.id
       ORDER BY creado_en DESC
       LIMIT 1
     ) a ON TRUE
     LEFT JOIN expertos ex ON ex.id = a.experto_id
     LEFT JOIN usuarios exp ON exp.id = ex.usuario_id`;
}

function puedeVer(usuario, ticket) {
  if (usuario.rol === 'administrador') return true;
  if (usuario.rol === 'usuario') return ticket.dueno_id === usuario.id;
  return true;
}

function leerEvento(body) {
  const nombre = texto(body.nombre);
  const descripcion = texto(body.descripcion);
  const ubicacion = texto(body.ubicacion);
  const fecha = texto(body.fecha);
  const horaInicio = texto(body.horaInicio);
  const horaFin = texto(body.horaFin);
  const capacidad = Number(body.capacidad);
  if (!nombre || !descripcion || !ubicacion || !fecha || !horaInicio || !horaFin || !Number.isInteger(capacidad) || capacidad < 1) {
    return null;
  }
  return { nombre, descripcion, ubicacion, fecha, horaInicio, horaFin, capacidad };
}

function texto(valor) {
  return String(valor ?? '').trim();
}
