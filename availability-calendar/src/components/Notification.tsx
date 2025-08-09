import React, {useState} from 'react'
import { X } from 'lucide-react';

export default function Notification () {
    const [showNotification, setShowNotification] = useState(true);
    
    return (
    showNotification && 
        (<div className="mt-4 bg-gray-100 p-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-gray-400 flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
                <span className="text-sm">
                    Click and drag to add your 'available' times in green. Click again to remove.
                </span>
            </div>
                <button onClick={() => setShowNotification(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                </button>
        </div>)
)}

