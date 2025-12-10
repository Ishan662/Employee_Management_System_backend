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
  logging: true,
  entities: [],
});

async function seedPermissions() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    // Step 1: Insert permissions
    console.log('\n📝 Step 1: Creating permissions...');
    const permissionsData = [
      { name: 'VIEW_USERS', description: 'Can view user list and details' },
      { name: 'CREATE_USER', description: 'Can create new users' },
      { name: 'UPDATE_USER', description: 'Can update user information' },
      { name: 'DELETE_USER', description: 'Can delete users' },
      { name: 'TOGGLE_USER_ACTIVE', description: 'Can enable/disable users' },
      { name: 'VIEW_ROLES', description: 'Can view roles' },
      { name: 'CREATE_ROLE', description: 'Can create new roles' },
      { name: 'UPDATE_ROLE', description: 'Can update roles' },
      { name: 'DELETE_ROLE', description: 'Can delete roles' },
      { name: 'VIEW_OWN_PROFILE', description: 'Can view own profile' },
    ];

    for (const perm of permissionsData) {
      await AppDataSource.query(
        `INSERT INTO permissions (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING`,
        [perm.name, perm.description]
      );
    }
    console.log('✅ Permissions created');

    // Step 2: Get role IDs
    console.log('\n📝 Step 2: Fetching role IDs...');
    const roles = await AppDataSource.query(
      `SELECT id, name FROM roles ORDER BY name`
    );
    
    console.log('Found roles:');
    roles.forEach((role: any) => {
      console.log(`  - ${role.name}: ${role.id}`);
    });

    const adminRole = roles.find((r: any) => r.name === 'Admin');
    const managerRole = roles.find((r: any) => r.name === 'Manager');
    const employeeRole = roles.find((r: any) => r.name === 'Employee');

    if (!adminRole || !managerRole || !employeeRole) {
      console.error('❌ Error: Missing required roles (Admin, Manager, Employee)');
      console.error('Please ensure all roles exist in the database');
      return;
    }

    // Step 3: Assign permissions to roles
    console.log('\n📝 Step 3: Assigning permissions to roles...');

    // Admin gets all permissions
    const adminPermissions = [
      'VIEW_USERS', 'CREATE_USER', 'UPDATE_USER', 'DELETE_USER',
      'TOGGLE_USER_ACTIVE', 'VIEW_ROLES', 'CREATE_ROLE',
      'UPDATE_ROLE', 'DELETE_ROLE', 'VIEW_OWN_PROFILE'
    ];

    console.log(`\nAssigning ${adminPermissions.length} permissions to Admin...`);
    for (const permName of adminPermissions) {
      await AppDataSource.query(
        `INSERT INTO role_permissions ("rolesId", "permissionsName") 
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [adminRole.id, permName]
      );
    }
    console.log('✅ Admin permissions assigned');

    // Manager gets limited permissions
    const managerPermissions = [
      'VIEW_USERS', 'CREATE_USER', 'VIEW_ROLES', 'VIEW_OWN_PROFILE'
    ];

    console.log(`\nAssigning ${managerPermissions.length} permissions to Manager...`);
    for (const permName of managerPermissions) {
      await AppDataSource.query(
        `INSERT INTO role_permissions ("rolesId", "permissionsName") 
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [managerRole.id, permName]
      );
    }
    console.log('✅ Manager permissions assigned');

    // Employee gets minimal permissions
    const employeePermissions = ['VIEW_OWN_PROFILE'];

    console.log(`\nAssigning ${employeePermissions.length} permission to Employee...`);
    for (const permName of employeePermissions) {
      await AppDataSource.query(
        `INSERT INTO role_permissions ("rolesId", "permissionsName") 
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [employeeRole.id, permName]
      );
    }
    console.log('✅ Employee permissions assigned');

    // Step 4: Verify
    console.log('\n📝 Step 4: Verifying assignments...');
    const verification = await AppDataSource.query(`
      SELECT 
        r.name as role_name,
        COUNT(rp."permissionsName") as permission_count
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp."rolesId"
      GROUP BY r.name
      ORDER BY r.name
    `);

    console.log('\n✅ Permission counts per role:');
    verification.forEach((row: any) => {
      console.log(`  ${row.role_name}: ${row.permission_count} permissions`);
    });

    console.log('\n✅ Permission seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`  - Admin: ${adminPermissions.length} permissions`);
    console.log(`  - Manager: ${managerPermissions.length} permissions`);
    console.log(`  - Employee: ${employeePermissions.length} permission`);
    console.log('\n🚀 You can now restart your backend and test login!');

  } catch (error) {
    console.error('❌ Error seeding permissions:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

// Run the seed
seedPermissions()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });
