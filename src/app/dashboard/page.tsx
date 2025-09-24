// app/dashboard/page.tsx
'use client' // Menggunakan client component karena menggunakan useEffect dan hooks

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface UserProfile {
        id: number
        name: string
        email: string
}

export default function DashboardPage() {
        const [user, setUser] = useState < UserProfile | null > (null)
        const [loading, setLoading] = useState(true)
        const [error, setError] = useState < string | null > (null)
        const router = useRouter()
        const API_URL = process.env.NEXT_PUBLIC_API_URL;

        useEffect(() => {
                const fetchUserProfile = async () => {
                        const token = localStorage.getItem('jwt_token')
                        if (!token) {
                                router.push('/login') // Redirect jika tidak ada token
                                return
                        }

                        try {
                                const response = await fetch(`${API_URL}/api/profile`, { // Ganti dengan URL backend Golang Anda
                                        method: 'GET',
                                        headers: {
                                                'Authorization': `Bearer ${token}`, // Kirim token di header Authorization
                                                'Content-Type': 'application/json',
                                        },
                                })

                                if (response.ok) {
                                        const userData = await response.json()
                                        setUser(userData.user) // Sesuaikan dengan respons dari backend Anda
                                } else {
                                        // Jika token tidak valid atau kadaluwarsa, backend Golang seharusnya merespons dengan status 401
                                        setError('Failed to fetch user profile or session expired.')
                                        localStorage.removeItem('jwt_token') // Hapus token yang tidak valid
                                        router.push('/login')
                                }
                        } catch (err) {
                                setError('An error occurred while fetching profile.')
                                console.error('Profile fetch error:', err)
                        } finally {
                                setLoading(false)
                        }
                }

                fetchUserProfile()
        }, [router])

        const handleLogout = () => {
                localStorage.removeItem('jwt_token')
                router.push('/login')
        }

        if (loading) {
                return <p>Loading...</p>
        }

        if (error) {
                return <p>Error: {error}</p>
        }

        return (
                <div className="min-h-screen bg-gray-100 p-8">
                        <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
                                <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
                                {user ? (
                                        <div>
                                                <h2 className="text-xl font-semibold">Welcome, {user.name}!</h2>
                                                <p>Email: {user.email}</p>
                                                <p>User ID: {user.id}</p>
                                                {/* Tambahkan konten dashboard lainnya di sini */}
                                                <button
                                                        onClick={handleLogout}
                                                        className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                                >
                                                        Logout
                                                </button>
                                        </div>
                                ) : (
                                        <p>No user data available.</p>
                                )}
                        </div>
                </div>
        )
}