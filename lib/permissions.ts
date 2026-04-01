import { prisma } from '@/lib/prisma';

// Check if user has permission
export async function checkPermission(
  userId: string,
  resource: string,
  action: string
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.role) return false;

    return user.role.rolePermissions.some(
      (rp: { permission: { resource: string; action: string } }) =>
        rp.permission.resource === resource && rp.permission.action === action
    );
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
}

// Check if user has any of the permissions
export async function checkAnyPermission(
  userId: string,
  permissions: Array<{ resource: string; action: string }>
): Promise<boolean> {
  try {
    const results = await Promise.all(
      permissions.map((p) => checkPermission(userId, p.resource, p.action))
    );
    return results.some((result) => result);
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
}

// Check if user has all permissions
export async function checkAllPermissions(
  userId: string,
  permissions: Array<{ resource: string; action: string }>
): Promise<boolean> {
  try {
    const results = await Promise.all(
      permissions.map((p) => checkPermission(userId, p.resource, p.action))
    );
    return results.every((result) => result);
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
}

// Get user permissions
export async function getUserPermissions(userId: string): Promise<Set<string>> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.role) return new Set();

    return new Set(
      user.role.rolePermissions.map(
        (rp: { permission: { resource: string; action: string } }) => `${rp.permission.resource}:${rp.permission.action}`
      )
    );
  } catch (error) {
    console.error('Get permissions failed:', error);
    return new Set();
  }
}
