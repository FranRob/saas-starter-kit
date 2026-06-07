import { prisma } from "../../lib/prisma.js";

export async function findTenantBySlug(slug: string) {
  return prisma.tenant.findUnique({ where: { slug } });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      role: true,
      isActive: true,
      tenantId: true,
      twoFactorSecret: { select: { verified: true } },
    },
  });
}

export async function findActiveUser(tenantId: string, email: string) {
  return prisma.user.findFirst({
    where: { tenantId, email, isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      role: true,
      isActive: true,
      tenantId: true,
      twoFactorSecret: { select: { verified: true, secret: true } },
    },
  });
}

export async function createTenantAndOwner(data: {
  tenantName: string;
  slug: string;
  email: string;
  passwordHash: string;
  name: string;
}) {
  return prisma.tenant.create({
    data: {
      name: data.tenantName,
      slug: data.slug,
      users: {
        create: {
          email: data.email,
          passwordHash: data.passwordHash,
          name: data.name,
          role: "OWNER",
        },
      },
    },
    include: {
      users: { select: { id: true, email: true, name: true, role: true } },
    },
  });
}

export async function createRefreshToken(
  userId: string,
  tenantId: string,
  tokenHash: string,
  expiresAt: Date,
) {
  return prisma.refreshToken.create({ data: { userId, tenantId, tokenHash, expiresAt } });
}

// Bootstrap exception: tokenHash is @unique — used only to resolve tenantId
export async function findRefreshToken(tokenHash: string) {
  return prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: {
      user: { select: { id: true, tenantId: true, role: true, email: true, name: true } },
    },
  });
}

export async function deleteRefreshToken(tokenHash: string, tenantId: string) {
  return prisma.refreshToken.deleteMany({ where: { tokenHash, tenantId } });
}

export async function deleteAllUserRefreshTokens(userId: string, tenantId: string) {
  return prisma.refreshToken.deleteMany({ where: { userId, tenantId } });
}

export async function createPasswordReset(
  userId: string,
  tokenHash: string,
  expiresAt: Date,
) {
  // Invalidate any existing tokens for this user
  await prisma.passwordReset.updateMany({
    where: { userId, used: false },
    data: { used: true },
  });
  return prisma.passwordReset.create({ data: { userId, tokenHash, expiresAt } });
}

// Bootstrap exception: tokenHash is @unique
export async function findPasswordReset(tokenHash: string) {
  return prisma.passwordReset.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, email: true, tenantId: true } } },
  });
}

export async function markPasswordResetUsed(id: string) {
  return prisma.passwordReset.update({ where: { id }, data: { used: true } });
}

export async function updateUserPassword(userId: string, passwordHash: string) {
  return prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

export async function find2FASecret(userId: string) {
  return prisma.twoFactorSecret.findUnique({ where: { userId } });
}

export async function upsert2FASecret(userId: string, secret: string) {
  return prisma.twoFactorSecret.upsert({
    where: { userId },
    create: { userId, secret, verified: false },
    update: { secret, verified: false },
  });
}

export async function verify2FASecret(userId: string) {
  return prisma.twoFactorSecret.update({
    where: { userId },
    data: { verified: true },
  });
}

export async function delete2FASecret(userId: string) {
  return prisma.twoFactorSecret.deleteMany({ where: { userId } });
}
