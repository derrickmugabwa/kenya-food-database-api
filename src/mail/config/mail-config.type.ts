export type MailConfig = {
  provider: 'smtp' | 'inbound';
  port: number;
  host?: string;
  user?: string;
  password?: string;
  defaultEmail?: string;
  defaultName?: string;
  ignoreTLS: boolean;
  secure: boolean;
  requireTLS: boolean;
  inboundApiKey?: string;
};
