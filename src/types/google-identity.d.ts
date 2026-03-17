interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
}

interface GoogleTokenErrorResponse {
  type: string;
  message?: string;
}

interface GoogleTokenClientConfig {
  client_id: string;
  scope: string;
  callback: (response: GoogleTokenResponse) => void;
  error_callback?: (error: GoogleTokenErrorResponse) => void;
  prompt?: "" | "none" | "consent" | "select_account";
}

interface GoogleTokenClientRequestOptions {
  prompt?: "" | "none" | "consent" | "select_account";
}

interface GoogleTokenClient {
  requestAccessToken(overrideConfig?: GoogleTokenClientRequestOptions): void;
}

interface GoogleAccountsOauth2 {
  initTokenClient(config: GoogleTokenClientConfig): GoogleTokenClient;
  revoke(token: string, done?: () => void): void;
}

interface GoogleAccounts {
  oauth2: GoogleAccountsOauth2;
}

interface Window {
  google?: {
    accounts: GoogleAccounts;
  };
}
