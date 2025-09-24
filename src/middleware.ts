import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Fungsi untuk memeriksa apakah sebuah path memerlukan autentikasi
const isAuthPath = (path: string) => {
        // Daftar path yang memerlukan autentikasi
        const protectedPaths = ['/dashboard', '/profile']
        return protectedPaths.some(protectedPath => path.startsWith(protectedPath))
}

// Fungsi untuk memeriksa token (ini adalah contoh sederhana, verifikasi sebenarnya harus dilakukan oleh backend)
// Untuk skenario ini, kita hanya memeriksa keberadaan token di localStorage.
// Verifikasi token yang sebenarnya (misalnya, dengan memanggil endpoint /verify di backend)
// akan lebih aman jika dilakukan di sisi server, misalnya di dalam Server Component
// atau melalui API Route yang dipanggil oleh middleware jika memungkinkan.
// Namun, karena token JWT di sini diperoleh dari backend Golang eksternal,
// middleware Next.js tidak dapat langsung memverifikasinya tanpa berbagi rahasia atau memanggil backend.
// Pendekatan di bawah ini lebih ke arah pengecekan keberadaan token yang diasumsikan valid.
// Untuk verifikasi yang lebih robust, middleware bisa memanggil endpoint Golang untuk memvalidasi token.

export async function middleware(request: NextRequest) {
        const token = request.cookies.get('jwt_token')?.value || request.headers.get('Authorization')?.replace('Bearer ', '')

        // Jika mencoba mengakses halaman login/register dengan token yang valid, redirect ke dashboard
        if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register') && token) {
                // Idealnya, di sini ada verifikasi token ke backend Golang
                // Untuk sekarang, kita asumsikan jika ada token, maka sudah login
                return NextResponse.redirect(new URL('/dashboard', request.url))
        }

        // Jika mencoba mengakses rute terproteksi tanpa token, redirect ke login
        if (isAuthPath(request.nextUrl.pathname) && !token) {
                return NextResponse.redirect(new URL('/login', request.url))
        }

        // Untuk rute API yang memerlukan autentikasi, kita bisa menambahkan logika di sini
        // atau menanganinya di dalam handler API route itu sendiri.
        // Jika token ada di header Authorization, middleware bisa meneruskannya.
        // Jika token ada di cookie, dan API route perlu mengaksesnya, middleware bisa
        // menyalinnya ke header Authorization agar bisa dibaca oleh API route client-side
        // yang mungkin tidak membaca cookie secara langsung (tergantung pada CORS dan pengaturan cookie).
        if (request.nextUrl.pathname.startsWith('/api/') && token) {
                const requestHeaders = new Headers(request.headers)
                requestHeaders.set('Authorization', `Bearer ${token}`)
                return NextResponse.next({
                        request: {
                                headers: requestHeaders,
                        },
                })
        }


        return NextResponse.next()
}

// Konfigurasi matcher untuk menentukan middleware berjalan di path mana
export const config = {
        matcher: [
                /*
                 * Cocokkan semua path kecuali:
                 * 1. /api/auth/* (endpoint auth Golang kita, jika dipanggil langsung dari client untuk login/register, tidak perlu dicek middleware Next.js untuk token)
                 * 2. /_next/static (file statis Next.js)
                 * 3. /_next/image (file gambar Next.js)
                 * 4. /favicon.ico (favicon)
                 */
                '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
        ],
}