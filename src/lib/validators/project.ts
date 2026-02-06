import { TrackStatus } from "@prisma/client"
import { z } from "zod"

export const projectCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(1000).optional(),
  defaultTrackStatus: z.nativeEnum(TrackStatus).optional().default(TrackStatus.DEMO),
})
