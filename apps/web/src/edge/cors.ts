import { NextRequest } from 'next/server'

const allowedOrigins: string[] = []

export function getCorsHeaders(req: NextRequest) {
  const origin = req.headers.get('origin') || ''

  if (allowedOrigins.includes(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    } as Record<string, string>
  }

  return {} as Record<string, string>
}

export function handleCors(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) })
  }

  return null
}
