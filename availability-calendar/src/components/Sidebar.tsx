import React, {useState, useEffect} from 'react'
import { Button } from './ui/button'
import { useNavigate } from 'react-router-dom';

// This one is a bit more complicated because the other components will need the state I'm setting here
type SideBarProps = {
    eventId: string | undefined;
    selectedMode: AvailabilityStatus;
    handleSelectedMode: (data: AvailabilityStatus) => void
}

type AvailabilityStatus = "available" | "unavailable" | "if-needed";

export default function Sidebar ({eventId, selectedMode, handleSelectedMode}: SideBarProps) {
    const [username, setUserName] = useState<String>("");    
    const navigate = useNavigate();

      // Get discord username
      useEffect( () => {
        var discordTag = localStorage.getItem("discordUserName")
    
        if (discordTag == null) {
          navigate(`/${eventId}`)
        } else {
          setUserName(discordTag)
        }
      }, [])
    

    return (
        <div className="w-64 space-y-4">
          <div>
            <p className="text-sm text-gray-600 italic mb-3">Adding availability as {username}</p>

            <div className="flex gap-2 mb-4">
              <Button
                variant={selectedMode === "available" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSelectedMode("available")}
                className={selectedMode === "available" ? "bg-green-600 hover:bg-green-700" : ""}
              >
                Available
              </Button>
              <Button
                variant={selectedMode === "if-needed" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSelectedMode("if-needed")}
                className={selectedMode === "if-needed" ? "bg-gray-600 hover:bg-gray-700" : ""}
              >
                If needed
              </Button>
            </div>
          </div>

            {/* Legend */}
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
  )
}
