import { createHash } from "crypto";
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "fs";
import { resolve, join } from "path";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const JSZip = require("jszip");
import sharp from "sharp";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TarjetaLealtad {
  id: string;
  tenantId: string;
  pacienteId: string;
  sellosTotal: number;
  sellosUsados: number;
  recompensa: string;
  estado: string;
  fechaCreacion: Date;
  fechaExpiracion: Date | null;
}

interface Paciente {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string | null;
  tenantId: string;
}

// ---------------------------------------------------------------------------
// Environment helpers — supports file paths OR base64-encoded env vars
// ---------------------------------------------------------------------------

function getEnv(key: string): string | undefined {
  return process.env[key];
}

let _certsReady = false;

/**
 * If APPLE_PASS_CERT_BASE64 / _KEY_BASE64 / _WWDR_BASE64 env vars exist,
 * decode them to /tmp/apple-certs/ and set the path env vars so the rest
 * of the code can use them transparently.  This runs at most once.
 */
function ensureCertsFromBase64() {
  if (_certsReady) return;
  _certsReady = true;

  const certB64 = getEnv("APPLE_PASS_CERT_BASE64");
  const keyB64 = getEnv("APPLE_PASS_KEY_BASE64");
  const wwdrB64 = getEnv("APPLE_WWDR_BASE64");

  if (!certB64 || !keyB64 || !wwdrB64) return;

  const dir = join("/tmp", "apple-certs");
  mkdirSync(dir, { recursive: true });

  const certPath = join(dir, "pass.pem");
  const keyPath = join(dir, "pass.key");
  const wwdrPath = join(dir, "wwdr.pem");

  writeFileSync(certPath, Buffer.from(certB64, "base64"));
  writeFileSync(keyPath, Buffer.from(keyB64, "base64"));
  writeFileSync(wwdrPath, Buffer.from(wwdrB64, "base64"));

  // Set path env vars so the rest of the code picks them up
  process.env.APPLE_PASS_CERT = certPath;
  process.env.APPLE_PASS_KEY = keyPath;
  process.env.APPLE_WWDR = wwdrPath;
}

function getCertPath() { return getEnv("APPLE_CERT_PATH") ?? getEnv("APPLE_PASS_CERT"); }
function getKeyPath() { return getEnv("APPLE_KEY_PATH") ?? getEnv("APPLE_PASS_KEY"); }
function getWwdrPath() { return getEnv("APPLE_WWDR_PATH") ?? getEnv("APPLE_WWDR"); }

export function isAppleWalletConfigured(): boolean {
  ensureCertsFromBase64();

  const teamId = getEnv("APPLE_TEAM_ID");
  const passTypeId = getEnv("APPLE_PASS_TYPE_ID");
  const certPath = getCertPath();
  const keyPath = getKeyPath();
  const wwdrPath = getWwdrPath();

  if (!teamId || !passTypeId || !certPath || !keyPath || !wwdrPath) {
    return false;
  }

  return (
    existsSync(resolve(certPath)) &&
    existsSync(resolve(keyPath)) &&
    existsSync(resolve(wwdrPath))
  );
}

// ---------------------------------------------------------------------------
// Kaya Kalp brand constants
// ---------------------------------------------------------------------------

const KAYA_KALP = {
  organizationName: "Kaya Kalp",
  description: "Tarjeta de Lealtad — Kaya Kalp",
  logoText: "Kaya Kalp",
  foregroundColor: "rgb(255, 255, 255)",
  backgroundColor: "rgb(30, 58, 79)",   // #1e3a4f — dark navy
  labelColor: "rgb(168, 207, 224)",      // #a8cfe0 — soft blue
  stripColor: "rgb(63, 168, 124)",       // #3fa87c — accent green
  // San Juan del Río, Querétaro, México
  location: {
    latitude: 20.3898,
    longitude: -99.9968,
    relevantText: "¡Estás cerca de Kaya Kalp! No olvides tu tarjeta de lealtad.",
  },
} as const;

/**
 * Loads wallet pass image assets from public/wallet/.
 * Excludes strip images — those are generated dynamically with stamps.
 */
function loadPassImages(): { name: string; data: Buffer }[] {
  const walletDir = resolve(process.cwd(), "public", "wallet");
  const imageFiles = [
    "icon.png",
    "icon@2x.png",
    "icon@3x.png",
    "logo.png",
    "logo@2x.png",
    "thumbnail.png",
    "thumbnail@2x.png",
  ];

  const entries: { name: string; data: Buffer }[] = [];
  for (const file of imageFiles) {
    const filePath = resolve(walletDir, file);
    if (existsSync(filePath)) {
      entries.push({ name: file, data: readFileSync(filePath) });
    }
  }
  return entries;
}

// ---------------------------------------------------------------------------
// Dynamic strip image generator — draws stamps on the strip background
// ---------------------------------------------------------------------------

