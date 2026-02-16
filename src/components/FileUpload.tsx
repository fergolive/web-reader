'use client'

import { useState } from 'react'
import { auth, db, storage } from '@/lib/firebase'
import { ref, uploadBytesResumable } from 'firebase/storage'
import { collection, addDoc } from 'firebase/firestore'
import { Upload, X, FileText, Book, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function FileUpload() {
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.type !== 'application/pdf' && file.type !== 'application/epub+zip') {
            setError('Please upload a PDF or EPUB file.')
            return
        }

        setIsUploading(true)
        setUploadProgress(0)
        setError(null)

        try {
            const user = auth.currentUser
            const userId = user ? user.uid : 'public-uploads'

            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
            const filePath = `books/${userId}/${fileName}`

            // Upload file to Firebase Storage with progress tracking
            const storageRef = ref(storage, filePath)
            const uploadTask = uploadBytesResumable(storageRef, file)

            // Wait for upload to complete and track progress
            await new Promise<void>((resolve, reject) => {
                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                        setUploadProgress(Math.round(progress))
                    },
                    (error) => {
                        reject(error)
                    },
                    () => {
                        resolve()
                    }
                )
            })

            // Insert metadata to Firestore
            await addDoc(collection(db, 'books'), {
                user_id: user ? user.uid : null,
                title: file.name.replace(/\.[^/.]+$/, ""),
                file_url: filePath,
                file_type: file.type === 'application/pdf' ? 'pdf' : 'epub',
                created_at: new Date().toISOString(),
                current_location: null,
                total_pages: null
            })

            setIsOpen(false)
            setUploadProgress(0)
            router.refresh()
        } catch (err: any) {
            console.error('Upload error:', err)
            setError(err.message)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
                <Upload className="-ml-1 mr-2 h-5 w-5" />
                Upload Book
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsOpen(false)} />

                        <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
                            <div className="absolute top-0 right-0 pt-4 pr-4">
                                <button
                                    type="button"
                                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="sm:flex sm:items-start">
                                <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">Upload Book</h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Select a PDF or EPUB file to upload to your library.
                                        </p>
                                        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

                                        <div className="mt-4 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                                            <div className="space-y-1 text-center">
                                                <div className="flex justify-center text-gray-400">
                                                    <FileText className="h-8 w-8 mr-2" />
                                                    <Book className="h-8 w-8" />
                                                </div>
                                                <div className="flex text-sm text-gray-600 justify-center">
                                                    <label
                                                        htmlFor="file-upload"
                                                        className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                                                    >
                                                        <span>Upload a file</span>
                                                        <input
                                                            id="file-upload"
                                                            name="file-upload"
                                                            type="file"
                                                            accept=".pdf,.epub"
                                                            className="sr-only"
                                                            onChange={handleFileChange}
                                                            disabled={isUploading}
                                                        />
                                                    </label>
                                                </div>
                                                <p className="text-xs text-gray-500">PDF or EPUB up to 50MB</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {isUploading && (
                                <div className="mt-4 space-y-3">
                                    <div className="flex items-center justify-center space-x-2">
                                        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                                        <p className="text-sm font-medium text-indigo-600">
                                            Uploading... {uploadProgress}%
                                        </p>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                        <div
                                            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
