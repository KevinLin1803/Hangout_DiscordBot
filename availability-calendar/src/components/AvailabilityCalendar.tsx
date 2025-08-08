"use client"

import React, { useState, useEffect, useLayoutEffect } from "react"
import { Button } from "./ui/button"
import { Copy, X } from "lucide-react"
import {saveAvailability, getAvailabilities, getEventDetails} from "../../../src/backend/functions"
import { useParams, useNavigate } from "react-router-dom";

type AvailabilityStatus = "available" | "unavailable" | "if-needed"

export default function AvailabilityCalendar() {

  const [selectedMode, setSelectedMode] = useState<AvailabilityStatus>("available")
  const [calendarData, setCalendarData] = useState<Map<String, Number[]>>(new Map<String, Number[]>())
  const [days, setDays] = useState<{ short: string; date: string }[]>([])
  const [visibleDays, setVisibleDays] = useState<number>(1) // Number of days to show in the calendar
  const [isDragging, setIsDragging] = useState(false)
  const [showNotification, setShowNotification] = useState(true)
  const [username, setUserName] = useState<String>("")
  const navigate = useNavigate();

  const timeSlots = [
    { time: "10 AM", value: 10 },
    { time: "11 AM", value: 11 },
    { time: "12 PM", value: 12 },
    { time: "1 PM", value: 13 },
    { time: "2 PM", value: 14 },
    { time: "3 PM", value: 15 },
    { time: "4 PM", value: 16 },
    { time: "5 PM", value: 17 },
    { time: "6 PM", value: 18 },
    { time: "7 PM", value: 19 },
    { time: "8 PM", value: 20 },
    { time: "9 PM", value: 21 },
    { time: "10 PM", value: 22 },
    { time: "11 PM", value: 23 },
  ]

  var { eventId } = useParams<{ eventId: string }>();

  // Get discord username
  useEffect( () => {
    var discordTag = localStorage.getItem("discordUserName")

    if (discordTag == null) {
      navigate(`/${eventId}`)
    } else {
      setUserName(discordTag)
    }
  }, [])

  useEffect(() => {
    getEventDates(eventId || "Default event ID"); 
    const initialData = new Map<string, number[]>()
    days.forEach((day) => {
      initialData.set(day.short, [])
    })
    setCalendarData(initialData)
  }, [])

  async function getEventDates(eventId: string) {
    try {
      const details = await getEventDetails(eventId);
      const calendarDays = parseDateRangeToDays(details.startDate, details.endDate);
      setDays(calendarDays);
      setVisibleDays(Math.min(calendarDays.length + 1, 8));
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  }

  function parseDateRangeToDays(startStr: string, endStr: string): { short: string, date: string }[] {
    const currentYear = new Date().getFullYear();

    const parseToDate = (dateStr: string): Date => {
      const [day, month] = dateStr.split("/").map(Number);
      return new Date(currentYear, month - 1, day); // Month is 0-based
    };

    const formatDate = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      return `${day}/${month}`;
    };

    const getShortDay = (date: Date): string => {
      return date.toLocaleDateString("en-AU", { weekday: "short" }); // e.g., "Tue"
    };

    const startDate = parseToDate(startStr);
    const endDate = parseToDate(endStr);
    const result: { short: string; date: string }[] = [];

    const current = new Date(startDate);

    while (current <= endDate) {
      result.push({
        short: getShortDay(current),
        date: formatDate(current),
      });

      // Increment by 1 day
      current.setDate(current.getDate() + 1);
    }

    return result;
  }
  
  // Another learning: Sometimes you learnt the right thing you just got the syntax wrong 

  const getSlotStatus = (day: string, timeValue: number): AvailabilityStatus => {
    return calendarData.get(day)?.includes(timeValue)? "available" : "unavailable"
  }

  const getSlotColor = (status: AvailabilityStatus) => {
    switch (status) {
      case "available":
        return "bg-green-300 hover:bg-green-400"
      case "if-needed":
        return "bg-gray-300 hover:bg-gray-400"
      case "unavailable":
      default:
        return "bg-red-200 hover:bg-red-300"
    }
  }

  const handleSlotInteraction = (day: string, timeValue: number)  => {
      const currentStatus = getSlotStatus(day, timeValue)

      // Toggle functionality: if clicking on the same status, make it unavailable
      // Otherwise, set it to the selected mode
      let newStatus: AvailabilityStatus
      if (currentStatus === selectedMode) {
        newStatus = "unavailable"
      } else {
        newStatus = selectedMode
      }

      console.log(visibleDays % 8 == 0 ? 8: visibleDays % 8);
      console.log(visibleDays)

      // Update calendar data depending on selected mode
      setCalendarData((prev) => {
        const updatedSlots = prev.get(day) || []
        if (newStatus === "unavailable") {
          // Remove the time slot if it's being set to unavailable
          return new Map(prev).set(day, updatedSlots.filter((slot) => slot !== timeValue))
        } else {
          // Add the time slot if it's available or if-needed
          return new Map(prev).set(day, [...updatedSlots, timeValue])
        }
      })
    }

  const handleMouseDown = (day: string, timeValue: number) => {
    setIsDragging(true)
    handleSlotInteraction(day, timeValue)
  }

  const handleMouseEnter = (day: string, timeValue: number) => {
    if (isDragging) {
      setCalendarData((prev) => {
        const currentStatus = getSlotStatus(day, timeValue);
        const updatedSlots = prev.get(day) || []
        if (currentStatus === "available") {
          // Remove the time slot if it's being set to unavailable
          return new Map(prev).set(day, updatedSlots.filter((slot) => slot !== timeValue))
        } else {
          // Add the time slot if it's available or if-needed
          return new Map(prev).set(day, [...updatedSlots, timeValue])
        }
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleSave = () => {
    if (!eventId) {
      eventId = "default-event-id" // Fallback if no eventId is provided  
    }

    var discordTag = localStorage.getItem("discordUserName") || "No tag provided";
    saveAvailability(eventId, discordTag, calendarData)

    // Just gotta send this data over to the backend now basically :)
    alert("Availability saved! Check console for data structure.")
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    alert("Link copied to clipboard!")
  }

  const displayCalendarDays = () => {
    if (visibleDays > days.length) {
      return days.length % 7 + 1;
    } else {
      // On the second full one, we're doing 15 % 7. Cuz visible days is 15
        // I could change visibleDays to be 7 (get rid of the + 1 - 1 stuff)
        // Let's try that
      return visibleDays % 8 == 0 ? 8: visibleDays % 8;
    }
  }

  // Should try to show 5 days. And if it can't then allgs :)
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      {/* Header */}
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

      <div className="flex gap-6">
        {/* Calendar Grid */}
        <div className="flex-1">
          {/* Stuck -> arbitrary tailwind variables seem to be good for specific values []*/}
          {/* {Just using css} */}
          <div
            className = {`grid gap-0 border border-gray-300 rounded-lg overflow-hidden`}
            style = {{
              // When the number of visibel days shrink this needs to shrink with it too :)
              // Good code quality = visibleDays = all the visible days tbh

              // When visible days < 7
              // When visisble days > 7
              gridTemplateColumns: `repeat(${displayCalendarDays()}, 1fr)`,
            }}
           >
            {/* Header Row */}
            <div className="bg-gray-50 p-3"></div>
            {days.map((day, index) => (
              index >= visibleDays - 8 && index < visibleDays - 1 && 
              <div key={day.short} className="bg-gray-50 p-3 text-center border-l border-gray-300">
                <div className="text-sm text-gray-600">{day.date}</div>
                <div className="font-semibold">{day.short}</div>
              </div>
            ))}

            {/* Time Slots */}
            {timeSlots.map((slot) => (
              <React.Fragment key={slot.value}>
                <div className="bg-gray-50 p-3 text-sm font-medium border-t border-gray-300 flex items-center justify-center">
                  {slot.time}
                </div>
                {days.map((day, index) => {
                  const status = getSlotStatus(day.short, slot.value)
                  return (
                    index >= visibleDays - 8 && index < visibleDays - 1 && 
                    <div
                      key={`${day.short}-${slot.value}`}
                      className={`h-12 border-l border-t border-gray-300 cursor-pointer select-none ${getSlotColor(status)} transition-colors`}
                      onMouseDown={() => handleMouseDown(day.short, slot.value)}
                      onMouseEnter={() => handleMouseEnter(day.short, slot.value)}
                      onMouseUp={handleMouseUp}
                    />
                  )
                })}
              </React.Fragment>
            ))}
          </div>

          {/* Notification */}
          {showNotification && (
            <div className="mt-4 bg-gray-100 p-3 rounded-lg flex items-center justify-between">
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
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-64 space-y-4">
          <div>
            <p className="text-sm text-gray-600 italic mb-3">Adding availability as {username}</p>
              <Button
                variant={selectedMode === "if-needed" ? "default" : "outline"}
                size="sm"
                onClick={() => setVisibleDays((prev) => prev> days.length ? prev: prev + 7)}
                className={selectedMode === "if-needed" ? "bg-gray-600 hover:bg-gray-700" : ""}
              >
                Next week
              </Button>
              <Button
                variant={selectedMode === "if-needed" ? "default" : "outline"}
                size="sm"
                // The issue right now is that if the number of days we collecting availability for is less than 7
                // if we press prev week -> it'll go to 8 days
                // If i choose math.min, it just won't show like any days
                // No right now, I'm using visisbleDays as an index for the range of days within days we can display
                // Could clamp it within the closest multiple of 7 -> I could do visisble days % 7 + 1 (would work for everyhting but multiples of 7/14)
                onClick={() => setVisibleDays((prev) => days.length > 7? Math.max(prev - 7, 8): prev)}
                className={selectedMode === "if-needed" ? "bg-gray-600 hover:bg-gray-700" : ""}
              >
                Prev week
              </Button>

            <div className="flex gap-2 mb-4">
              <Button
                variant={selectedMode === "available" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMode("available")}
                className={selectedMode === "available" ? "bg-green-600 hover:bg-green-700" : ""}
              >
                Available
              </Button>
              <Button
                variant={selectedMode === "if-needed" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMode("if-needed")}
                className={selectedMode === "if-needed" ? "bg-gray-600 hover:bg-gray-700" : ""}
              >
                If needed
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Legend:</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-300 rounded"></div>
                <span className="text-sm">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span className="text-sm">If needed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-200 rounded"></div>
                <span className="text-sm">Unavailable</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
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
    </div>
  )
}

// SO MUCH TOO LEARN
  // AUTOMATED TESTING -> WHAT ARE THE DIFFERENT KINDS OF TESTS YOU CAN CREATE? ADD THIS IN WITH AI?
  // CLEAN CODE BOOK (small functions, good variable names -> self explanatory code -> easy to read/understand)
  // Never hurts to know what the good stuff is
