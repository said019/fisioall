import { createHash } from "crypto";
import { deflateRawSync } from "zlib";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

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
  telefono: string;
  tenantId: string;
}

// ---------------------------------------------------------------------------
// Environment helpers
// ---------------------------------------------------------------------------

function getEnv(key: string): string | undefined {
  return process.env[key];
}

/**
 * Returns true when all required Apple Wallet env vars are set AND the
 * certificate files exist on disk.
 */
export function isAppleWalletConfigured(): boolean {
  const teamId = getEnv("APPLE_TEAM_ID");
  const passTypeId = getEnv("APPLE_PASS_TYPE_ID");
  const certPath = getEnv("APPLE_CERT_PATH");
  const keyPath = getEnv("APPLE_KEY_PATH");
  const wwdrPath = getEnv("APPLE_WWDR_PATH");

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
 * Returns an array of { name, data } entries to include in the .pkpass ZIP.
 */
function loadPassImages(): { name: string; data: Buffer }[] {
  const walletDir = resolve(process.cwd(), "public", "wallet");
  const imageFiles = [
    "icon.png",
    "icon@2x.png",
    "icon@3x.png",
    "logo.png",
    "logo@2x.png",
    "strip.png",
    "strip@2x.png",
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

  return {
    formatVersion: 1,
    serialNumber: tarjeta.id,
    passTypeIdentifier: passTypeId,
    teamIdentifier: teamId,
    organizationName: KAYA_KALP.organizationName,
    description: KAYA_KALP.description,
    logoText: KAYA_KALP.logoText,
    foregroundColor: KAYA_KALP.foregroundColor,
    backgroundColor: KAYA_KALP.backgroundColor,
    labelColor: KAYA_KALP.labelColor,

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

    // Loyalty card (storeCard) style
    storeCard: {
      headerFields: [
        {
          key: "sellos",
          label: "SELLOS",
          value: `${tarjeta.sellosUsados} / ${tarjeta.sellosTotal}`,
        },
      ],
      primaryFields: [
        {
          key: "nombre",
          label: "PACIENTE",
          value: `${paciente.nombre} ${paciente.apellido}`,
        },
      ],
      secondaryFields: [
        {
          key: "recompensa",
          label: "RECOMPENSA",
          value: tarjeta.recompensa,
        },
        {
          key: "restantes",
          label: "SELLOS RESTANTES",
          value: sellosRestantes,
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
                dateStyle: "PKDateStyleShort",
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
 * Minimal ZIP (PKZIP) archive builder.
 * Apple expects an uncompressed ZIP with specific entries.
 */
function buildZip(entries: { name: string; data: Buffer }[]): Buffer {
  const parts: Buffer[] = [];
  const centralDir: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    // Local file header
    const nameBuffer = Buffer.from(entry.name, "utf-8");
    const header = Buffer.alloc(30 + nameBuffer.length);
    header.writeUInt32LE(0x04034b50, 0); // local file header signature
    header.writeUInt16LE(20, 4); // version needed
    header.writeUInt16LE(0, 6); // flags
    header.writeUInt16LE(0, 8); // compression: stored
    header.writeUInt16LE(0, 10); // mod time
    header.writeUInt16LE(0, 12); // mod date
    const crc = crc32(entry.data);
    header.writeUInt32LE(crc, 14);
    header.writeUInt32LE(entry.data.length, 18); // compressed size
    header.writeUInt32LE(entry.data.length, 22); // uncompressed size
    header.writeUInt16LE(nameBuffer.length, 26); // name length
    header.writeUInt16LE(0, 28); // extra length
    nameBuffer.copy(header, 30);

    parts.push(header, entry.data);

    // Central directory entry
    const cdEntry = Buffer.alloc(46 + nameBuffer.length);
    cdEntry.writeUInt32LE(0x02014b50, 0);
    cdEntry.writeUInt16LE(20, 4);
    cdEntry.writeUInt16LE(20, 6);
    cdEntry.writeUInt16LE(0, 8);
    cdEntry.writeUInt16LE(0, 10);
    cdEntry.writeUInt16LE(0, 12);
    cdEntry.writeUInt16LE(0, 14);
    cdEntry.writeUInt32LE(crc, 16);
    cdEntry.writeUInt32LE(entry.data.length, 20);
    cdEntry.writeUInt32LE(entry.data.length, 24);
    cdEntry.writeUInt16LE(nameBuffer.length, 28);
    cdEntry.writeUInt16LE(0, 30); // extra length
    cdEntry.writeUInt16LE(0, 32); // comment length
    cdEntry.writeUInt16LE(0, 34); // disk number
    cdEntry.writeUInt16LE(0, 36); // internal attrs
    cdEntry.writeUInt32LE(0, 38); // external attrs
    cdEntry.writeUInt32LE(offset, 42);
    nameBuffer.copy(cdEntry, 46);
    centralDir.push(cdEntry);

    offset += header.length + entry.data.length;
  }

  const cdBuffer = Buffer.concat(centralDir);
  const cdOffset = offset;

  // End of central directory
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(cdBuffer.length, 12);
  eocd.writeUInt32LE(cdOffset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...parts, cdBuffer, eocd]);
}

/**
 * CRC-32 (used by ZIP format).
 */
function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Generates a signed .pkpass buffer ready to be served to the client.
 *
 * Returns `null` if Apple Wallet is not configured (missing certs / env vars).
 *
 * NOTE: The actual PKCS#7 signing (detached CMS signature) requires the
 * Apple-issued certificate, private key, and Apple WWDR intermediate cert.
 * When those are provided via env vars, this function produces a fully valid
 * .pkpass file. Until then it returns null.
 */
export async function generateLoyaltyPass(
  tarjeta: TarjetaLealtad,
  paciente: Paciente,
): Promise<Buffer | null> {
  if (!isAppleWalletConfigured()) {
    return null;
  }

  const certPath = resolve(getEnv("APPLE_CERT_PATH")!);
  const keyPath = resolve(getEnv("APPLE_KEY_PATH")!);
  const wwdrPath = resolve(getEnv("APPLE_WWDR_PATH")!);

  // 1. Build pass.json
  const passJson = generatePassJson(tarjeta, paciente);
  const passJsonBuffer = Buffer.from(JSON.stringify(passJson), "utf-8");

  // 2. Build manifest.json (SHA-1 hash of every file in the pass)
  const imageFiles = loadPassImages();
  const files: { name: string; data: Buffer }[] = [
    { name: "pass.json", data: passJsonBuffer },
    ...imageFiles,
  ];

  const manifest: Record<string, string> = {};
  for (const file of files) {
    manifest[file.name] = sha1(file.data);
  }
  const manifestBuffer = Buffer.from(JSON.stringify(manifest), "utf-8");

  // 3. Create PKCS#7 detached signature of the manifest
  //    This uses OpenSSL via child_process because Node.js crypto doesn't
  //    natively support CMS/PKCS#7 detached signatures in the way Apple
  //    requires. In production you would shell out to `openssl smime`.
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
        `-inkey "${keyPath}" -out "${sigPath}" -outform DER -passin pass:`,
      { stdio: "pipe" },
    );

    signatureBuffer = readFileSync(sigPath);

    // Clean up temp files
    unlinkSync(manifestPath);
    unlinkSync(sigPath);
  } catch (error) {
    console.error("[wallet-apple] Failed to sign pass:", error);
    return null;
  }

  // 4. Assemble .pkpass (ZIP archive)
  const zipEntries = [
    ...files,
    { name: "manifest.json", data: manifestBuffer },
    { name: "signature", data: signatureBuffer },
  ];

  return buildZip(zipEntries);
}
