Prompti:
typescript, node.js Tehtäväsi on toteuttaa yksinkertainen kokoushuoneiden varausrajapinta (API). Palvelun tulee tarjota käyttäjille seuraavat toiminnot: 
● Varauksen luonti: Varaa huone tietylle aikavälille. 
● Varauksen peruutus: Poista varaus. 
● Varausten katselu: Listaa kaikki tietyn huoneen varaukset. Toimintalogiikka (business rules): 
● Varaukset eivät saa mennä päällekkäin (kaksi henkilöä ei voi varata samaa huonetta samaan aikaan). 
● Varaukset eivät voi sijoittua menneisyyteen. ● Aloitusajan täytyy olla ennen lopetusaikaa.

--
AIn vastaus
Ihanaa, tämä on oikein hyvä ja selkeä backend-harjoitustehtävä 💙
Alla on yksinkertainen mutta järkevä toteutus TypeScriptillä ja Node.js:llä (Express), jossa kaikki annetut liiketoimintasäännöt täyttyvät.

Teknologiat


Node.js


TypeScript


Express


In-memory tallennus (helppo vaihtaa myöhemmin tietokantaan)



Perusidea


Jokaisella varauksella on: id, roomId, startTime, endTime


Varausta luodessa:


ei menneisyyteen


aloitus < lopetus


ei päällekkäisiä varauksia samassa huoneessa





Projektirakenne (yksinkertainen)
src/
 ├── index.ts
 ├── routes.ts
 ├── types.ts


types.ts
export interface Booking {
  id: string;
  roomId: string;
  startTime: Date;
  endTime: Date;
}


routes.ts
import { Router, Request, Response } from "express";
import { Booking } from "./types";
import { randomUUID } from "crypto";

const router = Router();
const bookings: Booking[] = [];

/**
 * CREATE booking
 */
router.post("/bookings", (req: Request, res: Response) => {
  const { roomId, startTime, endTime } = req.body;

  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  // Business rules
  if (start >= end) {
    return res.status(400).json({ message: "Start time must be before end time" });
  }

  if (start < now) {
    return res.status(400).json({ message: "Booking cannot be in the past" });
  }

  const overlapping = bookings.some(b =>
    b.roomId === roomId &&
    start < b.endTime &&
    end > b.startTime
  );

  if (overlapping) {
    return res.status(400).json({ message: "Room is already booked for this time" });
  }

  const booking: Booking = {
    id: randomUUID(),
    roomId,
    startTime: start,
    endTime: end,
  };

  bookings.push(booking);
  res.status(201).json(booking);
});

/**
 * DELETE booking
 */
router.delete("/bookings/:id", (req: Request, res: Response) => {
  const index = bookings.findIndex(b => b.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Booking not found" });
  }

  bookings.splice(index, 1);
  res.status(204).send();
});

/**
 * LIST bookings by room
 */
router.get("/rooms/:roomId/bookings", (req: Request, res: Response) => {
  const roomBookings = bookings.filter(b => b.roomId === req.params.roomId);
  res.json(roomBookings);
});

export default router;


index.ts
import express from "express";
import routes from "./routes";

const app = express();
app.use(express.json());

app.use("/api", routes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


Esimerkkikutsut
Luo varaus
POST /api/bookings
Content-Type: application/json

{
  "roomId": "A1",
  "startTime": "2026-01-20T10:00:00",
  "endTime": "2026-01-20T11:00:00"
}

Poista varaus
DELETE /api/bookings/{bookingId}

Listaa huoneen varaukset
GET /api/rooms/A1/bookings


Miksi tämä on hyvä ratkaisu?
✅ Selkeä business-logiikka
✅ Helppo testata
✅ Helppo laajentaa tietokantaan
✅ Vastaa tyypillistä junior / harjoitustason backend-tehtävää
Jos haluat, voin seuraavaksi:


lisätä tietokannan (Prisma / SQLite / PostgreSQL)
kirjoittaa testit (Jest)
tai muokata tästä työnhakutehtävään “siistimmän” version 💪

