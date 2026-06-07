const TOKEN_KEY = "ssk_token";
const TENANT_KEY = "ssk_tenant";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TENANT_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getTenant(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TENANT_KEY);
}

export function setTenant(tenant: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TENANT_KEY, tenant);
}
