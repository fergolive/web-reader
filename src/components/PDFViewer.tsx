'use client'

import { useState, useEffect, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { db } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import 'react-pdf/dist/Page/TextLayer.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'

// Set worker source
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
}

interface PDFViewerProps {
    url: string
    initialPage: number
    bookId: string
}

export default function PDFViewer({ url, initialPage, bookId }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number>(0)
    const [pageNumber, setPageNumber] = useState<number>(initialPage)
    const [scale, setScale] = useState(1.0)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isUpdating, setIsUpdating] = useState(false)

    // save progress debounced or on page change
    useEffect(() => {
        const saveProgress = async () => {
            if (isUpdating) return

            setIsUpdating(true)
            try {
                const bookRef = doc(db, 'books', bookId)
                await updateDoc(bookRef, {
                    current_location: pageNumber.toString(),
                    ...(numPages > 0 ? { total_pages: numPages } : {})
                })
            } catch (err) {
                console.error("Failed to save progress", err)
            } finally {
                setIsUpdating(false)
            }
        }

        const timeout = setTimeout(saveProgress, 1000)
        return () => clearTimeout(timeout)
    }, [pageNumber, numPages, bookId])


    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages)
        // If initially we are out of bounds, reset
        if (pageNumber > numPages) setPageNumber(numPages)
    }

    const changePage = (offset: number) => {
        setPageNumber(prevPageNumber => {
            const newPage = prevPageNumber + offset
            if (newPage >= 1 && newPage <= numPages) {
                return newPage;
            }
            return prevPageNumber;
        })
    }

    // Handle Resize
    // Simple responsive scaling can be done via CSS or ResizeObserver. 
    // For simplicity, we keep scale 1 or allow user to zoom.
    // We'll let CSS handle "width-full" and Page width prop.

    const [containerWidth, setContainerWidth] = useState<number>(0);

    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerWidth(entry.contentRect.width);
            }
        })
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, [])

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b bg-white p-2 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => changePage(-1)}
                        disabled={pageNumber <= 1}
                        className="rounded p-1 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700 dark:text-white"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-sm dark:text-gray-300">
                        Page {pageNumber} of {numPages}
                    </span>
                    <button
                        onClick={() => changePage(1)}
                        disabled={pageNumber >= numPages}
                        className="rounded p-1 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700 dark:text-white"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="rounded px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white">-</button>
                    <span className="text-sm dark:text-gray-300">{Math.round(scale * 100)}%</span>
                    <button onClick={() => setScale(s => Math.min(2.5, s + 0.1))} className="rounded px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white">+</button>
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-gray-100 p-4 dark:bg-gray-900" ref={containerRef}>
                <div className="flex justify-center">
                    <Document
                        file={url}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={
                            <div className="flex items-center justify-center p-10">
                                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                            </div>
                        }
                        error={
                            <div className="p-10 text-red-500">Failed to load PDF.</div>
                        }
                    >
                        <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            width={containerWidth ? Math.min(containerWidth - 40, 800) : undefined}
                            className="shadow-lg"
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                        />
                    </Document>
                </div>
            </div>
        </div>
    )
}
