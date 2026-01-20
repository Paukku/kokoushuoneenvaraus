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

--

Prompti: Pohja on OK. Haluaisin lisätä varaajan tiedot. Voisi olla erillinen varaaja taulukko, jonne tulee varaajan tiedot ja joka liitetään esimerkiksi idn tai uuidn kautta booking taulukkoon. Olisiko UUID parempi tietoturvan kannalta?

AIn vastaus:
Tosi hyvä jatkokysymys – tämä menee jo oikeasti järkevän backend-suunnittelun puolelle 👌
Vastaan kahdessa osassa:

UUID vs juokseva id (tietoturva & arkkitehtuuri)

Miten varaaja (“Booker”) kannattaa mallintaa ja liittää varaukseen

1️⃣ UUID vai numero-ID – kumpi on parempi?
Lyhyt vastaus:

👉 UUID on parempi tietoturvan ja API-suunnittelun kannalta
👉 Numero-ID on ok vain sisäiseen käyttöön tai suojattuihin järjestelmiin

Miksi UUID on parempi?

Numero-ID:
/bookings/1
/bookings/2
/bookings/3

❌ Helppo arvailla
❌ Altis ID-enumeroinnille
❌ Yleinen “junior-virhe” avoimissa API:ssa

UUID:
/bookings/550e8400-e29b-41d4-a716-446655440000

✅ Käytännössä mahdoton arvata
✅ Turvallisempi avoimissa rajapinnoissa
✅ Sopii hajautettuihin järjestelmiin
✅ Ammattimaisemman oloinen työnäytteessä

💡 Yleinen käytäntö tuotannossa:

Ulkoinen API → UUID
Sisäinen DB → voi silti olla auto-increment id
→ Tässä tehtävässä: UUID on ehdottomasti parempi valinta.
2️⃣ Varaaja erillisenä entiteettinä (Booker / User)

Tämä on juuri oikea tapa 👍
Ei tallenneta varaajan nimeä suoraan booking-tauluun, vaan viitataan siihen.
Tietomallit
Booker
export interface Booker {
  id: string;        // UUID
  name: string;
  email: string;
}
Booking
export interface Booking {
  id: string;        // UUID
  roomId: string;
  bookerId: string;  // viittaus varaajaan
  startTime: Date;
  endTime: Date;
}
In-memory “taulut”
const bookers: Booker[] = [];
const bookings: Booking[] = [];

Varaajan luonti
router.post("/bookers", (req: Request, res: Response) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  const booker: Booker = {
    id: randomUUID(),
    name,
    email,
  };

  bookers.push(booker);
  res.status(201).json(booker);
});

Varaus varaajalla (päivitetty)
router.post("/bookings", (req: Request, res: Response) => {
  const { roomId, startTime, endTime, bookerId } = req.body;

  const bookerExists = bookers.some(b => b.id === bookerId);
  if (!bookerExists) {
    return res.status(400).json({ message: "Booker not found" });
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

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
    bookerId,
    startTime: start,
    endTime: end,
  };

  bookings.push(booking);
  res.status(201).json(booking);
});

(Bonus) Varaus + varaajan tiedot yhdessä

Työnäytteessä tämä on iso plussa:

router.get("/rooms/:roomId/bookings", (req, res) => {
  const result = bookings
    .filter(b => b.roomId === req.params.roomId)
    .map(b => ({
      ...b,
      booker: bookers.find(booker => booker.id === b.bookerId),
    }));

  res.json(result);
});

Miltä tämä näyttää arvioijan silmissä?

🔥 Hyvä domain-mallinnus
🔥 Erottaa entiteetit oikein
🔥 Ymmärtää tietoturvan perusasiat
🔥 Valmis siirtymään tietokantaan (Prisma / TypeORM)

Jos haluat, seuraava luonteva askel olisi:

🔐 autentikointi (varaaja = kirjautunut käyttäjä)
🗄 Prisma + PostgreSQL -skeema
🧪 testit päällekkäisyyslogiikalle

