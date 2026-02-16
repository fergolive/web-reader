'use client'

import { formatBytes } from '@/lib/utils'

interface StorageMeterProps {
    usage: number
    limit: number
}

export default function StorageMeter({ usage, limit }: StorageMeterProps) {
    const percentage = Math.min((usage / limit) * 100, 100)
    const isNearLimit = percentage > 80
    const isOverLimit = percentage >= 100

    return (
        <div className="w-full max-w-xs space-y-1">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Storage</span>
                <span>{formatBytes(usage)} / {formatBytes(limit)}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                    className={`h-full transition-all duration-300 ${isOverLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-indigo-500'
                        }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}
