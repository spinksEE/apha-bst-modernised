export interface HealthResponse {
  status: 'ok' | 'error';
  database: 'connected' | 'disconnected' | 'unknown';
  uptime: number;
}
