# Permission System - Quick Reference

## 🎯 What Changed

### Backend Response Format

#### ✅ NEW: Login/Signup Response
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
        { "name": "VIEW_USERS" },
        { "name": "CREATE_USER" },
        { "name": "DELETE_USER" }
      ]
    }
  },
  "access_token": "jwt-token"
}
```

#### ❌ OLD: Login/Signup Response
```json
{
  "user": {
    "role": "ADMIN"  // Just a string
  }
}
```

---

## 🚀 Setup Steps

### 1. Database Setup (Required)
```bash
# Connect to PostgreSQL
psql -U postgres -d your_database

# Run the setup script
\i setup-permissions.sql
```

Or manually:
1. Run Step 1 (insert permissions)
2. Run Step 2 (get role IDs)
3. Edit Step 3 with your role IDs
4. Run Step 3 (assign permissions)

### 2. Test Backend
```bash
# Restart backend
npm run start:dev

# Test login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password"}'

# Should see permissions in response
```

### 3. Frontend (Already Done ✅)
Your frontend already has:
- `permissions.ts` with helper functions
- Updated User type
- Components using `hasPermission()`

No frontend changes needed!

---

## 📋 Permission List

| Permission | Admin | Manager | Employee |
|-----------|-------|---------|----------|
| `VIEW_USERS` | ✅ | ✅ | ❌ |
| `CREATE_USER` | ✅ | ✅ | ❌ |
| `UPDATE_USER` | ✅ | ❌ | ❌ |
| `DELETE_USER` | ✅ | ❌ | ❌ |
| `TOGGLE_USER_ACTIVE` | ✅ | ❌ | ❌ |
| `VIEW_ROLES` | ✅ | ✅ | ❌ |
| `CREATE_ROLE` | ✅ | ❌ | ❌ |
| `UPDATE_ROLE` | ✅ | ❌ | ❌ |
| `DELETE_ROLE` | ✅ | ❌ | ❌ |
| `VIEW_OWN_PROFILE` | ✅ | ✅ | ✅ |

---

## 🔧 Modified Files

### Backend Changes
- ✅ `src/auth/auth.service.ts` - Include permissions in login/signup
- ✅ `src/auth/jwt.strategy.ts` - Add permissions to JWT payload
- ✅ `src/users/users.service.ts` - Load permissions in all queries
- ✅ `src/common/decorators/permissions.decorator.ts` - NEW file
- ✅ `src/common/guards/permissions.guard.ts` - NEW file

### Database Setup
- ✅ `setup-permissions.sql` - Complete setup script
- ✅ `seed-permissions.sql` - Permission definitions

### Documentation
- ✅ `PERMISSION_SYSTEM_BACKEND.md` - Full documentation
- ✅ `QUICK_REFERENCE.md` - This file

---

## ✅ Checklist

- [ ] Run `setup-permissions.sql` in database
- [ ] Verify permissions created: `SELECT * FROM permissions;`
- [ ] Verify role assignments: `SELECT * FROM role_permissions;`
- [ ] Restart backend: `npm run start:dev`
- [ ] Test login - check response includes permissions
- [ ] Test GET /users/me - check includes permissions
- [ ] Frontend automatically works with new format

---

## 🆘 Troubleshooting

### Problem: Login response doesn't include permissions
**Solution**: Check database - run verification queries in `setup-permissions.sql`

### Problem: Frontend shows "undefined permissions"
**Solution**: Clear localStorage and login again to get new token format

### Problem: Old tokens don't work
**Solution**: Tokens without permissions still work, but frontend won't show permission-based UI. Users need to re-login.

---

## 📞 Support

See full documentation in:
- `PERMISSION_SYSTEM_BACKEND.md` - Complete backend guide
- `setup-permissions.sql` - Database setup with verification queries
