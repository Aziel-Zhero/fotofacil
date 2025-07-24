'use server';

/**
 * @fileOverview This file defines a Genkit flow for automatically tagging images using AI.
 *
 * - autoImageTagging - A function that accepts an image data URI and returns a list of tags.
 * - AutoImageTaggingInput - The input type for the autoImageTagging function.
 * - AutoImageTaggingOutput - The return type for the autoImageTagging function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoImageTaggingInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AutoImageTaggingInput = z.infer<typeof AutoImageTaggingInputSchema>;

const AutoImageTaggingOutputSchema = z.object({
  tags: z.array(z.string()).describe('A list of tags describing the image.'),
});
export type AutoImageTaggingOutput = z.infer<typeof AutoImageTaggingOutputSchema>;

export async function autoImageTagging(input: AutoImageTaggingInput): Promise<AutoImageTaggingOutput> {
  return autoImageTaggingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autoImageTaggingPrompt',
  input: {schema: AutoImageTaggingInputSchema},
  output: {schema: AutoImageTaggingOutputSchema},
  prompt: `You are an expert image tagger.  Given the following image, generate a list of comma-separated tags that describe the image.  Focus on concrete nouns; do not include abstract concepts like "beauty".

Image: {{media url=photoDataUri}}

Tags: `,
});

const autoImageTaggingFlow = ai.defineFlow(
  {
    name: 'autoImageTaggingFlow',
    inputSchema: AutoImageTaggingInputSchema,
    outputSchema: AutoImageTaggingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
