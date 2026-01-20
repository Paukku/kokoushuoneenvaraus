import { randomUUID } from "crypto";
import { bookings, bookers } from "../data/Store";
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

interface GetRoomBookingsInput {
  roomId: string; 
  expandBooker: boolean 
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
    uuid: randomUUID(),
    name: booker.name,
    email: booker.email,
  };

  bookers.push(newBooker);

  const newBooking: Booking = {
    uuid: randomUUID(),
    roomId,
    bookerId: newBooker.uuid,
    startTime: start,
    endTime: end,
  };

  bookings.push(newBooking);

  return {
    booking: newBooking,
    booker: newBooker,
  };
};

export const getBookingsByRoom = (input: GetRoomBookingsInput) => {
  const result = bookings
  .filter(b => b.roomId === input.roomId)
  .map(b => {
    if (input.expandBooker) {
      return { ...b, booker: bookers.find(u => u.uuid === b.bookerId) };
    }
    return b;
  });
  return result;
}

export const deleteBooking = (id: string) => {
   const index = bookings.findIndex(b => b.uuid === id);

  if (index === -1) {
    throw new AppError("Booking not found", 404);
  }

  bookings.splice(index, 1);
  return { message: "Booking deleted successfully" };
}