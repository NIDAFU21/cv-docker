const http = require('node:http');
const mysql = require('mysql2/promise');

const port = Number(process.env.PORT || 4000);
const retryMs = Number(process.env.DB_CONNECT_RETRY_MS || 3000);
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'database',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'cv_user',
  password: process.env.DB_PASSWORD || 'cambia_esta_clave_app',
  database: process.env.DB_NAME || 'cv_personal',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  charset: 'utf8mb4'
});

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(payload));
}

async function waitForDatabase() {
  while (true) {
    try {
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      console.log('Conexión con MySQL establecida.');
      return;
    } catch (error) {
      console.error(`MySQL todavía no está disponible: ${error.message}. Nuevo intento en ${retryMs} ms.`);
      await new Promise((resolve) => setTimeout(resolve, retryMs));
    }
  }
}

const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (req.method === 'GET' && pathname === '/health') {
    try {
      await pool.query('SELECT 1');
      return sendJson(res, 200, { estado: 'ok', baseDeDatos: 'conectada' });
    } catch (error) {
      return sendJson(res, 503, { estado: 'error', mensaje: 'No se pudo consultar MySQL.' });
    }
  }

  if (req.method === 'GET' && pathname === '/cv') {
    try {
      const [rows] = await pool.execute(
        `SELECT p.id AS persona_id, p.nombre, p.apellido, p.ciudad, p.foto,
                f.id AS formacion_id, f.titulo, f.institucion, f.anio
         FROM persona p
         LEFT JOIN formacion f ON f.persona_id = p.id
         ORDER BY f.id`
      );
      if (rows.length === 0) {
        return sendJson(res, 404, { error: 'No hay información de CV en la base de datos.' });
      }
      const persona = {
        id: rows[0].persona_id,
        nombre: rows[0].nombre,
        apellido: rows[0].apellido,
        ciudad: rows[0].ciudad,
        foto: rows[0].foto,
        formacion: rows
          .filter((row) => row.formacion_id !== null)
          .map(({ titulo, institucion, anio }) => ({ titulo, institucion, anio }))
      };
      return sendJson(res, 200, persona);
    } catch (error) {
      console.error('Error consultando el CV:', error.message);
      return sendJson(res, 503, { error: 'No se pudo obtener el CV desde la base de datos.' });
    }
  }

  return sendJson(res, 404, { error: 'Ruta no encontrada.' });
});

waitForDatabase()
  .then(() => server.listen(port, '0.0.0.0', () => console.log(`API disponible en el puerto ${port}.`)))
  .catch((error) => {
    console.error('No se pudo iniciar el backend:', error);
    process.exit(1);
  });

process.on('SIGTERM', async () => {
  server.close();
  await pool.end();
});
