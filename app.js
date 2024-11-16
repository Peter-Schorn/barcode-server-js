const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const path = require("path");
const loggerMiddleware = require("morgan");


const indexRouter = require("./routes/index");

const port = process.env.PORT ?? 3000;
const app = express();


app.use(loggerMiddleware("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// app.use("/", indexRouter);

app.get("/", (req, res) => {
    res.send("success");
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
