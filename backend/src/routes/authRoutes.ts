import { Router } from "express";
import { z } from "zod";
import { login, getProfile } from "../services/authService";
import { registerPublicUser, updateUser } from "../services/userService";
import { requireAuth } from "../middleware/authMiddleware";
import { validate } from "../middleware/validate";
import { AuthenticatedRequest } from "../types";

const router = Router();

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

const profileUpdateSchema = z
  .object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined && value !== ""),
    { message: "At least one field must be provided" }
  );

router.post("/login", validate({ schema: loginSchema }), async (req, res) => {
  const { username, password } = req.body;
  const result = await login(username, password);
  res.json(result);
});

router.post("/register", validate({ schema: registerSchema }), async (req, res) => {
  const metadata = {
    ip: req.ip,
    userAgent: req.get("user-agent") ?? null,
    email: req.body.email,
  };
  const { userId } = await registerPublicUser(req.body, metadata);
  res.status(201).json({ userId });
});

router.get("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.sub;
  const profile = await getProfile(userId);
  res.json(profile);
});

router.put(
  "/me",
  requireAuth,
  validate({ schema: profileUpdateSchema }),
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.sub;
    await updateUser(userId, {
      ...req.body,
      updatedBy: userId,
    });
    const profile = await getProfile(userId);
    res.json(profile);
  }
);

export default router;
