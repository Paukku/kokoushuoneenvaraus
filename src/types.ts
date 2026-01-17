export interface Booking {
  uuid: string;
  roomId: string;
  bookerId: string;
  startTime: Date;
  endTime: Date;
}

export interface Booker {
  uuid: string;
  name: string;
  email: string;
}
