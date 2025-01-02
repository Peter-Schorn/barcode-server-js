import express from "express";
import { WebSocketExpress } from "websocket-express";
import morgan from "morgan";
import "./utils/express-extensions.js";
import "./utils/date.js";
import router from "./routes/index.js";
import wsRouter from "./routes/websocket.js";
import cors from "cors";
import "./database/listener.js";

// MARK: configure app
const app = new WebSocketExpress();

// MARK: configure CORS
type CorsMiddleware = (options?: cors.CorsOptions) => express.RequestHandler;
app.use((cors as CorsMiddleware)());

// https://github.com/expressjs/morgan?tab=readme-ov-file#dev
app.use(morgan("dev"));  // TODO: do we need to use app.useHTTP instead?
app.use(WebSocketExpress.json());
app.use(WebSocketExpress.urlencoded({ extended: false }));

// MARK: configure routes
app.use("/", router);
app.use("/watch", wsRouter);

export default app;
