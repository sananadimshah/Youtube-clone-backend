import express from "express";
import cors from "cors";
import cookiesParser from "cookie-parser";
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookiesParser());

// routes import
import userRouter from "./routes/user.routes.js";

// router declartion
app.use("/api/v1/users", userRouter);

// routes export
export { app };
