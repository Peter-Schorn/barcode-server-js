import express from "express";
import morgan from "morgan";
import router from "./routes/index.js";

// MARK: configure app
const app = express();

// https://github.com/expressjs/morgan?tab=readme-ov-file#dev
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// MARK: configure routes
app.use("/", router);

export default app;
