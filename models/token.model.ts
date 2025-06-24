export interface MsalConfig {
  auth: {
    clientId: string;
    authority: string;
    clientSecret: string;
  };
}

export interface MsalCcaTokenRequest {
  scopes: string[];
}
