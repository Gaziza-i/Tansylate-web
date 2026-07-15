import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import { createServer } from "http";
import net from "net";
import path from "path";
import fs from "fs";
import multer from "multer";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { runStartupMigrations } from "./migrate";
import { sdk } from "./sdk";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user || user.role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  } catch {
    res.status(403).json({ error: "Forbidden" });
  }
}

function requireSitePassword(req: Request, res: Response, next: NextFunction) {
  if (process.env.SITE_PASSWORD_PROTECT !== "true") {
    next();
    return;
  }
  const expectedUser = (process.env.ADMIN_USERNAME || "admin").trim();
  const expectedPass = process.env.ADMIN_PASSWORD?.trim();
  if (!expectedPass) {
    next();
    return;
  }
  const header = req.headers.authorization;
  if (header?.startsWith("Basic ")) {
    const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
    const sep = decoded.indexOf(":");
    const user = decoded.slice(0, sep);
    const pass = decoded.slice(sep + 1);
    if (user === expectedUser && pass === expectedPass) {
      next();
      return;
    }
  }
  res.set("WWW-Authenticate", 'Basic realm="Tansylate"');
  res.status(401).send("Требуется авторизация");
}

async function startServer() {
  await runStartupMigrations();
  const app = express();
  const server = createServer(app);

  app.use(requireSitePassword);

  const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
  fs.mkdirSync(uploadsDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || ".jpg";
      const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
      cb(null, `${base}_${Date.now()}${ext}`);
    },
  });
  const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Допустимы только JPEG, PNG и WebP"));
  };
  const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 }, fileFilter });

  // Static file serving
  app.use("/uploads", express.static(uploadsDir));

  app.get("/api/uploads", requireAdmin, (_req, res) => {
    try {
      const files = fs.readdirSync(uploadsDir)
        .filter(f => /\.(jpe?g|png|gif|webp|svg|avif)$/i.test(f))
        .sort((a, b) => {
          try {
            return fs.statSync(path.join(uploadsDir, b)).mtimeMs - fs.statSync(path.join(uploadsDir, a)).mtimeMs;
          } catch { return 0; }
        })
        .map(f => `/uploads/${f}`);
      res.json(files);
    } catch {
      res.json([]);
    }
  });

  app.delete("/api/uploads/:filename", requireAdmin, (req, res) => {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(uploadsDir, filename);
    try {
      fs.unlinkSync(filePath);
      res.json({ ok: true });
    } catch {
      res.status(404).json({ error: "File not found" });
    }
  });

  app.get("/api/upload-status", (_req, res) => {
    const writable = (() => {
      try { fs.accessSync(uploadsDir, fs.constants.W_OK); return true; } catch { return false; }
    })();
    const files = (() => {
      try { return fs.readdirSync(uploadsDir).length; } catch { return -1; }
    })();
    res.json({ ok: true, uploadsDir, writable, files });
  });

  app.post("/api/upload", requireAdmin, (req, res) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        console.error("[upload] multer error:", err.message);
        res.status(400).json({ error: err.message });
        return;
      }
      if (!req.file) { res.status(400).json({ error: "No file received" }); return; }
      console.log("[upload] saved:", req.file.filename, req.file.size, "bytes");
      res.json({ url: `/uploads/${req.file.filename}` });
    });
  });

  // Body parser for JSON/form routes below
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
