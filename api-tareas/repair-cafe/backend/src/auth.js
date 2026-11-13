import jwt from 'jsonwebtoken';

export function exigirAuth(req, res, next) {
  const encabezado = req.headers.authorization ?? '';
  const token = encabezado.startsWith('Bearer ') ? encabezado.slice(7) : null;
  if (!token) {
    return res.status(401).json({ mensaje: 'Debes iniciar sesión.' });
  }
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ mensaje: 'La sesión no es válida.' });
  }
}

export function exigirRol(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: 'No tienes permiso para esta acción.' });
    }
    next();
  };
}

export function firmar(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      expertoId: usuario.experto_id ?? null,
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' },
  );
}
