import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

import { router as welcomeRouter } from "./welcome";
import { router as notFoundRouter } from "./404";
import { router as apiRouter } from "./api/index";
import { logger } from "./middlewares";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});
app.use(express.static("public"));

app.use(logger);

app.use("/", welcomeRouter);
app.use("/api", apiRouter);

app.use(notFoundRouter);

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT} at ${new Date()}`);
});
