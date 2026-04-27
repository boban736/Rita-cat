export const SESSION_COOKIE = "ritka_session";

export function checkPassword(password: string): boolean {
  return password === process.env.APP_PASSWORD;
}

export function checkBearer(authHeader: string | null): boolean {
  if (!authHeader?.startsWith("Bearer ")) return false;
  return checkPassword(authHeader.slice(7));
}
