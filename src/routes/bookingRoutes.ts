import { Router } from "express";
import { createBooking, deleteBooking, getBookingsByRoom } from "../services/bookingService";

const router = Router();

router.post("/bookings", (req, res, next) => {
  try {
    const result = createBooking(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});


/**
 * DELETE booking
 */
router.delete("/bookings/:id", (req, res, next) => {
  try {
    const result = deleteBooking(req.params.id);
    res.status(204).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * LIST bookings by room
 */
router.get("/rooms/:roomId/bookings", (req, res) => {
  const result = getBookingsByRoom({
    roomId: req.params.roomId,
    expandBooker: req.query.expandBooker === "true",
  });
  res.json(result);
});

export default router;
