import type { ZodError } from 'zod';

export function formatZodError(error: ZodError) {
  return error.issues.map((issue) => `${issue.path.join(' ')}: ${issue.message}`).join(', ');
}
