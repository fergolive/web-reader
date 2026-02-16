'use client'

import { useEffect, useState, use } from 'react'
import { db, storage } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { ref, getDownloadURL } from 'firebase/storage'
import { redirect, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import PDFViewer from '@/components/PDFViewer'
import EpubViewer from '@/components/EpubViewer'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ReadPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [book, setBook] = useState<any>(null)
    const [url, setUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        async function loadBook() {
            try {
                const docRef = doc(db, 'books', id)
                const docSnap = await getDoc(docRef)

                if (!docSnap.exists()) {
                    router.push('/dashboard')
                    return
                }

                const bookData = docSnap.data()
                setBook(bookData)

                // Get download URL from storage path
                const storageRef = ref(storage, bookData.file_url)
                const downloadUrl = await getDownloadURL(storageRef)
                setUrl(downloadUrl)
            } catch (error) {
                console.error('Error loading book:', error)
            } finally {
                setLoading(false)
            }
        }

        loadBook()
    }, [id, router])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
        )
    }

    if (!book || !url) {
        return <div className="p-8 text-center">Error loading file</div>
    }

    return (
        <div className="flex h-screen flex-col bg-gray-100 dark:bg-gray-900">
            <header className="flex h-16 items-center border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                <Link href="/dashboard" className="mr-4 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </Link>
                <h1 className="truncate text-lg font-medium text-gray-900 dark:text-white">{book.title}</h1>
            </header>

            <main className="flex-1 overflow-hidden">
                {book.file_type === 'pdf' ? (
                    <PDFViewer url={url} initialPage={parseInt(book.current_location || '1')} bookId={id} />
                ) : (
                    <EpubViewer url={url} initialLocation={book.current_location} bookId={id} />
                )}
            </main>
        </div>
    )
}
