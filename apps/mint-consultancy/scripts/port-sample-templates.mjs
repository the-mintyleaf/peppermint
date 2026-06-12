import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const sampleDir = fs.existsSync(path.join(root, "components", "templates"))
  ? path.join(root, "components", "templates")
  : path.join(root, "sample", "templates");
const portedDir = path.join(root, "modules", "documents", "templates", "ported");

const IMPORT_REPLACEMENTS = [
  [/@mantine\/core/g, "@zetsel/ui"],
  [/@\/components\/templates\/templateprops/g, "@/modules/documents/utils/templatePageProps"],
  [/\.\.\/\.\.\/templateprops/g, "@/modules/documents/utils/templatePageProps"],
  [/\.\.\/\.\.\/\.\.\/templateprops/g, "@/modules/documents/utils/templatePageProps"],
  [/@\/components\/helper\/getDaySuffix/g, "@/modules/documents/utils/templateHelpers"],
  [/@\/components\/helper\/chunkArray/g, "@/modules/documents/utils/templateHelpers"],
  [/@\/components\/layout\/editor\/editor\.context/g, "@/modules/documents/components/TemplateRenderProvider/editor.context"],
  [/@\/components\/framework\/FormHandler/g, "@/modules/documents/components/TemplateRenderProvider/formHandler"],
  [/from "\.\.\/\.\.\/\.\.\/assets\//g, 'from "@/public/documents/assets/'],
  [/from "\.\.\/\.\.\/\.\.\/\.\.\/assets\//g, 'from "@/public/documents/assets/'],
];

function transformContent(content) {
  let result = content;
  for (const [pattern, replacement] of IMPORT_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  // Fix image imports to use public paths
  result = result.replace(
    /import (\w+) from "@\/public\/documents\/assets\/(\w+\.png)";/g,
    'const $1 = { src: "/documents/assets/$2" };'
  );
  return result;
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name.includes("Zone.Identifier")) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (/\.(tsx?|css)$/.test(entry.name)) {
      const content = fs.readFileSync(srcPath, "utf8");
      fs.writeFileSync(destPath, transformContent(content));
    }
  }
}

if (!fs.existsSync(sampleDir)) {
  console.error("Sample templates not found:", sampleDir);
  process.exit(1);
}

if (fs.existsSync(portedDir)) {
  fs.rmSync(portedDir, { recursive: true });
}

copyDir(sampleDir, portedDir);
console.log("Ported templates to", portedDir);
