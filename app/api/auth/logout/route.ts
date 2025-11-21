import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      message: 'Logout berhasil',
    })

    // Hapus cookie
    response.cookies.delete('token')

    return response
  } catch (error) {
    console.error('Error logging out:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat logout' },
      { status: 500 }
    )
  }
}
