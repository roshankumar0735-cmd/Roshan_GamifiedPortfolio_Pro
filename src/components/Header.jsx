import React from 'react'

export default function Header({ name, title }) {
  return (
    <header className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center">🚀</div>
        <div>
          <div className="text-lg font-bold">{name}</div>
          <div className="text-sm text-white/70">{title}</div>
        </div>
      </div>
    </header>
  )
}
