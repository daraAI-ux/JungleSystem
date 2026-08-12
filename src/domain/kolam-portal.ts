export function isKolamPortalRoute(route: string): boolean {
  const path = route.trim().split('?')[0]?.replace(/\/+$/, '') || '/';
  return path === '/portal';
}
