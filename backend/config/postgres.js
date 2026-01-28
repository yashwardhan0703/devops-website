const { Pool } = require('pg');

let pool;

const connectPostgres = async () => {
  try {
    pool = new Pool({
      host: process.env.POSTGRES_HOST || 'postgres',
      port: process.env.POSTGRES_PORT || 5432,
      database: process.env.POSTGRES_DB || 'devops_db',
      user: process.env.POSTGRES_USER || 'devops_user',
      password: process.env.POSTGRES_PASSWORD || 'devops_password',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test connection
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected successfully');
    client.release();

    pool.on('error', (err) => {
      console.error('Unexpected PostgreSQL error:', err);
    });

  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    throw error;
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('PostgreSQL pool not initialized');
  }
  return pool;
};

module.exports = { connectPostgres, getPool };
