import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const registryDirectory = join(repositoryRoot, "assets", "figma");
const registryFiles = (await readdir(registryDirectory))
  .filter((fileName) => fileName.endsWith(".json"))
  .sort();

const errors = [];
let assetCount = 0;

for (const registryFile of registryFiles) {
  const registryPath = join(registryDirectory, registryFile);
  const registry = JSON.parse(await readFile(registryPath, "utf8"));

  for (const asset of registry.assets ?? []) {
    assetCount += 1;
    const publicPath = join(
      repositoryRoot,
      "public",
      asset.path.replace(/^\/+/, ""),
    );

    try {
      const assetStat = await stat(publicPath);
      if (!assetStat.isFile() || assetStat.size === 0) {
        errors.push(`${registryFile}: ${asset.path} is not a non-empty file`);
        continue;
      }

      const contents = await readFile(publicPath);
      const checksum = createHash("sha256").update(contents).digest("hex");
      if (checksum !== asset.sha256) {
        errors.push(
          `${registryFile}: ${asset.path} checksum is ${checksum}, expected ${asset.sha256}`,
        );
      }
    } catch (error) {
      errors.push(`${registryFile}: ${asset.path} cannot be read (${error.message})`);
    }
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Validated ${assetCount} Figma assets across ${registryFiles.length} registries.`,
  );
}
