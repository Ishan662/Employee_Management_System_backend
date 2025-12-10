-- Insert Permissions
INSERT INTO permissions (name, description) VALUES
('VIEW_USERS', 'Can view user list and details'),
('CREATE_USER', 'Can create new users'),
('UPDATE_USER', 'Can update user information'),
('DELETE_USER', 'Can delete users'),
('TOGGLE_USER_ACTIVE', 'Can enable/disable users'),
('VIEW_ROLES', 'Can view roles'),
('CREATE_ROLE', 'Can create new roles'),
('UPDATE_ROLE', 'Can update roles'),
('DELETE_ROLE', 'Can delete roles'),
('VIEW_OWN_PROFILE', 'Can view own profile');

-- Get role IDs (you'll need to adjust these based on your actual role IDs)
-- Run: SELECT id, name FROM roles;
-- Then replace the UUIDs below with actual values

-- Example: Assign permissions to Admin role
INSERT INTO role_permissions ("roleId", "permissionsName") VALUES
('<admin-role-id>', 'VIEW_USERS'),
('<admin-role-id>', 'CREATE_USER'),
('<admin-role-id>', 'UPDATE_USER'),
('<admin-role-id>', 'DELETE_USER'),
('<admin-role-id>', 'TOGGLE_USER_ACTIVE'),
('<admin-role-id>', 'VIEW_ROLES'),
('<admin-role-id>', 'CREATE_ROLE'),
('<admin-role-id>', 'UPDATE_ROLE'),
('<admin-role-id>', 'DELETE_ROLE'),
('<admin-role-id>', 'VIEW_OWN_PROFILE');

-- Example: Assign permissions to Manager role
INSERT INTO role_permissions ("roleId", "permissionsName") VALUES
('<manager-role-id>', 'VIEW_USERS'),
('<manager-role-id>', 'CREATE_USER'),
('<manager-role-id>', 'VIEW_ROLES'),
('<manager-role-id>', 'VIEW_OWN_PROFILE');

-- Example: Assign permissions to Employee role
INSERT INTO role_permissions ("roleId", "permissionsName") VALUES
('<employee-role-id>', 'VIEW_OWN_PROFILE');
