import z from "zod";

export const helloSchema = z.object({
    name: z.string().min(4)
})