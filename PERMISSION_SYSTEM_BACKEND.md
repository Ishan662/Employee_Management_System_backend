# Permission-Based Access Control - Backend Implementation

## ✅ Changes Made

### 1. **Updated JWT Payload to Include Permissions**

**File**: `src/auth/jwt.strategy.ts`

```typescript
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  permissions?: string[]; // ✅ Added
}

async validate(payload: JwtPayload) {
  return { 
    userId: payload.sub, 
    email: payload.email, 
    role: payload.role,
    permissions: payload.permissions || [], // ✅ Added
  };
}
```

**What it does**: 
- JWT tokens now carry an array of permission names
- `request.user` now includes `permissions` array after authentication

---

### 2. **Updated AuthService to Return Permissions**

**File**: `src/auth/auth.service.ts`

#### Login Response:
```typescript
async login(loginDto: LoginDto) {
  // ... validation ...
  
  const permissions = user.role.permissions?.map(p => p.name) || [];

  const payload = { 
    email: user.email, 
    sub: user.id,
    role: user.role.name,
    permissions, // ✅ Added to JWT
  };
  
  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: {
        name: user.role.name,
        permissions: user.role.permissions || [], // ✅ Full permission objects
      },
    },
    access_token: this.jwtService.sign(payload),
  };
}
```

**Frontend now receives**:
```json
{
  "user": {
    "id": "...",
    "email": "admin@example.com",
    "role": {
      "name": "ADMIN",
      "permissions": [
        { "name": "VIEW_USERS", "description": "..." },
        { "name": "CREATE_USER", "description": "..." },
        { "name": "DELETE_USER", "description": "..." }
      ]
    }
  },
  "access_token": "eyJhbGc..."
}
```

---

### 3. **Updated UsersService to Load Permissions**

**File**: `src/users/users.service.ts`

```typescript
// ✅ findRoleByName now loads permissions
async findRoleByName(name: string): Promise<Role> {
  const role = await this.rolesRepository.findOne({ 
    where: { name },
    relations: ['permissions'], // ✅ Added
  });
  // ...
}

// ✅ Login query now includes permissions
async findUserByEmailWithPassword(email: string): Promise<User | null> {
  return this.usersRepository.createQueryBuilder('user')
    .addSelect('user.password') 
    .leftJoinAndSelect('user.role', 'role')
    .leftJoinAndSelect('role.permissions', 'permissions') // ✅ Added
    .where('user.email = :email', { email })
    .getOne();
}

// ✅ GET /users now includes permissions
findAll(): Promise<User[]> {
  return this.usersRepository.find({
    relations: ['role', 'role.permissions'], // ✅ Added permissions
  });
}

// ✅ GET /users/:id and /users/me now include permissions
async findOne(id: string): Promise<User> {
  const user = await this.usersRepository.findOne({
    where: { id },
    relations: ['role', 'role.permissions'] // ✅ Added permissions
  });
  // ...
}
```

---

### 4. **Created Permission Guards and Decorators**

**File**: `src/common/decorators/permissions.decorator.ts`
```typescript
export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: string[]) => 
  SetMetadata(PERMISSIONS_KEY, permissions);
```

**File**: `src/common/guards/permissions.guard.ts`
```typescript
@Injectable()
export class PermissionsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Check if user has at least one of the required permissions
    return requiredPermissions.some((permission) =>
      user.permissions.includes(permission),
    );
  }
}
```

---

## 🎯 How to Use Permission-Based Guards (Optional)

### Option 1: Keep Role-Based Guards (Current)

Your current implementation still works:
```typescript
@Delete(':id')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
remove(@Param('id') id: string) {
  return this.usersService.remove(id);
}
```

### Option 2: Use Permission-Based Guards (Recommended)

```typescript
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';

@Delete(':id')
@UseGuards(AuthGuard, PermissionsGuard)
@RequirePermissions('DELETE_USER')
remove(@Param('id') id: string) {
  return this.usersService.remove(id);
}
```

### Option 3: Combine Both (Most Flexible)

