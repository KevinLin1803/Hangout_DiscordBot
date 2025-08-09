"use client"

import React, { useState, useEffect } from "react"
import { Button } from "./ui/button"
import {getEventDetails} from "../../../src/backend/functions"
import { useParams } from "react-router-dom";
import Header from "./Header"
import Notification from "./Notification"
import Footer from "./Footer";
import CalendarHeader from "./calendar/CalendarHeader";
import Timeslots from "./calendar/TimeSlots";
import { parseDateRangeToDays } from "../lib/utils";
import Paginate from "./Paginate";
import Sidebar from "./Sidebar";

type AvailabilityStatus = "available" | "unavailable" | "if-needed"

export default function AvailabilityCalendar() {

  const [selectedMode, setSelectedMode] = useState<AvailabilityStatus>("available");
  const [calendarData, setCalendarData] = useState<Map<String, Number[]>>(new Map<String, Number[]>());
  const [days, setDays] = useState<{ short: string; date: string }[]>([]);
  const [visibleDays, setVisibleDays] = useState<number>(0);

  const handleCalendarData = React.useCallback((data: Map<String, Number[]>) => {
    setCalendarData(data);
  }, [])

  const handleVisibleDays = React.useCallback((data: number) => {
    setVisibleDays(data);
  }, [])

  const handleSelectedMode = React.useCallback((data: AvailabilityStatus) => {
    setSelectedMode(data);
  }, [])

  var { eventId } = useParams<{ eventId: string }>();

  useEffect(() => {
    getEventDates(eventId || "Default event ID"); 
    const initialData = new Map<string, number[]>()
    days.forEach((day) => {
      initialData.set(day.date, [])
    })
    setCalendarData(initialData)
  }, [])

  async function getEventDates(eventId: string) {
    try {
      const details = await getEventDetails(eventId);
      const calendarDays = parseDateRangeToDays(details.startDate, details.endDate);
      setDays(calendarDays);
      setVisibleDays(Math.min(calendarDays.length, 7));
      console.log(calendarDays);
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  }
  
  const displayCalendarDays = () => {
    return (visibleDays > days.length || days.length < 7) ? days.length % 7 + 1: 8;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <Header eventId={eventId} days={days} calendarData={calendarData}/>

      <div className="flex gap-6">
        {/* Calendar Grid */}
        <div className="flex-1">
          {/* Could abstract this away too :3 */}
          <div
            className = {`grid gap-0 border border-gray-300 rounded-lg overflow-hidden`}
            style = {{
              gridTemplateColumns: `repeat(${displayCalendarDays()}, 1fr)`,
            }}
           >
            <CalendarHeader days={days} visibleDays={visibleDays}/>
            <Timeslots days={days} visibleDays={visibleDays} selectedMode={selectedMode} calendarData={calendarData} handleCalendarData={handleCalendarData} /> 
          </div>
          {/* Prev and Next week buttons */}
          < Paginate days={days} selectedMode={selectedMode} visibleDays={visibleDays} handleVisibleDays={handleVisibleDays}/>
          < Notification />
        </div>

        {/* Sidebar */}
        <Sidebar eventId={eventId} selectedMode={selectedMode} handleSelectedMode={handleSelectedMode}/>
      </div>

      <Footer />
    </div>
  )
}

// SO MUCH TOO LEARN
  // AUTOMATED TESTING -> WHAT ARE THE DIFFERENT KINDS OF TESTS YOU CAN CREATE? ADD THIS IN WITH AI?
  // CLEAN CODE BOOK (small functions, good variable names -> self explanatory code -> easy to read/understand)
  // Never hurts to know what the good stuff is
  // Grab the book and read through it? :3 Leshhh goooo

// We'll get the automation working and then brainstorm what we can create

// I'll refactor the code over the weekend :) -> tbh AI is what made it messy in the first place. lets goooo
