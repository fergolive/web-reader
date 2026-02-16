'use client'

import { useState, useEffect, useRef } from 'react'
import { ReactReader } from 'react-reader'
import { db } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'

interface EpubViewerProps {
    url: string
    initialLocation: string | null
    bookId: string
}

export default function EpubViewer({ url, initialLocation, bookId }: EpubViewerProps) {
    const [location, setLocation] = useState<string | number>(initialLocation || 0)
    const lastSavedLocation = useRef<string | number | null>(initialLocation)

    const locationChanged = (epubcifi: string | number) => {
        setLocation(epubcifi)
    }

    useEffect(() => {
        if (location === lastSavedLocation.current) return

        const timer = setTimeout(async () => {
            try {
                const bookRef = doc(db, 'books', bookId)
                await updateDoc(bookRef, {
                    current_location: location.toString()
                })

                lastSavedLocation.current = location
            } catch (err) {
                console.error('Failed to save EPUB progress', err)
            }
        }, 1000)

        return () => clearTimeout(timer)
    }, [location, bookId])

    return (
        <div className="h-full w-full relative">
            {/* ReactReader requires a container with height */}
            <ReactReader
                url={url}
                location={location}
                locationChanged={locationChanged}
                epubOptions={{
                    flow: 'paginated',
                    manager: 'default',
                }}
            />
        </div>
    )
}
