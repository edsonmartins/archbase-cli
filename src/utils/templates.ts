import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * Test and story templates share a common fallback under `common/`.
 *
 * Returns the shared template content, or null when the requested template is
 * not a test/story template or no common fallback file exists. Callers use the
 * null result to fall through to their own default template.
 */
export async function resolveCommonTemplateFallback(
  templatesPath: string,
  templateName: string,
): Promise<string | null> {
  const isTest = templateName.endsWith('test.hbs');
  const isStory = templateName.endsWith('story.hbs');
  if (!isTest && !isStory) {
    return null;
  }

  const commonName = isTest ? 'common/test.hbs' : 'common/story.hbs';
  const commonPath = path.join(templatesPath, commonName);
  if (await fs.pathExists(commonPath)) {
    return fs.readFile(commonPath, 'utf-8');
  }

  return null;
}
