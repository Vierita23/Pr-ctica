import { consultar, pool, uno } from './db.js';

const ESTADOS_CERRADOS = ['Reparado', 'No reparable'];

export async function emparejar(ticketId) {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    const ticket = await cliente.query(
      `SELECT t.id, t.estado, t.evento_id, e.categoria, ev.capacidad
       FROM tickets t
       JOIN electrodomesticos e ON e.id = t.electrodomestico_id
       JOIN eventos ev ON ev.id = t.evento_id
       WHERE t.id = $1
       FOR UPDATE OF t`,
      [ticketId],
    );
    const actual = ticket.rows[0];
    if (!actual) {
      await cliente.query('ROLLBACK');
      return { ok: false, mensaje: 'El ticket no existe.' };
    }
    if (actual.estado !== 'Pendiente') {
      await cliente.query('ROLLBACK');
      return { ok: false, mensaje: 'Solo se emparejan tickets pendientes.' };
    }
    const yaAsignado = await cliente.query(
      `SELECT id FROM asignaciones WHERE ticket_id = $1 AND estado IN ('pendiente', 'aceptada') LIMIT 1`,
      [ticketId],
    );
    if (yaAsignado.rows[0]) {
      await cliente.query('ROLLBACK');
      return { ok: false, mensaje: 'Este ticket ya tiene un experto propuesto.' };
    }

    const ocupacion = await cliente.query(
      `SELECT COUNT(DISTINCT t.id)::int AS total
       FROM tickets t
       JOIN asignaciones a ON a.ticket_id = t.id
       WHERE t.evento_id = $1 AND a.estado <> 'rechazada'`,
      [actual.evento_id],
    );
    if (ocupacion.rows[0].total >= actual.capacidad) {
      await cliente.query('ROLLBACK');
      return { ok: false, mensaje: 'El evento ya no tiene cupos.' };
    }

    const expertos = await cliente.query(
      `SELECT e.id, e.cupo_maximo,
              COUNT(a.id) FILTER (
                WHERE a.estado IN ('pendiente', 'aceptada')
                  AND t.estado IS DISTINCT FROM 'Reparado'
                  AND t.estado IS DISTINCT FROM 'No reparable'
              )::int AS carga
       FROM expertos e
       JOIN experto_especialidades ee ON ee.experto_id = e.id
       JOIN especialidades s ON s.id = ee.especialidad_id
       LEFT JOIN asignaciones a ON a.experto_id = e.id
       LEFT JOIN tickets t ON t.id = a.ticket_id
       WHERE e.disponible = TRUE
         AND lower(s.nombre) = lower($1)
       GROUP BY e.id
       HAVING COUNT(a.id) FILTER (
         WHERE a.estado IN ('pendiente', 'aceptada')
           AND t.estado IS DISTINCT FROM 'Reparado'
           AND t.estado IS DISTINCT FROM 'No reparable'
       ) < e.cupo_maximo
       ORDER BY carga ASC, e.id ASC
       LIMIT 1`,
      [actual.categoria],
    );
    const experto = expertos.rows[0];
    if (!experto) {
      await cliente.query('ROLLBACK');
      return { ok: false, mensaje: 'No hay un experto disponible para esa categoría.' };
    }

    await cliente.query(
      `INSERT INTO asignaciones (ticket_id, experto_id, estado) VALUES ($1, $2, 'pendiente')`,
      [ticketId, experto.id],
    );
    await cliente.query('COMMIT');
    return { ok: true, expertoId: experto.id };
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    cliente.release();
  }
}

export async function registrarHistorial(ticketId, anterior, nuevo, nota, usuarioId) {
  await consultar(
    `INSERT INTO historial_reparaciones (ticket_id, estado_anterior, estado_nuevo, nota, usuario_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [ticketId, anterior, nuevo, nota, usuarioId],
  );
}

export async function cambiarEstado(ticketId, estado, nota, usuarioId) {
  const ticket = await uno('SELECT estado FROM tickets WHERE id = $1', [ticketId]);
  if (!ticket) {
    return null;
  }
  await consultar('UPDATE tickets SET estado = $2 WHERE id = $1', [ticketId, estado]);
  await registrarHistorial(ticketId, ticket.estado, estado, nota, usuarioId);
  return uno('SELECT * FROM tickets WHERE id = $1', [ticketId]);
}

export { ESTADOS_CERRADOS };
