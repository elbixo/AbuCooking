// Modo privado ("family & friends"): toda la web exige sesión y registrarse requiere invitación.
// Se controla con variables de entorno, sin tocar código:
//   PRIVATE_MODE=true      -> hay que iniciar sesión para ver cualquier página
//   INVITE_CODE=PAELLA2026 -> código necesario para crear cuenta (si no se define, registro libre)

export function isPrivateMode(): boolean {
  return process.env.PRIVATE_MODE === "true";
}

export function inviteCode(): string | null {
  return process.env.INVITE_CODE?.trim() || null;
}

export function isValidInvite(code: unknown): boolean {
  const expected = inviteCode();
  if (!expected) return true;
  return typeof code === "string" && code.trim().toLowerCase() === expected.toLowerCase();
}

// Páginas accesibles sin sesión aunque la web sea privada
const PUBLIC_PATHS = ["/login", "/registro", "/recuperar", "/auth/", "/robots.txt"];

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => (p.endsWith("/") ? pathname.startsWith(p) : pathname === p));
}
