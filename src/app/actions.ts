"use server";

import { autoImageTagging, type AutoImageTaggingInput } from "@/ai/flows/image-tagging";

export async function generateTagsForImage(
  input: AutoImageTaggingInput
): Promise<string[]> {
  try {
    const output = await autoImageTagging(input);
    return output.tags;
  } catch (error) {
    console.error("Error generating tags:", error);
    return [];
  }
}
