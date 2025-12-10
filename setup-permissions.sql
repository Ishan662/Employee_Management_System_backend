-- ============================================
-- Permission System Database Setup
-- Run these queries in your PostgreSQL database
-- ============================================

-- Step 1: Insert all permissions
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
('VIEW_OWN_PROFILE', 'Can view own profile')
ON CONFLICT (name) DO NOTHING;

-- Step 2: Get your role IDs
-- Run this query and copy the IDs:
SELECT id, name FROM roles ORDER BY name;

-- Step 3: Assign permissions to roles
-- Replace the placeholders below with actual role IDs from Step 2

-- For ADMIN role (replace 'YOUR-ADMIN-ROLE-ID'):
INSERT INTO role_permissions ("roleId", "permissionsName") VALUES
('YOUR-ADMIN-ROLE-ID', 'VIEW_USERS'),
('YOUR-ADMIN-ROLE-ID', 'CREATE_USER'),
('YOUR-ADMIN-ROLE-ID', 'UPDATE_USER'),
('YOUR-ADMIN-ROLE-ID', 'DELETE_USER'),
('YOUR-ADMIN-ROLE-ID', 'TOGGLE_USER_ACTIVE'),
('YOUR-ADMIN-ROLE-ID', 'VIEW_ROLES'),
('YOUR-ADMIN-ROLE-ID', 'CREATE_ROLE'),
('YOUR-ADMIN-ROLE-ID', 'UPDATE_ROLE'),
('YOUR-ADMIN-ROLE-ID', 'DELETE_ROLE'),
('YOUR-ADMIN-ROLE-ID', 'VIEW_OWN_PROFILE')
ON CONFLICT DO NOTHING;

-- For MANAGER role (replace 'YOUR-MANAGER-ROLE-ID'):
INSERT INTO role_permissions ("roleId", "permissionsName") VALUES
('YOUR-MANAGER-ROLE-ID', 'VIEW_USERS'),
('YOUR-MANAGER-ROLE-ID', 'CREATE_USER'),
('YOUR-MANAGER-ROLE-ID', 'VIEW_ROLES'),
('YOUR-MANAGER-ROLE-ID', 'VIEW_OWN_PROFILE')
ON CONFLICT DO NOTHING;

-- For EMPLOYEE role (replace 'YOUR-EMPLOYEE-ROLE-ID'):
INSERT INTO role_permissions ("roleId", "permissionsName") VALUES
('YOUR-EMPLOYEE-ROLE-ID', 'VIEW_OWN_PROFILE')
ON CONFLICT DO NOTHING;

-- ============================================
-- Verification Queries
-- ============================================

-- Check all permissions
SELECT * FROM permissions ORDER BY name;

-- Check role-permission assignments
SELECT 
    r.name as role_name,
    p.name as permission_name,
    p.description
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp."roleId"
LEFT JOIN permissions p ON rp."permissionsName" = p.name
ORDER BY r.name, p.name;

-- Check a specific user's permissions
SELECT 
    u.email,
    r.name as role,
    p.name as permission
FROM users u
JOIN roles r ON u."roleId" = r.id
LEFT JOIN role_permissions rp ON r.id = rp."roleId"
LEFT JOIN permissions p ON rp."permissionsName" = p.name
WHERE u.email = 'admin@example.com'  -- Replace with actual email
ORDER BY p.name;
