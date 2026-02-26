import { NextRequest, NextResponse } from 'next/server';
import { createToken, getTokenCookieOptions } from '@/lib/auth';

const DEMO_USERS = [
  { id: 1, email: 'admin@lawara.co', password: 'admin123', name: 'Talip Furkan Doğan', role: 'admin' },
  { id: 2, email: 'demo@lawara.co', password: 'demo123', name: 'Demo Kullanıcı', role: 'user' },
];

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-posta ve şifre zorunludur' },
        { status: 400 }
      );
    }

    const user = DEMO_USERS.find(u => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json(
        { error: 'Geçersiz e-posta veya şifre' },
        { status: 401 }
      );
    }

    const token = await createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });

    const cookieOpts = getTokenCookieOptions(token);
    response.cookies.set(cookieOpts.name, cookieOpts.value, {
      httpOnly: cookieOpts.httpOnly,
      secure: cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      path: cookieOpts.path,
      maxAge: cookieOpts.maxAge,
    });

    return response;
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Giriş yapılamadı' }, { status: 500 });
  }
}
