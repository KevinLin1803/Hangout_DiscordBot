import React, {useState} from "react"
import { timeSlots } from "../constants/bookingConstants"


type TimeSlotsProps = {
    days: { short: string; date: string }[];
    visibleDays: number;
    selectedMode: AvailabilityStatus;
    calendarData: Map<String, Number[]>;
    handleCalendarData: (data: Map<String, Number[]>) => void;
}

type AvailabilityStatus = "available" | "unavailable" | "if-needed"

// This is the ginourmous component (all the responsiveness and everything is essentially here)
export default function Timeslots ({days, visibleDays, selectedMode, calendarData, handleCalendarData}: TimeSlotsProps) {

    const [isDragging, setIsDragging] = useState(false);
    
    const getSlotStatus = (date: string, timeValue: number): AvailabilityStatus => {
        return calendarData.get(date)?.includes(timeValue)? "available" : "unavailable"
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

    const handleMouseDown = (date: string, timeValue: number) => {
        setIsDragging(true)
        handleSlotInteraction(date, timeValue)
    }

    const handleMouseEnter = (date: string, timeValue: number) => {
        if (isDragging) {
            const currentStatus = getSlotStatus(date, timeValue);
            const updatedSlots = calendarData.get(date) || []
            if (currentStatus === "available") {
            // Remove the time slot if it's being set to unavailable
                handleCalendarData(new Map(calendarData).set(date, updatedSlots.filter((slot) => slot !== timeValue)));
            } else {
            // Add the time slot if it's available or if-needed
                handleCalendarData(new Map(calendarData).set(date, [...updatedSlots, timeValue]));
            }
        }
    }
    
    const handleMouseUp = () => {
        setIsDragging(false)
    }

    const handleSlotInteraction = (date: string, timeValue: number)  => {
      const currentStatus = getSlotStatus(date, timeValue);

      // Toggle functionality: if clicking on the same status, make it unavailable
      // Otherwise, set it to the selected mode
      let newStatus: AvailabilityStatus
      if (currentStatus === selectedMode) {
        newStatus = "unavailable";
      } else {
        newStatus = selectedMode;
      }

      // Update calendar data depending on selected mode
        const updatedSlots = calendarData.get(date) || []
        if (newStatus === "unavailable") {
          // Remove the time slot if it's being set to unavailable
            handleCalendarData(new Map(calendarData).set(date, updatedSlots.filter((slot) => slot !== timeValue)));
        } else {
          // Add the time slot if it's available or if-needed
            handleCalendarData(new Map(calendarData).set(date, [...updatedSlots, timeValue]));
        }
    }

    return (
        <>
            {timeSlots.map((slot) => (
                <React.Fragment key={slot.value}>
                <div className="bg-gray-50 p-3 text-sm font-medium border-t border-gray-300 flex items-center justify-center">
                    {slot.time}
                </div>
                {days.map((day, index) => {
                    const status = getSlotStatus(day.date, slot.value)
                    return (
                    index >= visibleDays - 7 && index < visibleDays && 
                    <div
                        key={`${day.date}-${slot.value}`}
                        className={`h-12 border-l border-t border-gray-300 cursor-pointer select-none ${getSlotColor(status)} transition-colors`}
                        onMouseDown={() => handleMouseDown(day.date, slot.value)}
                        onMouseEnter={() => handleMouseEnter(day.date, slot.value)}
                        onMouseUp={handleMouseUp}
                    />
                    )
                })}
                </React.Fragment>
            ))}
        </>
    )
}
