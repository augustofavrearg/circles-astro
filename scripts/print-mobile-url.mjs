import { networkInterfaces } from "node:os";

const port = 4321;
let interfaces = {};

try {
  interfaces = networkInterfaces();
} catch {
  // Some containers do not allow inspecting network interfaces. Wix should
  // still start normally in that environment.
}

const addresses = Object.values(interfaces)
  .flatMap((entries) => entries ?? [])
  .filter(
    (entry) =>
      entry.family === "IPv4" &&
      !entry.internal &&
      !entry.address.startsWith("169.254."),
  )
  .map((entry) => entry.address);

console.log("\nAcceso desde un móvil conectado a la misma red:");

if (addresses.length === 0) {
  console.log("  No se pudo detectar la IP. Ejecuta: hostname -I");
} else {
  for (const address of [...new Set(addresses)]) {
    console.log(`  http://${address}:${port}/home`);
  }
}

console.log();
