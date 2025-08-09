"use client"

import { Button } from "./ui/button"
import { saveAvailability } from "../../../src/backend/functions";
import { Copy } from "lucide-react"

type HeaderProps = {
    eventId: string | undefined;
    days: { short: string; date: string }[];
    calendarData: Map<String, Number[]>;
}
// Massive paratmeters heading into this :3
export default function Header ({eventId, days, calendarData}: HeaderProps) {

    const handleSave = () => {
        if (!eventId) {
            eventId = "default-event-id" // Fallback if no eventId is provided  
        }

        var discordTag = localStorage.getItem("discordUserName") || "No tag provided";
        saveAvailability(eventId, discordTag, calendarData)

        alert("My good boi :). Check the console to confirm :wink")
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    alert("Link copied to clipboard!")
  }

  return (
    <div className="flex justify-between items-start mb-6">
        <div>
            <h1 className="text-3xl font-bold mb-2">{"Let's meet gang"}</h1>
            <div className="flex items-center gap-2 text-gray-600">
                {days.length > 0 && (
                <span>{days[0].date} - {days[days.length - 1].date}</span>
                )}
            </div>
        </div>

        <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopyLink} className="flex items-center gap-2 bg-transparent">
                <Copy className="w-4 h-4" />
                Copy link
            </Button>
            <Button variant="outline">Cancel</Button>
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                Save
            </Button>
        </div>
    </div>
  )
}
