'use client'

import { useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import Navbar from '@/components/Navbar'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'
import StorageMeter from '@/components/StorageMeter'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
    const [books, setBooks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [userData, setUserData] = useState<any>(null)
    const router = useRouter()

    useEffect(() => {
        // Escuchar cambios en la autenticación
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                router.push('/login')
                return
            }
            setUser(currentUser)
        })

        return () => unsubscribeAuth()
    }, [router])

    useEffect(() => {
        if (!user) return

        // Escuchar cambios en el documento del usuario (para storage usage)
        const userUnsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
            setUserData(doc.data())
        })

        // Obtener libros de la subcolección del usuario
        const q = query(
            collection(db, 'users', user.uid, 'books'),
            orderBy('created_at', 'desc')
        )

        const booksUnsubscribe = onSnapshot(q, (snapshot) => {
            const booksData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setBooks(booksData)
            setLoading(false)
        }, (error) => {
            console.error('Error fetching books:', error)
            setLoading(false)
        })

        return () => {
            userUnsubscribe()
            booksUnsubscribe()
        }
    }, [user])

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Library</h1>
                        {userData && (
                            <div className="mt-2">
                                <StorageMeter
                                    usage={userData.storage_usage || 0}
                                    limit={userData.storage_limit || 209715200}
                                />
                            </div>
                        )}
                    </div>
                    <FileUpload />
                </div>

                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                    </div>
                ) : books.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {books.map((book) => (
                            <FileCard key={book.id} book={book} />
                        ))}
                    </div>
                ) : (
                    <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No books yet</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Get started by uploading a new book.
                        </p>
                    </div>
                )}
            </main>
        </div>
    )
}
