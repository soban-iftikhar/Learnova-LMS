import React from 'react'
import { Link } from 'react-router-dom'

const Logo = ({ size = 'md', linkTo = '/', textWhite = false }) => {
  const sizes = {
    sm: { text: 'text-lg' },
    md: { text: 'text-xl' },
    lg: { text: 'text-2xl' },
  }
  const s = sizes[size]
  const textColor = textWhite ? 'text-white' : 'text-ink'

  return (
    <Link to={linkTo} className="flex items-center gap-2.5 select-none">
      <span className={`${s.text} font-bold tracking-tight ${textColor}`}>
        Learn<span className="text-brand-500">ova</span>
      </span>
    </Link>
  )
}

export default Logo
