import React from 'react'

export default function Footer () {
    return (
        <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span>Shown in</span>
          <select className="border border-gray-300 rounded px-2 py-1">
            <option>(GMT+10:00) AEST, ...</option>
          </select>
          <select className="border border-gray-300 rounded px-2 py-1">
            <option>12h</option>
          </select>
        </div>
      </div>
  )
}
