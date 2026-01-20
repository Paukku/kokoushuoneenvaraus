import { Router, Request, Response } from "express";
import { Booker, Booking } from "./types";
import { randomUUID } from "crypto";

const router = Router();
const bookings: Booking[] = [];
const bookers: Booker[] = [];

/**
 * CREATE booking
 */
router.post("/bookings", (req: Request, res: Response) => {
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
    uuid: randomUUID(),
    name: booker.name,
    email: booker.email,
  };

  bookers.push(newBooker);

  // Create booking
  const newBooking: Booking = {
    uuid: randomUUID(),
    roomId,
    bookerId: newBooker.uuid,
    startTime: start,
    endTime: end,
  };

  bookings.push(newBooking);

  res.status(201).json({
    booking: newBooking,
    booker: newBooker,
  });
});

/**
 * DELETE booking
 */
router.delete("/bookings/:id", (req: Request, res: Response) => {
  const index = bookings.findIndex(b => b.uuid === req.params.id);

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
  const result = bookings
  .filter(b => b.roomId === req.params.roomId)
  .map(b => {
    if (req.query.expandBooker === "true") {
      return { ...b, booker: bookers.find(u => u.uuid === b.bookerId) };
    }
    return b;
  });
  res.json(result);
});

export default router;