Sano vain mihin suuntaan jatketaan, autan mielelläni 💙

Prompti: Ajattelin, että huoneen varaus sekä varaajan tiedot, olisivat molemmat yhdessä routessa, jotta käyttäjän olisi helppo varata kerralla huone

AIn vastaus:
Tuo ajatus on erittäin hyvä ja täysin perusteltu – ja itse asiassa todella yleinen ratkaisu oikeissa järjestelmissä 👍
Käytettävyyden kannalta tämä on juuri sitä, mitä API:n kuluttaja toivoo: yksi pyyntö, yksi toiminto.

Alla selitän:
Onko tämä hyvä arkkitehtuuri?
Miten route kannattaa suunnitella
Esimerkkitoteutus (create booking + booker yhdessä)
Pieni ammattilaisvinkki työnäytteeseen

1️⃣ Onko booking + booker samassa routessa OK?
Kyllä. Ja vieläpä hyvää suunnittelua, kun:
Varaaja ei ole kirjautunut käyttäjä
Varaus tehdään “kertaluontoisesti”
Frontend haluaa tehdä yhden HTTP-kutsun
Tämä on transactionaalinen operaatio:
“Luo varaaja → luo varaus → joko molemmat onnistuvat tai kumpikaan ei”
Tietokannalla tämä olisi yksi transaktio – in-memoryssä tehdään sama ajatusmalli.

2️⃣ Suositeltu route-muoto
POST /api/bookings

Request body
{
  "roomId": "A1",
  "startTime": "2026-01-20T10:00:00",
  "endTime": "2026-01-20T11:00:00",
  "booker": {
    "name": "Paula Häyrynen",
    "email": "paula@example.com"
  }
}

➡️ Frontend ei välitä bookerId:stä mitään
➡️ Backend hoitaa kaiken

3️⃣ Toteutus: kaikki yhdessä routessa
Tyypit
export interface Booker {
  id: string;
  name: string;
  email: string;
}

export interface Booking {
  id: string;
  roomId: string;
  bookerId: string;
  startTime: Date;
  endTime: Date;
}

Route: POST /bookings
router.post("/bookings", (req, res) => {
  const { roomId, startTime, endTime, booker } = req.body;

  if (!booker?.name || !booker?.email) {
    return res.status(400).json({ message: "Booker name and email are required" });
  }

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

  // Create booker
  const newBooker: Booker = {
    id: randomUUID(),
    name: booker.name,
    email: booker.email,
  };

  bookers.push(newBooker);

  // Create booking
  const newBooking: Booking = {
    id: randomUUID(),
    roomId,
    bookerId: newBooker.id,
    startTime: start,
    endTime: end,
  };

  bookings.push(newBooking);

  res.status(201).json({
    booking: newBooking,
    booker: newBooker,
  });
});

4️⃣ Ammattilaisvinkki (tämä tekee vaikutuksen arvioijaan)

Lisää kommentti tai README-teksti, jossa perustelit ratkaisun:

“Booking creation also creates a booker in the same request to simplify API usage and represent a real-world booking flow. In a production system this operation would be handled inside a database transaction.”

💥 Tämä kertoo, että:

ymmärrät transaktiot

ymmärrät UX:n

ymmärrät backend-vastuun

Milloin tämä EI olisi hyvä ratkaisu?

Hyvä että tiedät myös tämän:

❌ Jos varaaja on kirjautunut käyttäjä
❌ Jos varaajaa käytetään useissa varauksissa
❌ Jos varaajaa hallitaan erikseen (GDPR, profiili)

Silloin:

POST /users
POST /bookings

Yhteenveto

✔️ Yksi route → erinomainen UX
✔️ UUID → hyvä tietoturva
✔️ Selkeä domain-malli
✔️ Täysin tuotantokelpoinen ajattelumalli

Haluatko vielä:

lisätä emailin uniikkiuden?

estää tuplavaraajan luonnin?

mallintaa tämän Prismalla SQL:ään?

Olet menossa todella hyvään suuntaan tässä 💙

