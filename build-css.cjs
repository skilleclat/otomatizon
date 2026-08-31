const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");

async function buildCss() {
  console.log("Compiling Tailwind CSS...");
  const cssInput = fs.readFileSync(path.join(__dirname, "src/app/globals.css"), "utf8");
  const twConfig = path.join(__dirname, "tailwind.config.ts");

  const result = await postcss([
    tailwindcss({
      config: {
        darkMode: "class",
        content: [
          "./src/**/*.{js,ts,jsx,tsx}",
          "./index.html"
        ],
        theme: {
          extend: {
            colors: {
              background: "#09090d",
              foreground: "#f2f0e9",
              brand: {
                50: "#f4f8f6",
                500: "#499170",
                600: "#367458",
                700: "#2d5d47",
                800: "#264a3a",
                900: "#1f3c30",
                950: "#0f211a",
              },
              obsidian: {
                950: "#08080b",
                900: "#0e0e13",
                850: "#14141b",
                800: "#1a1a23",
                700: "#262633",
                600: "#363647",
              }
            }
          }
        }
      }
    }),
    autoprefixer
  ]).process(cssInput, {
    from: "src/app/globals.css",
    to: "public/style.css"
  });

  if (!fs.existsSync("public")) {
    fs.mkdirSync("public", { recursive: true });
  }

  fs.writeFileSync("public/style.css", result.css);
  console.log(`Tailwind CSS successfully compiled! Size: ${(result.css.length / 1024).toFixed(1)} KB`);
}

buildCss().catch(console.error);
