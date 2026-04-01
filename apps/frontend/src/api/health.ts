import axios from 'axios';
import type { HealthResponse } from '../types/health';

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await axios.get<HealthResponse>('/api/health');
  return response.data;
}
