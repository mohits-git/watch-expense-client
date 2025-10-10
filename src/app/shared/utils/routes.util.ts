export function getRouteSegments(route: string): string[] {
  return route.split('/');
}

export function joinRouteSegments(segments: string[]): string {
  return segments.join('/');
}
