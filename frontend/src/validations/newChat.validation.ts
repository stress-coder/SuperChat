import { z } from 'zod';

/** Mirrors backend/src/modules/message/dto/send-message.dto.ts (recipientId path). */
export const newChatSchema = z.object({
  recipientId: z.uuidv4('Please enter a valid user ID'),
  content: z
    .string()
    .trim()
    .min(1, 'Message is required')
    .max(5000, 'Message must be at most 5000 characters'),
});

export type NewChatFormValues = z.infer<typeof newChatSchema>;
