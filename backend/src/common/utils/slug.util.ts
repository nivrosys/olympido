import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a clean URL slug with an optional random suffix to guarantee uniqueness.
 */
export function generateSlug(text: string, appendRandomSuffix = true): string {
  const base = slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });

  if (!appendRandomSuffix) {
    return base;
  }

  const suffix = uuidv4().substring(0, 6);
  return `${base}-${suffix}`;
}
