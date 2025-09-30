import { CanMatchFn, Route, UrlSegment } from "@angular/router";

export const adminOnly: CanMatchFn = (route: Route, segment: UrlSegment[]) => {
  return true
}
