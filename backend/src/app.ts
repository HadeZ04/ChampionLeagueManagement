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
import teamRoutes from "./routes/teamRoutes";
import { errorHandler } from "./middleware/errorHandler";
import leaderboardRoutes from "./routes/leaderboardRoutes";
import statsRoutes from "./routes/statsRoutes";
import playerRoutes from "./routes/playerRoutes";
import matchRoutes from "./routes/matchRoutes";
import syncRoutes from "./routes/syncRoutes";
import importRoutes from "./routes/importRoutes";
import internalTeamRoutes from "./routes/internalTeamRoutes";
import internalPlayerRoutes from "./routes/internalPlayerRoutes";
import adminStandingsRoutes from "./routes/adminStandingsRoutes";

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
// Use internal database for teams and players (Champions League data already imported)
app.use("/api/teams", internalTeamRoutes);
app.use("/api/players", internalPlayerRoutes);

// Old routes (Football-Data.org API) - commented out, can be removed later
// app.use("/api/teams", teamRoutes);
// app.use("/api/players", playerRoutes);

app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/matches", matchRoutes);

// Admin routes
app.use("/api/admin/standings", adminStandingsRoutes);

// Sync and Import utilities (keep for future use if needed)
app.use("/api/sync", syncRoutes);
app.use("/api/import", importRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(errorHandler);

export default app;
