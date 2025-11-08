import express from "express";
import "express-async-errors";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import roleRoutes from "./routes/roleRoutes";
import permissionRoutes from "./routes/permissionRoutes";
import rulesetRoutes from "./routes/rulesetRoutes";
import seasonRoutes from "./routes/seasonRoutes";
import auditRoutes from "./routes/auditRoutes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/rulesets", rulesetRoutes);
app.use("/api/seasons", seasonRoutes);
app.use("/api/audit-events", auditRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(errorHandler);

export default app;
