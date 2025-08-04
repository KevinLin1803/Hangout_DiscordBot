import AvailabilityCalendar from "./components/AvailabilityCalendar"
import { Routes, Route } from "react-router-dom";
import DiscordUsernameForm from "./components/DiscordUsernameFrom";

// To do:
// - Figure out design for how the discord bot gives date range to the calendar (frontend handle the different ranges)
// - discord bot pull from the database and check in the group chat to see who's done it or not

function App() {
  return (
    <Routes>
      <Route path="/:eventId" element={<DiscordUsernameForm />} />
      <Route path="/calendar/:eventId" element={<AvailabilityCalendar />} />
    </Routes>
  )
}

export default App
