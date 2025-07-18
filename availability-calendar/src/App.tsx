import AvailabilityCalendar from "./components/AvailabilityCalendar"
import { Routes, Route } from "react-router-dom";
import DiscordUsernameForm from "./components/DiscordUsernameFrom";


function App() {
  return (
    <Routes>
      {/* Create something to grab usernames -> then we update their avilabilities one by one*/}
      <Route path="/" element={<DiscordUsernameForm />} />
      <Route path="/:eventId" element={<AvailabilityCalendar />} />
    </Routes>
  )
}

export default App
