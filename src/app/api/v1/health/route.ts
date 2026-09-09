import { successResponse } from '@/lib/api-response';

export function GET() {
  return successResponse({ service: 'backend-nextjs', status: 'ok' }, 'Service healthy');
}
