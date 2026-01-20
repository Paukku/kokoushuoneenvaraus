import express from "express";
import bookingRoutes from "./routes/bookingRoutes";
import { errorHandler } from "./errors/ErrorHandler";

const app = express();
app.use(express.json());

app.use("/api", bookingRoutes);
app.use(errorHandler);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
