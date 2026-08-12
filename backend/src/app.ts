import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

import { notFound } from "./shared/middleware/notFound";
import { errorHandler } from "./shared/middleware/errorHandler";
import { requestLogger } from "./shared/middleware/requestLogger";

import routes from "./routes";

const app = express();

// Middleware

// app.use(helmet());
// app.use(cors());
// app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Route
app.use("/api/v1", routes);

app.use(notFound);
app.use(errorHandler);

export default app;