import { NextRequest, NextResponse } from 'next/server';

const BACKEND = (process.env.BACKEND_URL || 'http://localhost:51000').replace(/\/$/, '');

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathname  = path.join('/');
  const search    = req.nextUrl.search ?? '';
  const targetURL = `${BACKEND}/api/v1/${pathname}${search}`;

  // Forward only safe headers — deliberately omit Origin so backend CORS never fires
  const forwardHeaders: Record<string, string> = {
    'Content-Type': req.headers.get('content-type') || 'application/json',
  };
  const auth = req.headers.get('authorization');
  if (auth) forwardHeaders['Authorization'] = auth;

  const body = ['GET', 'HEAD'].includes(req.method) ? undefined : await req.text();

  let res: Response;
  try {
    res = await fetch(targetURL, {
      method:  req.method,
      headers: forwardHeaders,
      body,
      // No redirect follow — pass through as-is
      redirect: 'manual',
    });
  } catch (err) {
    console.error('[proxy] fetch error:', err);
    return NextResponse.json({ success: false, error: 'Backend unreachable' }, { status: 502 });
  }

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
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
