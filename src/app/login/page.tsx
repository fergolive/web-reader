'use client'

import { useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { LogIn, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async () => {
        const provider = new GoogleAuthProvider()
        setIsLoading(true)

        try {
            const result = await signInWithPopup(auth, provider)
            const user = result.user

            // Verificar si el usuario ya existe en Firestore
            const userRef = doc(db, 'users', user.uid)
            const userSnap = await getDoc(userRef)

            if (!userSnap.exists()) {
                // Crear nuevo usuario en Firestore
                await setDoc(userRef, {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    createdAt: serverTimestamp(),
                    lastLogin: serverTimestamp(),
                    storage_usage: 0,
                    storage_limit: 209715200 // 200 MB
                })
                console.log('✅ Nuevo usuario registrado:', user.email)
            } else {
                // Actualizar última fecha de login y asegurar campos de storage
                const userData = userSnap.data()
                await setDoc(userRef, {
                    lastLogin: serverTimestamp(),
                    storage_usage: userData.storage_usage ?? 0,
                    storage_limit: userData.storage_limit ?? 209715200
                }, { merge: true })
                console.log('✅ Usuario existente, última sesión actualizada')
            }

            router.push('/dashboard')
        } catch (error) {
            console.error('Error signing in with Google:', error)
            setIsLoading(false)
        }
    }

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl dark:bg-gray-800">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Sign in to access your library
                    </p>
                </div>
                <div className="mt-8 space-y-6">
                    <button
                        onClick={handleLogin}
                        className="group relative flex w-full justify-center rounded-lg border border-transparent bg-indigo-600 py-3 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 ease-in-out transform hover:scale-[1.02]"
                    >
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <LogIn className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" aria-hidden="true" />
                        </span>
                        Sign in with Google
                    </button>
                </div>
            </div>
        </div>
    )
}
