'use client'

import { useEffect, useRef, useState } from 'react'
import { Heart, Github, Twitter, Linkedin, Mail, HeartCrack, PenTool, Settings, Settings2Icon, LucideSettings } from 'lucide-react'
import { checkHealth } from '@/lib/api'

export function Footer() {
    const currentYear = new Date().getFullYear()

    const socialLinks = [
        { icon: Github, href: 'https://github.com/dbacilio88', label: 'GitHub', color: 'hover:bg-gray-800 hover:text-white' },
       // { icon: Twitter, href: 'https://twitter.com', label: 'Twitter', color: 'hover:bg-blue-400 hover:text-white' },
        { icon: Linkedin, href: 'https://www.linkedin.com/in/bxcode/', label: 'LinkedIn', color: 'hover:bg-blue-600 hover:text-white' },
        { icon: Mail, href: 'mailto:bacsystem.sac@gmail.com', label: 'Email', color: 'hover:bg-purple-500 hover:text-white' },
    ]

    // Health status state
    const [healthy, setHealthy] = useState<boolean | null>(null)
    const [lastChecked, setLastChecked] = useState<number | null>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    // Polling refs
    const pollingRef = useRef<number | null>(null)
    const backoffRef = useRef<number>(0)

    useEffect(() => {
        let mounted = true

        const check = async () => {
            try {
                const res = await checkHealth()
                if (!mounted) return
                if (res.success && res.data?.healthy) {
                    setHealthy(true)
                    setErrorMsg(null)
                    backoffRef.current = 0
                } else {
                    setHealthy(false)
                    setErrorMsg(res.data?.status || 'Unhealthy')
                    backoffRef.current = Math.min(5, backoffRef.current + 1)
                }
                setLastChecked(Date.now())
            } catch (err: any) {
                if (!mounted) return
                setHealthy(false)
                setErrorMsg(err?.message || 'Network error')
                backoffRef.current = Math.min(5, backoffRef.current + 1)
                setLastChecked(Date.now())
            }

            // schedule next check: base 30s, exponential backoff multiplier on failures
            const base = 30000
            const next = base * (backoffRef.current > 0 ? backoffRef.current * 2 : 1)
            pollingRef.current = window.setTimeout(check, next)
        }

        // initial check
        check()

        return () => {
            mounted = false
            if (pollingRef.current) {
                clearTimeout(pollingRef.current)
            }
        }
    }, [])

    const title = healthy === null ? 'Comprobando estado...' : healthy ? `Online — última comprobación: ${lastChecked ? new Date(lastChecked).toLocaleTimeString() : '—'}` : `Offline — última comprobación: ${lastChecked ? new Date(lastChecked).toLocaleTimeString() : '—'}${errorMsg ? ` — ${errorMsg}` : ''}`

    return (
        <footer className="fixed bottom-0 left-0 right-0 h-[50px] border-t border-gray-200 bg-white z-40">
            <div className="container h-full flex items-center justify-between px-4">
                {/* Left side: Copyright and Made with */}
                <div className="flex items-center gap-4">
                    <p className="text-xs text-gray-600">
                        © {currentYear} <span className="font-semibold text-gray-900">Planillas</span>
                    </p>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                        Desarrollado por <LucideSettings className="h-3 w-3 text-red-500 fill-red-500" /> by{' '}
                        <span className="font-semibold text-gray-900">Bacsystem Solutions EIRL</span>
                    </p>
                </div>

                {/* Right side: Social links and Online status */}
                <div className="flex items-center gap-3">
                    {/* Social Links */}
                    <div className="flex gap-1.5">
                        {socialLinks.map((social) => {
                            const Icon = social.icon
                            return (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`h-7 w-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center transition-all duration-200 hover:shadow-md hover:scale-105 ${social.color}`}
                                    aria-label={social.label}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                </a>
                            )
                        })}
                    </div>

                    {/* Online Status */}
                    <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                            healthy === null
                                ? 'bg-gray-50 border-gray-200'
                                : healthy
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                        }`}
                        title={title}
                    >
                        <div
                            className={`h-1.5 w-1.5 rounded-full ${
                                healthy === null ? 'bg-gray-400 animate-pulse' : healthy ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                            }`}
                        ></div>
                        <span className={`text-xs font-medium ${healthy === null ? 'text-gray-700' : healthy ? 'text-green-700' : 'text-red-700'}`}>
                            {healthy === null ? 'Checking...' : healthy ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
