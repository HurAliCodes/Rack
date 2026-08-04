import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

import routes from "./routes";
import { errorHandler } from "./shared/middleware/error.middleware";

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(errorHandler);

// Route
app.use("/api/v1", routes);

export default app;