```typescript
@Delete(':id')
@UseGuards(AuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.ADMIN)
@RequirePermissions('DELETE_USER')
remove(@Param('id') id: string) {
  return this.usersService.remove(id);
}
```

---

## 📊 Database Setup

### Step 1: Create Permissions

Run the SQL script: `seed-permissions.sql`

```sql
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
```

### Step 2: Assign Permissions to Roles

First, get your role IDs:
```sql
SELECT id, name FROM roles;
```

Then assign permissions (replace `<role-id>` with actual UUIDs):
```sql
-- Admin gets all permissions
INSERT INTO role_permissions ("roleId", "permissionsName") VALUES
('<admin-id>', 'VIEW_USERS'),
('<admin-id>', 'CREATE_USER'),
('<admin-id>', 'UPDATE_USER'),
('<admin-id>', 'DELETE_USER'),
('<admin-id>', 'TOGGLE_USER_ACTIVE');

-- Manager gets limited permissions
INSERT INTO role_permissions ("roleId", "permissionsName") VALUES
('<manager-id>', 'VIEW_USERS'),
('<manager-id>', 'CREATE_USER'),
('<manager-id>', 'VIEW_OWN_PROFILE');

-- Employee gets minimal permissions
INSERT INTO role_permissions ("roleId", "permissionsName") VALUES
('<employee-id>', 'VIEW_OWN_PROFILE');
```

---

## 🧪 Testing

### Test Login Response
```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Expected Response**:
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": {
      "name": "ADMIN",
      "permissions": [
        { "name": "VIEW_USERS", "description": "..." },
        { "name": "CREATE_USER", "description": "..." },
        { "name": "DELETE_USER", "description": "..." }
      ]
    }
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Test GET /users/me
```bash
GET http://localhost:3000/users/me
Authorization: Bearer <token>
```

**Expected Response**:
```json
{
  "id": "uuid",
  "email": "admin@example.com",
  "firstName": "Admin",
  "lastName": "User",
  "isActive": true,
  "role": {
    "id": "role-uuid",
    "name": "ADMIN",
    "description": "Administrator",
    "permissions": [
      { "name": "VIEW_USERS", "description": "..." },
      { "name": "CREATE_USER", "description": "..." }
    ]
  }
}
```

---

## 🔄 Migration Path

### Current State (Role-Based)
```typescript
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
```
- ✅ Still works
- ✅ No breaking changes
- ✅ Frontend already receives permissions in login response

### Gradual Migration (Optional)
1. Keep existing `@Roles()` decorators
2. Frontend uses permissions from `user.role.permissions`
3. Backend validates via roles (simpler)
4. Later, migrate to `@RequirePermissions()` if needed

---

## ✅ What's Now Supported

1. **Login/Signup** returns full permission array
2. **GET /users/me** returns user with permissions
3. **GET /users** returns all users with their permissions
4. **GET /users/:id** returns user with permissions
5. **JWT tokens** include permission names array
6. **request.user** object includes permissions array

---

## 🎨 Frontend Integration

Your frontend already has:
- ✅ `permissions.ts` with `hasPermission()` helper
- ✅ User type updated with `role.permissions`
- ✅ Components using `hasPermission('DELETE_USER')`

Backend now provides the data your frontend expects!

---

## 🚀 Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Permissions in JWT | ✅ Done | Token includes `permissions: string[]` |
| Permissions in login response | ✅ Done | Full `Permission` objects in `user.role.permissions` |
| Permissions in user queries | ✅ Done | All user endpoints load permissions |
| Permission guard | ✅ Done | Optional `PermissionsGuard` available |
| Permission decorator | ✅ Done | Optional `@RequirePermissions()` available |
| Database seed script | ✅ Done | `seed-permissions.sql` |
| Role-based guards | ✅ Still work | No breaking changes |

**Next Steps**:
1. Run `seed-permissions.sql` to populate permissions
2. Assign permissions to roles via SQL
3. Test login - should receive permissions array
4. Frontend will automatically use permissions via `hasPermission()`
