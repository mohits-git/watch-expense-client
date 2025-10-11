import { Injectable, signal } from '@angular/core';
import { AUTH_MESSAGES, TOKEN_STORAGE_KEY } from '../constants';
import { JWTClaims } from '../types';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private tokenKey = TOKEN_STORAGE_KEY;
  token = signal<string | null>(null);

  constructor() {
    const savedToken = localStorage.getItem(this.tokenKey);
    if (!this.isValidToken(savedToken)) {
      this.removeToken();
      return;
    }
    this.token.set(savedToken);
  }

  saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
    this.token.set(token);
  }

  removeToken() {
    localStorage.removeItem(this.tokenKey);
    this.token.set(null);
  }

  isValidToken(token?: string): boolean {
    try {
      if (!token) {
        return false;
      }
      const decoded = jwtDecode<JWTClaims>(token);
      return (
        !!decoded?.sub && (!decoded.exp || decoded.exp * 1000 > Date.now())
      );
    } catch {
      return false;
    }
  }

  parseToken(token: string): JWTClaims | null {
    try {
      const decoded: JWTClaims = jwtDecode<JWTClaims>(token);
      if (!decoded?.sub) {
        throw new Error(AUTH_MESSAGES.INVALID_TOKEN);
      }
      return decoded;
    } catch (error) {
      return null;
    }
  }
}
