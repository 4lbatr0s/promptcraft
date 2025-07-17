import { z } from 'zod'

export const promptJsonSchema = z.object({
  action: z.string().describe("The primary action requested by the user, e.g., 'summarize', 'generate_code', 'extract_data'."),
  entities: z.array(z.object({
    name: z.string().describe('Name of the entity.'),
    type: z.string().describe("Type of the entity, e.g., 'person', 'organization', 'product'.")
  })).optional().describe('List of key entities mentioned in the prompt.'),
  constraints: z.array(z.string().describe('Specific constraints or requirements for the output, e.g., "max_length: 200 words", "tone: formal".')).optional(),
  output_format: z.string().optional().describe('Desired output format, e.g., "markdown", "json", "plain_text".'),
  original_prompt: z.string().describe('The original user prompt.')
}).required({ action: true, original_prompt: true }) 