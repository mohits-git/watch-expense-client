import { UserRole } from "../enums";

export interface JWTClaims {
  sub: string;
  name: string;
  role: UserRole;
  email: string;
  iat: number;
  exp: number;
}
