import { TrackStatus } from "@prisma/client"
import { z } from "zod"

export const trackCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  notes: z.string().trim().min(1).max(2000).optional(),
  status: z.nativeEnum(TrackStatus).optional(),
})

export const trackStatusSchema = z.object({
  status: z.nativeEnum(TrackStatus),
})
