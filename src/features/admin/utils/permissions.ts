export const ADMIN_ROLES = ['super_admin', 'admin', 'publicador'] as const
export type AdminRol = typeof ADMIN_ROLES[number]

export function isAdminRol(rol: string | null | undefined): rol is AdminRol {
  return ADMIN_ROLES.includes(rol as AdminRol)
}

export type Permission =
  | 'view_dashboard'
  | 'view_products'
  | 'create_products'
  | 'edit_products'
  | 'delete_products'
  | 'view_orders'
  | 'update_order_status'
  | 'delete_orders'
  | 'view_users'
  | 'manage_users'
  | 'manage_cupones'

const PERMISSION_MATRIX: Record<string, Permission[]> = {
  super_admin: [
    'view_dashboard',
    'view_products',
    'create_products',
    'edit_products',
    'delete_products',
    'view_orders',
    'update_order_status',
    'delete_orders',
    'view_users',
    'manage_users',
    'manage_cupones',
  ],
  admin: [
    'view_dashboard',
    'view_products',
    'create_products',
    'edit_products',
    'delete_products',
    'view_orders',
    'update_order_status',
    'delete_orders',
    'manage_cupones',
  ],
  publicador: [
    'view_dashboard',
    'view_products',
    'create_products',
    'edit_products',
    'view_orders',
  ],
}

export function can(rol: string | null | undefined, permission: Permission): boolean {
  return PERMISSION_MATRIX[rol ?? '']?.includes(permission) ?? false
}
