export interface Booking {
  id: string;
  roomId: string;
  bookerId: string;
  startTime: Date;
  endTime: Date;
}

export interface Booker {
  id: string;
  name: string;
  email: string;
}
