/**
 * Colorizer export/import utilities
 * Handles file naming, validation, and JSON serialization
 */

/**
 * Sanitizes a colorizer name to be OS-compatible for filenames
 * Removes or replaces invalid characters for Windows, macOS, and Linux
 */
export function sanitizeColorizerName(name: string): string {
  if (!name || typeof name !== 'string') {
    return 'colorizer';
  }

  // Remove or replace invalid filename characters
  // Invalid on Windows: < > : " / \ | ? *
  // Invalid on macOS/Linux: / and null character
  let sanitized = name
    .replace(/[<>:"|?*]/g, '-') // Replace invalid Windows chars
    .replace(/\//g, '-') // Replace forward slashes
    .replace(/\\/g, '-') // Replace backslashes
    .trim();

  // Remove leading/trailing dots and spaces (invalid on some systems)
  sanitized = sanitized.replace(/^[\s.]+|[\s.]+$/g, '');

  // Limit length to 200 chars (leave room for .json extension and COLORIZER. prefix)
  if (sanitized.length > 200) {
    sanitized = sanitized.substring(0, 200);
  }

  // If empty after sanitization, use default
  if (!sanitized) {
    sanitized = 'colorizer';
  }

  return sanitized;
}

/**
 * Generates the standard export filename for a colorizer
 */
export function getColorizerExportFilename(colorizerName: string): string {
  const sanitized = sanitizeColorizerName(colorizerName);
  return `COLORIZER.${sanitized}.json`;
}

/**
 * Extracts colorizer name from export filename
 * Reverses the getColorizerExportFilename operation
 */
export function extractColorizerNameFromFilename(
  filename: string
): string | null {
  const regex = /^COLORIZER\.(.+)\.json$/i;
  const match = filename.match(regex);
  return match ? match[1] : null;
}

/**
 * Validates a colorizer name
 */
export function isValidColorizerName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }

  // Name must be at least 1 character (after trimming)
  if (name.trim().length === 0) {
    return false;
  }

  // Name must not be too long
  if (name.length > 255) {
    return false;
  }

  return true;
}
