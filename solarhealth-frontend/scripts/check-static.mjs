import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const errors = [];

function scanDirectory(dir, relativePath = "") {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relativeFilePath = path.join(relativePath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Check for dynamic route segments
      if (file.includes("[") && file.includes("]")) {
        // Check if generateStaticParams exists
        const pageFile = path.join(fullPath, "page.tsx");
        const pageFile2 = path.join(fullPath, "page.ts");
        if (fs.existsSync(pageFile) || fs.existsSync(pageFile2)) {
          const content = fs.existsSync(pageFile) 
            ? fs.readFileSync(pageFile, "utf-8")
            : fs.readFileSync(pageFile2, "utf-8");
          if (!content.includes("generateStaticParams")) {
            errors.push(`Dynamic route ${relativeFilePath} missing generateStaticParams`);
          }
        }
      }
      
      // Skip node_modules and .next
      if (file !== "node_modules" && file !== ".next" && file !== "out") {
        scanDirectory(fullPath, relativeFilePath);
      }
    } else if (file.endsWith(".ts") || file.endsWith(".tsx") || file.endsWith(".js") || file.endsWith(".jsx")) {
      const content = fs.readFileSync(fullPath, "utf-8");
      
      // Check for SSR/ISR/Edge functions
      if (content.includes("getServerSideProps")) {
        errors.push(`${relativeFilePath}: getServerSideProps is not allowed`);
      }
      if (content.includes("getStaticProps") && !content.includes("generateStaticParams")) {
        errors.push(`${relativeFilePath}: getStaticProps without generateStaticParams is not allowed`);
      }
      if (content.includes("export const runtime = 'edge'")) {
        errors.push(`${relativeFilePath}: Edge runtime is not allowed`);
      }
      if (content.includes("server-only")) {
        errors.push(`${relativeFilePath}: server-only import is not allowed`);
      }
      if (content.includes("next/headers")) {
        errors.push(`${relativeFilePath}: next/headers is not allowed`);
      }
      if (content.includes("cookies()")) {
        errors.push(`${relativeFilePath}: cookies() is not allowed`);
      }
      if (content.includes("dynamic = 'force-dynamic'")) {
        errors.push(`${relativeFilePath}: force-dynamic is not allowed`);
      }
    }
  }
}

// Check for API routes
const appDir = path.join(rootDir, "app");
if (fs.existsSync(appDir)) {
  const apiDir = path.join(appDir, "api");
  if (fs.existsSync(apiDir)) {
    errors.push("app/api directory is not allowed for static export");
  }
}

const pagesDir = path.join(rootDir, "pages");
if (fs.existsSync(pagesDir)) {
  const apiDir = path.join(pagesDir, "api");
  if (fs.existsSync(apiDir)) {
    errors.push("pages/api directory is not allowed for static export");
  }
}

// Scan app directory
if (fs.existsSync(appDir)) {
  scanDirectory(appDir, "app");
}

// Scan pages directory if exists
if (fs.existsSync(pagesDir)) {
  scanDirectory(pagesDir, "pages");
}

if (errors.length > 0) {
  console.error("\n❌ Static export violations found:\n");
  errors.forEach(err => console.error(`  - ${err}`));
  console.error("\n");
  process.exit(1);
} else {
  console.log("✅ No static export violations found");
}


