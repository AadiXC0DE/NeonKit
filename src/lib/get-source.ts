import { promises as fs } from "fs";
import path from "path";

export async function getExampleSource(
  relativePathFromRepoRoot: string,
): Promise<string> {
  const repoRoot = process.cwd();
  const absolutePath = path.join(repoRoot, relativePathFromRepoRoot);
  const contents = await fs.readFile(absolutePath, "utf8");
  return contents;
}
