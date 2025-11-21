import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/validateSession'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const sessionCheck = await validateSession(token)

    if (!sessionCheck.valid || !sessionCheck.user) {
      return NextResponse.json(
        { error: 'Session tidak valid' },
        { status: 401 }
      )
    }

    // Map to frontend-friendly format for backward compatibility
    const mappedUser = {
      id: sessionCheck.user.id_user,
      id_user: sessionCheck.user.id_user,
      name: sessionCheck.user.nama_user,
      nama_user: sessionCheck.user.nama_user,
      email: sessionCheck.user.email_user,
      email_user: sessionCheck.user.email_user,
      phone: sessionCheck.user.phone_user,
      phone_user: sessionCheck.user.phone_user,
      role: sessionCheck.user.role,
      isActive: sessionCheck.user.isActive
    }

    return NextResponse.json({
      user: mappedUser
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
