// THE PARCOIL NETWORK //
// THE PARCOIL NETWORK //
// THE PARCOIL NETWORK //
// THE PARCOIL NETWORK //
import { createBareServer } from "@tomphttp/bare-server-node";
import express from "express";
import { createServer } from "node:http";
import { join, dirname } from "node:path";
import { hostname } from "node:os";
import { fileURLToPath } from "url";
import path from "path";
import { createProxyMiddleware } from "http-proxy-middleware";

// Get the directory path of the current module file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicPath = join(__dirname, "public");
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";

const bare = createBareServer("/bare/");
const app = express();

const proxy = createProxyMiddleware("/games", {
  target: "https://gitlab.com/Thedogecraft/assets/-/raw/main/games.json",
  changeOrigin: true, // Change the origin to match the target's origin
  pathRewrite: {
    "^/games": "", // Remove the '/games' path prefix
  },
});
app.use("/games", proxy);
// Load our publicPath first and prioritize it over UV.
app.use(express.static(publicPath));
// Load vendor files last.
// The vendor's uv.config.js won't conflict with our uv.config.js inside the publicPath directory.
app.use("/uv/", express.static(uvPath));

app.get("/emulator", (req, res) => {
  const filePath = path.join(publicPath, "other/emulator/index.html");
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(err);
      res.status(404).send("Games not found");
    }
  });
});

app.get("/form", (req, res) => {
  const filePath = path.join(publicPath, "other/form.html");
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(err);
      res.status(404).send("Games not found");
    }
  });
});

app.get("/credits", (req, res) => {
  const filePath = path.join(publicPath, "other/credits.html");
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(err);
      res.status(404).send("Games not found");
    }
  });
});
// Hand

app.get("/sitemap.gay", (req, res) => {
  const filePath = path.join(publicPath, "other/sitemap.xml");
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(err);
      res.status(404).send("Games not found");
    }
  });
});

// Handle clean URLs
app.get("/:page", (req, res) => {
  const page = req.params.page;
  res.sendFile(path.join(__dirname, `public/${page}.html`));
});
// Error for everything else
app.use((req, res) => {
  res.status(404);
  res.sendFile(join(publicPath, "404.html"));
});

const server = createServer();

server.on("request", (req, res) => {
  if (bare.shouldRoute(req)) {
    bare.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

server.on("upgrade", (req, socket, head) => {
  if (bare.shouldRoute(req)) {
    bare.routeUpgrade(req, socket, head);
  } else {
    socket.end();
  }
});

let port = parseInt(process.env.PORT || "");

if (isNaN(port)) port = 8080;

server.on("listening", () => {
  const address = server.address();

  console.log();
  console.log(`Made by The Parcoil Network :`);
  console.log();
  console.warn(`https://github.com/Parcoil/nativegames.net`);
  console.log();
  console.log(`Nativegames Running on port ${address.port}`);
  console.log();
});

// https://expressjs.com/en/advanced/healthcheck-graceful-shutdown.html
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close();
  bare.close();
  process.exit(0);
}

server.listen({
  port,
});
