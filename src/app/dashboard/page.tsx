'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import Navbar from '@/components/Navbar'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

export default function Dashboard() {
    const [books, setBooks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const q = query(collection(db, 'books'), orderBy('created_at', 'desc'))
        const unsubscribe = onSnapshot(q, (snapshot) => {
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

        return () => unsubscribe()
    }, [])

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Library</h1>
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
