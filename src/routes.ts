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
