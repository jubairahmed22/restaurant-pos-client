import { NextRequest, NextResponse } from 'next/server';

const BACKEND = (process.env.BACKEND_URL || 'http://localhost:51000').replace(/\/$/, '');

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathname  = path.join('/');
  const search    = req.nextUrl.search ?? '';
  const targetURL = `${BACKEND}/api/v1/${pathname}${search}`;

  const contentType = req.headers.get('content-type') || '';

  // Forward Authorization header if present
  const forwardHeaders: Record<string, string> = {};
  const auth = req.headers.get('authorization');
  if (auth) forwardHeaders['Authorization'] = auth;

  let body: BodyInit | undefined;

  if (['GET', 'HEAD'].includes(req.method)) {
    body = undefined;
  } else if (contentType.includes('multipart/form-data')) {
    // Must preserve binary data — forward raw bytes, keep Content-Type (with boundary)
    forwardHeaders['Content-Type'] = contentType;
    body = await req.arrayBuffer();
  } else {
    // JSON or other text-based bodies
    forwardHeaders['Content-Type'] = contentType || 'application/json';
    body = await req.text();
  }

  let res: Response;
  try {
    res = await fetch(targetURL, {
      method:  req.method,
      headers: forwardHeaders,
      body,
      redirect: 'manual',
    });
  } catch (err) {
    console.error('[proxy] fetch error:', err);
    return NextResponse.json({ success: false, error: 'Backend unreachable' }, { status: 502 });
  }

  const resContentType = res.headers.get('content-type') || '';
  const data = resContentType.includes('application/json')
    ? await res.json()
    : await res.text();

  return NextResponse.json(data, { status: res.status });
}

export const GET     = handler;
export const POST    = handler;
export const PUT     = handler;
export const PATCH   = handler;
export const DELETE  = handler;
export const OPTIONS = handler;
