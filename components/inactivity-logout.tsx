'use client'

import { useEffect, useRef, useState } from 'react'
import { signOut } from 'next-auth/react'

const INACTIVITY_LIMIT_MS = 5 * 60 * 1000 // 5 minutes

export function InactivityLogout() {
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const [timeLeft, setTimeLeft] = useState(INACTIVITY_LIMIT_MS)

    useEffect(() => {
        // Function to reset the timer
        const resetTimer = () => {
            // Optional: Log reset for debugging
            // console.log('Activity detected, resetting timer')
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }

            timerRef.current = setTimeout(() => {
                console.log('Inactivity limit reached, logging out...')
                signOut({ callbackUrl: '/login' })
            }, INACTIVITY_LIMIT_MS)
        }

        // Initial set
        resetTimer()

        // Event listeners for user activity
        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']

        events.forEach(event => {
            window.addEventListener(event, resetTimer)
        })

        // Cleanup
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
            events.forEach(event => {
                window.removeEventListener(event, resetTimer)
            })
        }
    }, [])

    return null // This component doesn't render anything
}