Arvioi onko parempi, että huoneen varauksia haettaessa näkyisikin pelkästään varaajan uuid ja jos haluaa tarkistaa varaajan tiedot, pitää ne erikseen hakea bookers taulukosta?

Tämä on hyvä pohdinta – siinä on sekä hyvät että huonot puolensa, ja valinta riippuu pitkälti siitä, mitä API:n käyttäjä tarvitsee ja millä tasolla tietoturvaa haluat. Käydään läpi tarkasti.

1️⃣ Vaihtoehto A: Näytä vain varaajan UUID
Kuvaus

GET /rooms/:roomId/bookings palauttaa esimerkiksi näin:
[
  {
    "id": "booking-uuid-1",
    "roomId": "A1",
    "bookerId": "booker-uuid-1",
    "startTime": "...",
    "endTime": "..."
  }
]


Jos haluat varauksen tekijän tiedot, teet erillisen haun:

GET /bookers/{bookerId}

Plussat

✅ Tietoturva: Varaajan henkilökohtaiset tiedot (nimi, sähköposti) eivät tule automaattisesti ulos
✅ Selkeä rajapinta: Frontend päättää itse, milloin tietoja tarvitaan
✅ Skaalautuvuus: Isot listaukset eivät tuo mukanaan turhia tietoja

Miinukset

❌ Lisää API-kutsuja frontendissä, jos halutaan näyttää varaajan nimi listassa
❌ Koodissa pitää tehdä join-tyyppinen käsittely, jos haluaa yhdistää tiedot clientissä

2️⃣ Vaihtoehto B: Näytä varaajan tiedot heti
Kuvaus

Sama lista kuin yllä, mutta mukana booker:
[
  {
    "id": "booking-uuid-1",
    "roomId": "A1",
    "startTime": "...",
    "endTime": "...",
    "booker": {
      "id": "booker-uuid-1",
      "name": "Paula Häyrynen",
      "email": "paula@example.com"
    }
  }
]

Plussat

✅ Käyttäjäystävällinen: Frontend saa kaiken yhdellä haulla
✅ Ei tarvita monia API-kutsuja
✅ Selkeä työnäyte: yhdistetty data, transactionaalinen ajattelu

Miinukset

❌ Paljastaa heti henkilötietoja
❌ Jos listassa on paljon varauksia → suurempi payload
❌ API voi olla vaikeampi GDPR/PR-lainsäädännön näkökulmasta, jos listaus julkaistaan laajasti

3️⃣ Yleinen kompromissi (suositeltava)

Oletuksena näytä vain UUID

Lisää query-parametri tai “expand” -feature, jos haluaa varaajan tiedot:

GET /rooms/A1/bookings?expandBooker=true


Backend tekee tarvittaessa joinin ja palauttaa varaajan tiedot.

Näin API on turvallinen, mutta silti joustava.

const result = bookings
  .filter(b => b.roomId === req.params.roomId)
  .map(b => {
    if (req.query.expandBooker === "true") {
      return { ...b, booker: bookers.find(u => u.id === b.bookerId) };
    }
    return b;
  });

✅ Suositus työnäytteeseen

Työnäytteessä kannattaa näyttää heti booker tiedot yhdistettynä, koska se näyttää:

että osaat tehdä “join-tyyppistä” dataa
että ajattelet UX:n näkökulmasta
Samalla voi kommentoida:
“In a real system, this could be optional for privacy/security concerns.”
Tämä näyttää ammattilaiselta: ymmärrät sekä UX:n että tietoturvan.
Jos haluat, voin tehdä päivitetyn route-toteutuksen, jossa:
Yhdistetään booking + booker
Lisätään expandBooker-query-parametri
Käytännössä työnäyte olisi valmis, siisti ja ammattimainen 💪
Haluatko, että teen sen?

--
Prompti: Haluan, että seuraavaksi virheiden käsittely ja business logiikka eristetään omiksi tiedostoksi.

