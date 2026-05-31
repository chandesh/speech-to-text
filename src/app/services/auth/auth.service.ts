import { Injectable, signal, computed } from '@angular/core';

export interface User {
  id: string;
  email: string;
  full_name: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

const STORAGE_KEYS = {
  accessToken: 's2t_access_token',
  refreshToken: 's2t_refresh_token',
  user: 's2t_user',
};

const API_BASE = 'http://localhost:1212/api';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _currentUser = signal<User | null>(this.loadFromStorage());
  private _isLoading = signal<boolean>(false);

  currentUser = computed(() => this._currentUser());
  isAuthenticated = computed(() => !!this._currentUser());
  isLoading = computed(() => this._isLoading());

  private loadFromStorage(): User | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.user);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.accessToken);
  }

  getToken(): string | null {
    return this.getAccessToken();
  }

  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  private persistAuth(resp: AuthResponse): void {
    localStorage.setItem(STORAGE_KEYS.accessToken, resp.access_token);
    localStorage.setItem(STORAGE_KEYS.refreshToken, resp.refresh_token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(resp.user));
    this._currentUser.set(resp.user);
  }

  private clearAuth(): void {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    localStorage.removeItem(STORAGE_KEYS.user);
    this._currentUser.set(null);
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    this._isLoading.set(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Login failed');
      }
      const data: AuthResponse = await res.json();
      this.persistAuth(data);
      return data;
    } finally {
      this._isLoading.set(false);
    }
  }

  async register(userData: {
    email: string;
    password: string;
    full_name: string;
  }): Promise<AuthResponse> {
    this._isLoading.set(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Registration failed');
      }
      const data: AuthResponse = await res.json();
      this.persistAuth(data);
      return data;
    } finally {
      this._isLoading.set(false);
    }
  }

  async getProfile(): Promise<User> {
    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${API_BASE}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to fetch profile');
    }
    return await res.json();
  }

  async updateProfile(data: {
    full_name: string;
    email: string;
  }): Promise<User> {
    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update profile');
    }
    const user = await res.json();
    this._currentUser.set(user);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    return user;
  }

  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${API_BASE}/user/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to change password');
    }
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
    if (refreshToken) {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch {
        // Logout best-effort, clear locally regardless
      }
    }
    this.clearAuth();
  }
}
