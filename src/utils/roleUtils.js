/**
 * Normalizes user roles into a clean array of role strings.
 * Handles strings, arrays, or objects returned by backend APIs.
 */
export const getUserRoles = (user) => {
  if (!user) return [];
  if (Array.isArray(user.roles)) return user.roles;
  if (user.roles && typeof user.roles === 'object') return Object.values(user.roles);
  if (user.role) return [user.role];
  return [];
};

/**
 * Checks if a user possesses a specific role string.
 */
export const hasRole = (user, roleName) => {
  const roles = getUserRoles(user);
  return roles.includes(roleName);
};

/**
 * Determines the primary dashboard route for a given user.
 * - Doctor -> '/doctor'
 * - Receptionist, Tenant Admin, Clinic Owner -> '/dashboard'
 */
export const getRoleDefaultRoute = (user) => {
  if (!user) return '/login';
  const roles = getUserRoles(user);
  
  if (roles.includes('doctor')) {
    return '/doctor';
  }
  return '/dashboard';
};
