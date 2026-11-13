import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function consultar(texto, parametros = []) {
  const resultado = await pool.query(texto, parametros);
  return resultado.rows;
}

export async function uno(texto, parametros = []) {
  const filas = await consultar(texto, parametros);
  return filas[0] ?? null;
}
