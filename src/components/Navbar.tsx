'use client'

import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import { LogOut, BookOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Navbar() {
    const router = useRouter()

    const handleLogout = async () => {
        await signOut(auth)
        router.push('/login')
        router.refresh()
    }

    return (
        <nav className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                    <div className="flex">
                        <div className="flex flex-shrink-0 items-center">
                            <BookOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">WebReader</span>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <button
                            onClick={handleLogout}
                            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                            title="Logout / Reset"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}
