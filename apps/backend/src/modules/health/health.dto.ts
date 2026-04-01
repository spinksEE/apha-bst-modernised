export class HealthResponseDto {
  status!: 'ok' | 'error';
  database!: 'connected' | 'disconnected';
  uptime!: number;
}
