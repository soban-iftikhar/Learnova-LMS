import React from 'react'
import { Link } from 'react-router-dom'

const Logo = ({ size = 'md', linkTo = '/' }) => {
  const sizes = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 34, text: 'text-xl' },
    lg: { icon: 44, text: 'text-2xl' },
  }
  const s = sizes[size]

  return (
    <Link to={linkTo} className="flex items-center gap-2.5 select-none">
      <svg width={s.icon} height={s.icon} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="12" fill="#1f9b6e"/>
        <path d="M12 34 L24 14 L36 34" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 27 L31 27" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
      </svg>
      <span className={`${s.text} font-bold tracking-tight text-ink`}>
        Learn<span className="text-brand-500">ova</span>
      </span>
    </Link>
  )
}

export default Logo
