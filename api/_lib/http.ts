export type ApiRequest = {
  method?: string;
  url?: string;
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
};

export type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
};

export function methodNotAllowed(res: ApiResponse) {
  res.status(405).json({ success: false, message: 'Method not allowed' });
}

export function bodyRecord(req: ApiRequest): Record<string, unknown> {
  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
    return req.body as Record<string, unknown>;
  }
  return {};
}

export function queryString(
  query: Record<string, string | string[] | undefined> | undefined,
  key: string,
): string {
  const value = query?.[key];
  if (Array.isArray(value)) return String(value[0] ?? '').trim();
  return String(value ?? '').trim();
}
