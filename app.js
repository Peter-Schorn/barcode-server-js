import "dotenv/config";
import express from "express";
import path from "path";
import morgan from "morgan";
import { fileURLToPath } from "url";

import router from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT ?? 3000;

// MARK: configure database
import "./database/connection.js";


// MARK: configure app
const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// MARK: configure routes
app.use("/", router);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
