import { SignJWT, importPKCS8 } from "jose";

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
 * Returns true when all required Google Wallet env vars are set.
 */
export function isGoogleWalletConfigured(): boolean {
  const issuerId = getEnv("GOOGLE_ISSUER_ID");
  const saEmail = getEnv("GOOGLE_SA_EMAIL");
  const saPrivateKey = getEnv("GOOGLE_SA_PRIVATE_KEY");

  return Boolean(issuerId && saEmail && saPrivateKey);
}

// ---------------------------------------------------------------------------
// Kaya Kalp brand constants
// ---------------------------------------------------------------------------

const KAYA_KALP_HEX = "#1e3a4f"; // dark navy background
const KAYA_KALP_BASE_URL = process.env.NEXT_PUBLIC_URL || "https://kayakalp.com.mx";

// ---------------------------------------------------------------------------
// Google Wallet loyalty object builder
// ---------------------------------------------------------------------------

/**
 * Builds the Google Wallet LoyaltyClass + LoyaltyObject payload.
 */
function buildLoyaltyPayload(
  tarjeta: TarjetaLealtad,
  paciente: Paciente,
): { loyaltyClasses: unknown[]; loyaltyObjects: unknown[] } {
  const issuerId = getEnv("GOOGLE_ISSUER_ID")!;
  const classId = `${issuerId}.kayakalp_lealtad`;
  const objectId = `${issuerId}.${tarjeta.id.replace(/-/g, "")}`;

  const sellosRestantes = tarjeta.sellosTotal - tarjeta.sellosUsados;

  const loyaltyClass = {
    id: classId,
    issuerName: "Kaya Kalp",
    programName: "Tarjeta de Lealtad",
    programLogo: {
      sourceUri: {
        uri: `${KAYA_KALP_BASE_URL}/wallet/google-logo.png`,
        description: "Kaya Kalp Logo",
      },
    },
    wideProgramLogo: {
      sourceUri: {
        uri: `${KAYA_KALP_BASE_URL}/wallet/google-wide-logo.png`,
        description: "Kaya Kalp",
      },
    },
    heroImage: {
      sourceUri: {
        uri: `${KAYA_KALP_BASE_URL}/wallet/google-hero.png`,
        description: "Kaya Kalp — Dando vida a tu cuerpo",
      },
    },
    hexBackgroundColor: KAYA_KALP_HEX,
    reviewStatus: "UNDER_REVIEW",
    multipleDevicesAndHoldersAllowedStatus: "MULTIPLE_HOLDERS",
    countryCode: "MX",
    localizedIssuerName: "Kaya Kalp — Fisioterapia",
    // Location — San Juan del Río, Querétaro
    locations: [
      {
        latitude: 20.3898,
        longitude: -99.9968,
      },
    ],
  };

  const loyaltyObject = {
    id: objectId,
    classId,
    state: tarjeta.estado === "activa" ? "ACTIVE" : "EXPIRED",
    accountId: paciente.id,
    accountName: `${paciente.nombre} ${paciente.apellido}`,
    loyaltyPoints: {
      label: "Sellos",
      balance: {
        int: tarjeta.sellosUsados,
      },
    },
    textModulesData: [
      {
        header: "Recompensa",
        body: tarjeta.recompensa,
      },
      {
        header: "Sellos restantes",
        body: `${sellosRestantes} de ${tarjeta.sellosTotal}`,
      },
    ],
    infoModuleData: {
      labelValueRows: [
        {
          columns: [
            { label: "Estado", value: tarjeta.estado === "activa" ? "Activa" : tarjeta.estado },
            {
              label: "Expira",
              value: tarjeta.fechaExpiracion
                ? tarjeta.fechaExpiracion.toISOString().slice(0, 10)
                : "Sin expiración",
            },
          ],
        },
      ],
    },
    barcode: {
      type: "QR_CODE",
      value: tarjeta.id,
      alternateText: tarjeta.id.slice(0, 8),
    },
    // Location-based notification
    locations: [
      {
        latitude: 20.3898,
        longitude: -99.9968,
      },
    ],
  };

  return {
    loyaltyClasses: [loyaltyClass],
    loyaltyObjects: [loyaltyObject],
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generates a "Save to Google Wallet" URL for the given loyalty card.
 *
 * Returns `null` if Google Wallet is not configured (missing env vars).
 *
 * The URL embeds a signed JWT that Google Wallet uses to create or update
 * the loyalty pass on the user's device.
 */
export async function generateGoogleWalletSaveUrl(
  tarjeta: TarjetaLealtad,
  paciente: Paciente,
): Promise<string | null> {
  if (!isGoogleWalletConfigured()) {
    return null;
  }

  const saEmail = getEnv("GOOGLE_SA_EMAIL")!;
  const saPrivateKeyRaw = getEnv("GOOGLE_SA_PRIVATE_KEY")!;

  // The private key may be stored with escaped newlines in the env var
  const saPrivateKey = saPrivateKeyRaw.replace(/\\n/g, "\n");

  const payload = buildLoyaltyPayload(tarjeta, paciente);

  try {
    const privateKey = await importPKCS8(saPrivateKey, "RS256");

    const token = await new SignJWT({
      iss: saEmail,
      aud: "google",
      typ: "savetowallet",
      origins: [KAYA_KALP_BASE_URL],
      payload,
    })
      .setProtectedHeader({ alg: "RS256", typ: "JWT" })
      .setIssuedAt()
      .sign(privateKey);

    return `https://pay.google.com/gp/v/save/${token}`;
  } catch (error) {
    console.error("[wallet-google] Failed to generate save URL:", error);
    return null;
  }
}
