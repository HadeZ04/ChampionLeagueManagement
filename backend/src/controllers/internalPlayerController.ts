import { Request, Response, NextFunction } from "express";
import { createPlayer } from "../services/internalPlayerService";

export const createPlayerHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { full_name, date_of_birth, nationality, position_code } = req.body;

        // Basic Validation
        if (!full_name || typeof full_name !== 'string' || !full_name.trim()) {
            return res.status(400).json({ error: "Full name is required" });
        }

        if (!date_of_birth || typeof date_of_birth !== 'string') {
            return res.status(400).json({ error: "Date of birth is required" });
        }

        // Call service
        const player = await createPlayer({
            full_name,
            date_of_birth,
            nationality,
            preferred_position: position_code // Map position_code to preferred_position
        });

        res.status(201).json({
            message: "Player created successfully",
            data: player
        });
    } catch (error) {
        next(error);
    }
};