/**
 * Generates strip.png and strip@2x.png with stamp circles composited
 * on top of the base strip background image.
 */
async function generateStripImages(
  sellosUsados: number,
  sellosTotal: number,
): Promise<{ name: string; data: Buffer }[]> {
  const walletDir = resolve(process.cwd(), "public", "wallet");

  const baseStripPath = resolve(walletDir, "strip@2x.png");
  const stampFilledPath = resolve(walletDir, "stamp-filled@2x.png");
  const stampEmptyPath = resolve(walletDir, "stamp-empty@2x.png");

  if (!existsSync(stampFilledPath) || !existsSync(stampEmptyPath)) {
    // Fallback: use static strip images
    const entries: { name: string; data: Buffer }[] = [];
    for (const f of ["strip.png", "strip@2x.png"]) {
      const p = resolve(walletDir, f);
      if (existsSync(p)) entries.push({ name: f, data: readFileSync(p) });
    }
    return entries;
  }

  // Apple Wallet strip dimensions (from Apple docs)
  const STRIP_W = 750;
  const STRIP_H = 240;
  const STAMP_SIZE = 68;
  const COLS = 5;
  const ROWS = Math.ceil(sellosTotal / COLS);

  // Resize stamp images
  const stampFilled = await sharp(stampFilledPath)
    .resize(STAMP_SIZE, STAMP_SIZE)
    .toBuffer();
  const stampEmpty = await sharp(stampEmptyPath)
    .resize(STAMP_SIZE, STAMP_SIZE)
    .toBuffer();

  // Calculate positions — evenly spaced grid, vertically centered
  const hGap = Math.round((STRIP_W - COLS * STAMP_SIZE) / (COLS + 1));
  const vGap = Math.round((STRIP_H - ROWS * STAMP_SIZE) / (ROWS + 1));

  const composites: sharp.OverlayOptions[] = [];
  for (let i = 0; i < sellosTotal && i < COLS * ROWS; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = hGap + col * (STAMP_SIZE + hGap);
    const y = vGap + row * (STAMP_SIZE + vGap);

    composites.push({
      input: i < sellosUsados ? stampFilled : stampEmpty,
      left: x,
      top: y,
    });
  }

  // Transparent background — pass backgroundColor (#1e3a4f) shows through
  const strip2x = await sharp({
    create: {
      width: STRIP_W,
      height: STRIP_H,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toBuffer();

  // Generate @1x strip (375 x 120)
  const strip1x = await sharp(strip2x)
    .resize(375, 120)
    .png()
    .toBuffer();

  return [
    { name: "strip.png", data: strip1x as Buffer },
    { name: "strip@2x.png", data: strip2x as Buffer },
  ];
}

// ---------------------------------------------------------------------------
// pass.json generator (always available, even without certs)
// ---------------------------------------------------------------------------

/**
 * Builds the pass.json payload for an Apple Wallet loyalty pass.
 * This function does NOT require certificates and is useful for previewing
 * the pass structure or for testing.
 */
export function generatePassJson(
  tarjeta: TarjetaLealtad,
  paciente: Paciente,
): Record<string, unknown> {
  const teamId = getEnv("APPLE_TEAM_ID") ?? "TEAM_ID_NOT_SET";
  const passTypeId =
    getEnv("APPLE_PASS_TYPE_ID") ?? "pass.com.kayakalp.lealtad";

  const sellosRestantes = tarjeta.sellosTotal - tarjeta.sellosUsados;

  const baseUrl = getEnv("NEXT_PUBLIC_URL") ?? getEnv("SERVER_URL") ?? "";
  const authToken = getEnv("APPLE_AUTH_TOKEN") ?? "";

  return {
    formatVersion: 1,
    serialNumber: tarjeta.id,
    passTypeIdentifier: passTypeId,
    teamIdentifier: teamId,
    organizationName: KAYA_KALP.organizationName,
    description: KAYA_KALP.description,
    // No logoText — only the logo image shows
    foregroundColor: "rgb(255, 255, 255)",
    backgroundColor: KAYA_KALP.backgroundColor,
    labelColor: "rgb(255, 255, 255)",

    // Web Service — enables automatic pass updates via push
    ...(baseUrl && authToken
      ? {
          webServiceURL: baseUrl,
          authenticationToken: authToken,
        }
      : {}),

    // Barcode — encode the tarjeta ID so it can be scanned at the clinic
    barcode: {
      format: "PKBarcodeFormatQR",
      message: tarjeta.id,
      messageEncoding: "iso-8859-1",
    },
    barcodes: [
      {
        format: "PKBarcodeFormatQR",
        message: tarjeta.id,
        messageEncoding: "iso-8859-1",
      },
    ],

    // Geo-fencing — San Juan del Río
    locations: [
      {
        latitude: KAYA_KALP.location.latitude,
        longitude: KAYA_KALP.location.longitude,
        relevantText: KAYA_KALP.location.relevantText,
      },
    ],

    // Loyalty card (storeCard) — strip image shows the stamps
    storeCard: {
      headerFields: [
        {
          key: "sellos",
          label: "SELLOS",
          value: `${tarjeta.sellosUsados} / ${tarjeta.sellosTotal}`,
        },
      ],
      secondaryFields: [
        {
          key: "nombre",
          label: "PACIENTE",
          value: paciente.nombre,
        },
        {
          key: "recompensa",
          label: "RECOMPENSA",
          value: tarjeta.recompensa,
        },
      ],
      auxiliaryFields: [
        {
          key: "estado",
          label: "ESTADO",
          value: tarjeta.estado === "activa" ? "Activa" : tarjeta.estado,
        },
        ...(tarjeta.fechaExpiracion
          ? [
              {
                key: "expira",
                label: "EXPIRA",
                value: tarjeta.fechaExpiracion.toISOString().slice(0, 10),
              },
            ]
          : []),
      ],
      backFields: [
        {
          key: "info",
          label: "Información",
          value:
            "Kaya Kalp — Fisioterapia y Bienestar\nSan Juan del Río, Querétaro\nPresenta esta tarjeta en cada visita para acumular sellos.",
        },
        {
          key: "telefono",
          label: "Tu teléfono registrado",
          value: paciente.telefono,
        },
      ],
    },

    // Voided when the card is fully redeemed or expired
    ...(tarjeta.estado !== "activa" ? { voided: true } : {}),
  };
}

// ---------------------------------------------------------------------------
// .pkpass builder (requires valid Apple certificates)
// ---------------------------------------------------------------------------

/**
 * SHA-1 hash helper used for the manifest.
 */
function sha1(data: Buffer): string {
  return createHash("sha1").update(data).digest("hex");
}

/**
 * Generates a signed .pkpass buffer ready to be served to the client.
 *
 * Returns `null` if Apple Wallet is not configured (missing certs / env vars).
 */
export async function generateLoyaltyPass(
  tarjeta: TarjetaLealtad,
  paciente: Paciente,
): Promise<Buffer | null> {
  if (!isAppleWalletConfigured()) {
    return null;
  }

  const certPath = resolve(getCertPath()!);
  const keyPath = resolve(getKeyPath()!);
  const wwdrPath = resolve(getWwdrPath()!);

  // 1. Build pass.json
  const passJson = generatePassJson(tarjeta, paciente);
  const passJsonBuffer = Buffer.from(JSON.stringify(passJson), "utf-8");

  // 2. Collect all pass files (pass.json + static images + dynamic strip)
  const imageFiles = loadPassImages();
  const stripImages = await generateStripImages(tarjeta.sellosUsados, tarjeta.sellosTotal);
  const files: { name: string; data: Buffer }[] = [
    { name: "pass.json", data: passJsonBuffer },
    ...imageFiles,
    ...stripImages,
  ];

  // 3. Build manifest.json (SHA-1 hash of every file)
  const manifest: Record<string, string> = {};
  for (const file of files) {
    manifest[file.name] = sha1(file.data);
  }
  const manifestBuffer = Buffer.from(JSON.stringify(manifest), "utf-8");

  // 4. Create PKCS#7 detached signature of the manifest via OpenSSL
  let signatureBuffer: Buffer;
  try {
    const { execSync } = await import("child_process");
    const { writeFileSync, unlinkSync, mkdtempSync } = await import("fs");
    const { join } = await import("path");
    const tmpDir = mkdtempSync(join("/tmp", "pkpass-"));
    const manifestPath = join(tmpDir, "manifest.json");
    const sigPath = join(tmpDir, "signature");

    writeFileSync(manifestPath, manifestBuffer);

    execSync(
      `openssl smime -sign -binary -in "${manifestPath}" ` +
        `-certfile "${wwdrPath}" -signer "${certPath}" ` +
        `-inkey "${keyPath}" -out "${sigPath}" -outform DER` +
        (getEnv("APPLE_CERT_PASSWORD")
          ? ` -passin pass:${getEnv("APPLE_CERT_PASSWORD")}`
          : ` -passin pass:`),
      { stdio: "pipe" },
    );

    signatureBuffer = readFileSync(sigPath);

    // Clean up
    unlinkSync(manifestPath);
    unlinkSync(sigPath);
  } catch (error) {
    console.error("[wallet-apple] Failed to sign pass:", error);
    return null;
  }

  // 5. Assemble .pkpass using JSZip (STORE compression for Apple compatibility)
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.name, file.data, { compression: "STORE" });
  }
  zip.file("manifest.json", manifestBuffer, { compression: "STORE" });
  zip.file("signature", signatureBuffer, { compression: "STORE" });

  const pkpassBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "STORE",
  });

  return pkpassBuffer;
}
