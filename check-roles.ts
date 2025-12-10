import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'ems_db',
});

async function checkRoles() {
  await AppDataSource.initialize();
  
  console.log('=== Checking roles table ===');
  const roles = await AppDataSource.query('SELECT id, name, description FROM roles ORDER BY name');
  
  console.log('\nRoles in database:');
  console.table(roles);
  
  await AppDataSource.destroy();
}

checkRoles().catch(console.error);
