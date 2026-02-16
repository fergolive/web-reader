'use client'

import { FileText, Book, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { db, storage } from '@/lib/firebase'
import { ref, deleteObject, getMetadata } from 'firebase/storage'
import { doc, deleteDoc, updateDoc, increment } from 'firebase/firestore'
import { useRouter } from 'next/navigation'

interface BookProps {
    id: string
    user_id: string
    title: string
    file_url: string
    file_type: 'pdf' | 'epub'
    current_location: string | null
    total_pages: number | null
    created_at: string
}

export default function FileCard({ book }: { book: BookProps }) {
    const router = useRouter()

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!confirm('Are you sure you want to delete this book?')) return

        try {
            const storageRef = ref(storage, book.file_url)

            // 1. Get file size for storage usage update
            let fileSize = 0
            try {
                const metadata = await getMetadata(storageRef)
                fileSize = metadata.size
            } catch (err) {
                console.warn('Could not get file metadata:', err)
            }

            // 2. Delete from Firebase Storage
            await deleteObject(storageRef).catch(err => {
                console.warn('Storage delete fail (maybe file not found):', err)
            })

            // 3. Delete from Firestore (user's subcollection)
            await deleteDoc(doc(db, 'users', book.user_id, 'books', book.id))

            // 4. Decrement storage usage
            if (fileSize > 0) {
                const userRef = doc(db, 'users', book.user_id)
                await updateDoc(userRef, {
                    storage_usage: increment(-fileSize)
                })
            }

            router.refresh()
        } catch (error) {
            console.error('Error deleting book:', error)
            alert('Error deleting book')
        }
    }

    const getProgress = () => {
        if (!book.current_location || !book.total_pages) return 'Not started'
        if (book.file_type === 'pdf') {
            const page = parseInt(book.current_location)
            const total = book.total_pages
            if (isNaN(page)) return 'Not started'
            const percent = Math.round((page / total) * 100)
            return `${percent}% (${page}/${total})`
        }
        // EPUB progress is harder with CFI, usually we just show percentage if we stored it,
        // or just "Last read: ..."
        // For now returning "In progress" or pure location if standard.
        return 'In progress'
    }

    return (
        <Link href={`/read/${book.id}`} className="group block h-full">
            <div className="relative flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                <div className="flex flex-1 flex-col p-4">
                    <div className="mb-4 flex items-center justify-center rounded-full bg-indigo-50 p-3 dark:bg-indigo-900/20">
                        {book.file_type === 'pdf' ? (
                            <FileText className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                            <Book className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        )}
                    </div>
                    <h3 className="mb-1 truncate text-lg font-medium text-gray-900 dark:text-white" title={book.title}>
                        {book.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400" suppressHydrationWarning>
                        {new Date(book.created_at).toLocaleDateString()}
                    </p>
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>{book.file_type.toUpperCase()}</span>
                            <span>{getProgress()}</span>
                        </div>
                        {/* Progress bar could go here */}
                        <div className="mt-1 h-1 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                                className="h-1 rounded-full bg-indigo-600 dark:bg-indigo-400"
                                style={{ width: book.file_type === 'pdf' && book.current_location && book.total_pages ? `${(parseInt(book.current_location) / book.total_pages) * 100}%` : '0%' }}
                            />
                        </div>
                    </div>
                </div>
                <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                        onClick={handleDelete}
                        className="rounded-full bg-gray-100 p-1.5 text-gray-600 hover:bg-red-100 hover:text-red-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                        title="Delete"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </Link>
    )
}
