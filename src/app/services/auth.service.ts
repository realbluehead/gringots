import { Injectable, computed, signal } from "@angular/core";
import { GOOGLE_AUTH_CLIENT_ID } from "../config/google-auth.config";

export interface AuthUser {
  email: string;
  name: string;
  picture?: string;
}

interface GoogleUserInfoResponse {
  email?: string;
  name?: string;
  picture?: string;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly USER_STORAGE_KEY = "gringots_google_auth_user";
  private readonly TOKEN_STORAGE_KEY = "gringots_google_auth_access_token";
  private readonly CLIENT_ID = GOOGLE_AUTH_CLIENT_ID;

  private readonly _user = signal<AuthUser | null>(this.loadUserFromStorage());

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);

  get isConfigured(): boolean {
    return (
      !!this.CLIENT_ID &&
      !this.CLIENT_ID.startsWith("REPLACE_WITH_GOOGLE_CLIENT_ID")
    );
  }

  async triggerGoogleLoginPrompt(): Promise<void> {
    if (!this.isConfigured) {
      throw new Error("Google Auth no configurat");
    }

    await this.loadGoogleScript();

    return new Promise((resolve, reject) => {
      const tokenClient = window.google?.accounts.oauth2.initTokenClient({
        client_id: this.CLIENT_ID,
        scope: "openid email profile",
        prompt: "select_account",
        callback: (response) => {
          void this.handleTokenResponse(response, resolve, reject);
        },
        error_callback: (error) => {
          reject(
            new Error(error.message || "No s'ha pogut obrir l'autenticacio"),
          );
        },
      });

      if (!tokenClient) {
        reject(new Error("Google OAuth no esta disponible"));
        return;
      }

      tokenClient.requestAccessToken({ prompt: "select_account" });
    });
  }

  signOut(): void {
    const accessToken = localStorage.getItem(this.TOKEN_STORAGE_KEY);

    if (accessToken) {
      window.google?.accounts.oauth2.revoke(accessToken, () => undefined);
    }

    localStorage.removeItem(this.USER_STORAGE_KEY);
    localStorage.removeItem(this.TOKEN_STORAGE_KEY);
    this._user.set(null);
  }

  private loadUserFromStorage(): AuthUser | null {
    const rawUser = localStorage.getItem(this.USER_STORAGE_KEY);

    if (!rawUser) {
      return null;
    }

    try {
      const parsed = JSON.parse(rawUser) as AuthUser;

      if (!parsed.email || !parsed.name) {
        localStorage.removeItem(this.USER_STORAGE_KEY);
        return null;
      }

      return parsed;
    } catch {
      localStorage.removeItem(this.USER_STORAGE_KEY);
      return null;
    }
  }

  private async handleTokenResponse(
    response: GoogleTokenResponse,
    resolve: () => void,
    reject: (reason?: unknown) => void,
  ): Promise<void> {
    if (response.error || !response.access_token) {
      reject(
        new Error(
          response.error_description || response.error || "Login cancel.lat",
        ),
      );
      return;
    }

    try {
      const user = await this.fetchUserInfo(response.access_token);
      localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(this.TOKEN_STORAGE_KEY, response.access_token);
      this._user.set(user);
      resolve();
    } catch (error) {
      reject(error);
    }
  }

  private async fetchUserInfo(accessToken: string): Promise<AuthUser> {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Google ha retornat un error obtenint el perfil");
    }

    const userInfo = (await response.json()) as GoogleUserInfoResponse;

    if (!userInfo.email || !userInfo.name) {
      throw new Error("Google no ha retornat les dades basiques del perfil");
    }

    return {
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
    };
  }

  private loadGoogleScript(): Promise<void> {
    if (window.google?.accounts?.oauth2) {
      return Promise.resolve();
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );

    if (existingScript) {
      if (window.google?.accounts?.oauth2) {
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        existingScript.addEventListener("load", () => resolve(), {
          once: true,
        });
        existingScript.addEventListener(
          "error",
          () => reject(new Error("No s'ha pogut carregar Google Identity")),
          { once: true },
        );
      });
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("No s'ha pogut carregar Google Identity"));
      document.head.appendChild(script);
    });
  }
}
