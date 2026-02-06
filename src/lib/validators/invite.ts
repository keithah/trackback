import { z } from "zod"

export const inviteSchema = z
  .object({
    email: z.string().email().optional(),
    username: z.string().trim().min(1).max(80).optional(),
  })
  .refine((data) => data.email || data.username, {
    message: "Email or username is required",
    path: ["email"],
  })
