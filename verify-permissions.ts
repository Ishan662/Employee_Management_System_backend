import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'ems',
  synchronize: false,
  logging: false,
  entities: [],
});

async function verifySetup() {
  try {
    await AppDataSource.initialize();
    
    console.log('✅ Database connection established\n');
    
    // Check permissions
    console.log('📊 Permissions in database:');
    const permissions = await AppDataSource.query(
      `SELECT name, description FROM permissions ORDER BY name`
    );
    console.log(`  Found ${permissions.length} permissions:`);
    permissions.forEach((p: any) => {
      console.log(`    ✓ ${p.name}`);
    });
    
    // Check role-permission assignments
    console.log('\n📊 Role-Permission Assignments:');
    const assignments = await AppDataSource.query(`
      SELECT 
        r.name as role_name,
        p.name as permission_name
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp."rolesId"
      LEFT JOIN permissions p ON rp."permissionsName" = p.name
      ORDER BY r.name, p.name
    `);
    
    const roleGroups: { [key: string]: string[] } = {};
    assignments.forEach((a: any) => {
      if (!roleGroups[a.role_name]) {
        roleGroups[a.role_name] = [];
      }
      if (a.permission_name) {
        roleGroups[a.role_name].push(a.permission_name);
      }
    });
    
    Object.keys(roleGroups).sort().forEach(roleName => {
      console.log(`\n  ${roleName} (${roleGroups[roleName].length} permissions):`);
      roleGroups[roleName].forEach(permName => {
        console.log(`    ✓ ${permName}`);
      });
    });
    
    // Check if a sample user exists
    console.log('\n📊 Sample Users:');
    const users = await AppDataSource.query(`
      SELECT u.email, r.name as role_name
      FROM users u
      JOIN roles r ON u."roleId" = r.id
      LIMIT 5
    `);
    
    if (users.length > 0) {
      console.log('  Found users:');
      users.forEach((u: any) => {
        console.log(`    - ${u.email} (${u.role_name})`);
      });
    } else {
      console.log('  ⚠️  No users found. Create a user to test login.');
    }
    
    console.log('\n✅ Verification complete!');
    console.log('\n🧪 To test the permission system:');
    console.log('  1. Make sure backend is running: npm run start:dev');
    console.log('  2. Login via POST http://localhost:3000/auth/login');
    console.log('  3. Check that response includes role.permissions array');
    console.log('  4. JWT token should include permissions in payload');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

verifySetup();
