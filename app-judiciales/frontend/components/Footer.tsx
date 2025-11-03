'use client'

import { Heart, Github, Twitter, Linkedin, Mail } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { icon: Github, href: 'https://github.com', label: 'GitHub', color: 'hover:bg-gray-800 hover:text-white' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter', color: 'hover:bg-blue-400 hover:text-white' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn', color: 'hover:bg-blue-600 hover:text-white' },
    { icon: Mail, href: 'mailto:contact@personhub.com', label: 'Email', color: 'hover:bg-purple-500 hover:text-white' },
  ]

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-[40px] border-t border-gray-200 bg-white z-40">
      <div className="container h-full flex items-center justify-between px-4">
        {/* Left side: Copyright and Made with */}
        <div className="flex items-center gap-4">
          <p className="text-xs text-gray-600">
            © {currentYear} <span className="font-semibold text-gray-900">PersonHub</span>
          </p>
          <p className="text-xs text-gray-600 flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> by{' '}
            <span className="font-semibold text-gray-900">BAC System</span>
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
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-full">
            <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-green-700">Online</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
