// Patches Prisma Client's default.js to avoid #main-entry-point subpath import
// which Turbopack cannot resolve during next build.
// Run after every `prisma generate`.
const fs = require("fs");
const path = require("path");

const target = path.join(__dirname, "..", "node_modules", ".prisma", "client", "default.js");
if (fs.existsSync(target)) {
  const content = fs.readFileSync(target, "utf-8");
  if (content.includes("#main-entry-point")) {
    const patched = content.replace(
      "require('#main-entry-point')",
      "require('./index')"
    );
    fs.writeFileSync(target, patched);
    console.log("[patch-prisma] Patched default.js successfully.");
  } else {
    console.log("[patch-prisma] Already patched, skipping.");
  }
} else {
  console.log("[patch-prisma] default.js not found, skipping.");
}