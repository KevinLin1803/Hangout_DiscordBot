// saveAvailability.ts
import { doc, setDoc, getDocs, collection } from "firebase/firestore";
import { db } from "./firebase";

export interface Availability {
  username: string;
  times: string[]; // ISO strings
}

export async function saveAvailability(
  eventId: string,
  userId: string,
  username: string,
  times: Map<String, Number[]>
): Promise<void> {
  const ref = doc(db, `events/${eventId}/availabilities/${userId}`);
  // Convert Map to an array of strings for Firestore
  const availabilities = Object.fromEntries(times);
  await setDoc(ref, {
    username,
    availabilities
  });
}

export async function getAvailabilities(
  eventId: string
): Promise<Availability[]> {
  const querySnapshot = await getDocs(
    collection(db, `events/${eventId}/availabilities`)
  );
  const data: Availability[] = [];
  querySnapshot.forEach((docSnap) => {
    const d = docSnap.data();
    data.push({
      username: d.username,
      times: d.times,
    });
  });
  return data;
}

// Next step:
// 1. I need to test multiple users saving their availability (how can I simulate this?)
// 2. I need my discord bot to be able to read this data and send it in the chat


// Aka how am I going to share event information with the discord bot (eventId essentially)
