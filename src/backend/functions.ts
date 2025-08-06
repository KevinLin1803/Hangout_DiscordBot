// saveAvailability.ts
import { doc, setDoc, getDocs, getDoc, collection } from "firebase/firestore";
import { db } from "./firebase";

export interface Availability {
  username: string;
  times: string[]; // ISO strings
}

// Singular get functions and attaching a listener to the collection
  // 

export async function createEvent(
  eventId: string,
  duration: number,
  startDate: string,
  endDate: string,
): Promise<void> {
  const ref = doc(db, `events/${eventId}`);
  await setDoc(ref, {
    duration,
    startDate,
    endDate
  });
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

// Promise = enables async/await syntax
// Because avascrip ti single-threaded, this means that our application won't block
export async function getEventDetails(
  eventId: string
): Promise<{ startDate: string; endDate: string }> {
  const docSnap = await getDoc(doc(db, `events`, eventId));
  const eventDetails = docSnap.data();

  return {
    startDate: eventDetails? eventDetails.startDate : "",
    endDate: eventDetails? eventDetails.endDate : ""
  };
}

// Why is firestore organised in an alternating collections and document structure?
  // getdocs = to get collection
  // get doc= to get a document
