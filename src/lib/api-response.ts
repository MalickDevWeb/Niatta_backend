export type ApiMeta = Record<string, unknown>;

export function successResponse<T>(data: T, message = 'Operation successful', meta: ApiMeta = {}) {
  return Response.json({ success: true, message, data, meta });
}

export function errorResponse(message: string, status: number, errors: Record<string, unknown> = {}) {
  return Response.json({ success: false, message, errors }, { status });
}
