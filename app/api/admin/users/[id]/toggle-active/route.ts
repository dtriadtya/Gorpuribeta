import { NextResponse } from 'next/server'

// Endpoint removed: toggle-active for users is no longer supported.
export async function PATCH() {
  return NextResponse.json({ error: 'Endpoint removed' }, { status: 410 })
}

