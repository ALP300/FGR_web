import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://fgr_bd_user:adddygjSl74hhwxcYgpKyxdRrZOKvvZZ@dpg-d9u79d3ncjis73alt6t0-a.virginia-postgres.render.com/fgr_bd?ssl=true';

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    console.log('Conectando a la base de datos PostgreSQL en Render...');
    await client.connect();
    console.log('¡Conexión exitosa!');

    const createTablesQuery = `
      -- 1. Tabla CajaDiaria
      CREATE TABLE IF NOT EXISTS "CajaDiaria" (
          "Id" SERIAL PRIMARY KEY,
          "FechaApertura" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          "FechaCierre" TIMESTAMP WITH TIME ZONE NULL,
          "MontoApertura" NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
          "SaldoTotalCaja" NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
          "IngresosEfectivo" NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
          "IngresosDigital" NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
          "EgresosPrestamos" NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
          "EgresosGastos" NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
          "CajaAbierta" BOOLEAN NOT NULL DEFAULT TRUE,
          "UsuarioApertura" VARCHAR(100) NOT NULL DEFAULT 'Admin'
      );

      -- 2. Tabla CajaMovimientos
      CREATE TABLE IF NOT EXISTS "CajaMovimientos" (
          "Id" SERIAL PRIMARY KEY,
          "Fecha" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          "Tipo" VARCHAR(20) NOT NULL,
          "Categoria" VARCHAR(50) NOT NULL,
          "Concepto" VARCHAR(250) NOT NULL,
          "Monto" NUMERIC(18, 2) NOT NULL,
          "MetodoPago" VARCHAR(30) NOT NULL DEFAULT 'Efectivo',
          "Usuario" VARCHAR(100) NOT NULL DEFAULT 'Admin'
      );

      -- 3. Tabla Auditorias
      CREATE TABLE IF NOT EXISTS "Auditorias" (
          "Id" SERIAL PRIMARY KEY,
          "Fecha" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          "Usuario" VARCHAR(100) NOT NULL DEFAULT 'Admin',
          "Modulo" VARCHAR(50) NOT NULL,
          "Accion" VARCHAR(100) NOT NULL,
          "Detalle" TEXT NOT NULL,
          "Tipo" VARCHAR(20) NOT NULL DEFAULT 'info'
      );
    `;

    console.log('Creando tablas CajaDiaria, CajaMovimientos y Auditorias...');
    await client.query(createTablesQuery);
    console.log('¡Tablas creadas correctamente en la base de datos!');

    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('Tablas actuales en la base de datos:');
    res.rows.forEach(r => console.log(' - ' + r.table_name));

  } catch (err) {
    console.error('Error al ejecutar migración:', err);
  } finally {
    await client.end();
  }
}

run();