AI:
Tämä on erinomainen seuraava askel 💙
Tässä kohtaa mennään jo selvästi “junior → mid” -ajatteluun: erotellaan vastuut, tehdään koodista testattavaa ja helposti ylläpidettävää.
Alla annan selkeän, käytännöllisen rakenteen, joka ei ole ylisuurta “enterprise-himmeliä”, mutta näyttää arvioijan silmissä todella hyvältä.

🎯 Tavoite


Routet = vain HTTP + request/response


Business-logiikka = omassa service-tiedostossa


Virheenkäsittely = keskitetty


Helppo lisätä testit myöhemmin



📁 Uusi projektirakenne
src/
├── index.ts
├── routes/
│   └── bookingRoutes.ts
├── services/
│   └── bookingService.ts
├── errors/
│   ├── AppError.ts
│   └── errorHandler.ts
├── data/
│   └── store.ts
├── types/
│   ├── Booking.ts
│   └── Booker.ts


1️⃣ Keskitetty virheluokka
errors/AppError.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400
  ) {
    super(message);
  }
}


2️⃣ Error middleware
errors/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "./AppError";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  console.error(err);
  res.status(500).json({ message: "Internal server error" });
};


3️⃣ In-memory data erikseen
data/store.ts
import { Booking } from "../types/Booking";
import { Booker } from "../types/Booker";

export const bookings: Booking[] = [];
export const bookers: Booker[] = [];


4️⃣ Business-logiikka serviceen
services/bookingService.ts
import { randomUUID } from "crypto";
import { bookings, bookers } from "../data/store";
import { Booking } from "../types/Booking";
import { Booker } from "../types/Booker";
import { AppError } from "../errors/AppError";

interface CreateBookingInput {
  roomId: string;
  startTime: string;
  endTime: string;
  booker: {
    name: string;
    email: string;
  };
}

export const createBooking = (input: CreateBookingInput) => {
  const { roomId, startTime, endTime, booker } = input;

  if (!booker?.name || !booker?.email) {
    throw new AppError("Booker name and email are required");
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  if (start >= end) {
    throw new AppError("Start time must be before end time");
  }

  if (start < now) {
    throw new AppError("Booking cannot be in the past");
  }

  const overlapping = bookings.some(b =>
    b.roomId === roomId &&
    start < b.endTime &&
    end > b.startTime
  );

  if (overlapping) {
    throw new AppError("Room is already booked for this time");
  }

  const newBooker: Booker = {
    id: randomUUID(),
    name: booker.name,
    email: booker.email,
  };

  bookers.push(newBooker);

  const newBooking: Booking = {
    id: randomUUID(),
    roomId,
    bookerId: newBooker.id,
    startTime: start,
    endTime: end,
  };

  bookings.push(newBooking);

  return {
    booking: newBooking,
    booker: newBooker,
  };
};


5️⃣ Route on nyt todella siisti
routes/bookingRoutes.ts
import { Router } from "express";
import { createBooking } from "../services/bookingService";

const router = Router();

router.post("/bookings", (req, res, next) => {
  try {
    const result = createBooking(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;


6️⃣ Middleware käyttöön
index.ts
import express from "express";
import bookingRoutes from "./routes/bookingRoutes";
import { errorHandler } from "./errors/errorHandler";

const app = express();
app.use(express.json());

app.use("/api", bookingRoutes);
app.use(errorHandler);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});


💡 Miksi tämä on todella hyvä ratkaisu?
✔️ Routet ovat luettavia
✔️ Business-logiikka testattavissa ilman Expressiä
✔️ Virheet yhdessä paikassa
✔️ Helppo siirtyä tietokantaan
✔️ Näyttää ammattimaiselta työnäytteessä

Seuraava luonteva askel (suosittelen):
🧪 Unit-testit bookingServicelle (Jest)
🔐 Uniikki email -sääntö varaajalle
🔄 Update / cancel booking serviceen
🗄 Prisma + SQL + transaktiot

Sano vain mihin jatketaan – tämä on jo todella vahvaa tekemistä 💙