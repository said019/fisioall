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

function getIssuerId(): string {
  return getEnv("GOOGLE_ISSUER_ID")!;
}

function getSaEmail(): string {
  return getEnv("GOOGLE_SA_EMAIL")!;
}

function getSaPrivateKey(): string {
  const raw = getEnv("GOOGLE_SA_PRIVATE_KEY")!;
  return raw.replace(/\\n/g, "\n");
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

const KAYA_KALP_HEX = "#1e3a4f";
const KAYA_KALP_BASE_URL =
  process.env.NEXT_PUBLIC_URL || "https://kayakalp.com.mx";
const CLASS_SUFFIX = "kayakalp_lealtad_v1";

// ---------------------------------------------------------------------------
// OAuth2 Access Token (JWT assertion → access_token)
// ---------------------------------------------------------------------------

let _cachedToken: { token: string; expiresAt: number } | null = null;

async function getWalletAccessToken(): Promise<string> {
  // Return cached token if still valid (with 5 min margin)
  if (_cachedToken && _cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return _cachedToken.token;
  }

  const saEmail = getSaEmail();
  const saKey = getSaPrivateKey();
  const privateKey = await importPKCS8(saKey, "RS256");

  const now = Math.floor(Date.now() / 1000);

  const assertion = await new SignJWT({
    iss: saEmail,
    scope: "https://www.googleapis.com/auth/wallet_object.issuer",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })
    .setProtectedHeader({ alg: "RS256" })
    .sign(privateKey);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[wallet-google] OAuth2 token error: ${res.status} ${err}`);
  }

  const data = await res.json();
  _cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };

  return _cachedToken.token;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function safeObjectId(tarjetaId: string): string {
  return tarjetaId.replace(/[^a-zA-Z0-9._+-]/g, "_");
}

function getClassId(): string {
  return `${getIssuerId()}.${CLASS_SUFFIX}`;
}

function getObjectId(tarjetaId: string): string {
  return `${getIssuerId()}.${safeObjectId(tarjetaId)}`;
}

const WALLET_API = "https://walletobjects.googleapis.com/walletobjects/v1";

// ---------------------------------------------------------------------------
// Loyalty Class (template — create once, update as needed)
// ---------------------------------------------------------------------------

function buildLoyaltyClass() {
  const classId = getClassId();

  return {
    id: classId,
    issuerName: "Kaya Kalp",
    programName: "Tarjeta de Lealtad",
    programLogo: {
      sourceUri: {
        uri: `${KAYA_KALP_BASE_URL}/wallet/google-logo.png`,
      },
      contentDescription: {
        defaultValue: { language: "es", value: "Kaya Kalp Logo" },
      },
    },
    heroImage: {
      sourceUri: {
        uri: `${KAYA_KALP_BASE_URL}/wallet/google-hero.png`,
      },
      contentDescription: {
        defaultValue: {
          language: "es",
          value: "Kaya Kalp — Dando vida a tu cuerpo",
        },
      },
    },
    hexBackgroundColor: KAYA_KALP_HEX,
    reviewStatus: "UNDER_REVIEW",
    multipleDevicesAndHoldersAllowedStatus: "MULTIPLE_HOLDERS",
    countryCode: "MX",
    locations: [
      {
        latitude: 20.3898,
        longitude: -99.9968,
      },
    ],
    textModulesData: [
      {
        header: "Bienvenida",
        body: "Completa tus sellos y gana tu recompensa. Presenta esta tarjeta en cada visita.",
        id: "welcome",
      },
    ],
    linksModuleData: {
      uris: [
        {
          uri: KAYA_KALP_BASE_URL,
          description: "Visitar Kaya Kalp",
          id: "website",
        },
      ],
    },
  };
}

/**
 * Creates or updates the LoyaltyClass in Google Wallet.
 */
export async function ensureLoyaltyClass(): Promise<void> {
  if (!isGoogleWalletConfigured()) return;

  const token = await getWalletAccessToken();
  const classId = getClassId();
  const classData = buildLoyaltyClass();

  // Check if exists
  const checkRes = await fetch(`${WALLET_API}/loyaltyClass/${classId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (checkRes.status === 200) {
    // Update existing
    await fetch(`${WALLET_API}/loyaltyClass/${classId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(classData),
    });
    console.log("[wallet-google] Class updated:", classId);
  } else {
    // Create new
    const res = await fetch(`${WALLET_API}/loyaltyClass`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(classData),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[wallet-google] Class create error:", err);
    } else {
      console.log("[wallet-google] Class created:", classId);
    }
  }
}

// ---------------------------------------------------------------------------
// Loyalty Object (individual pass per customer)
// ---------------------------------------------------------------------------

function buildLoyaltyObject(
  tarjeta: TarjetaLealtad,
  paciente: Paciente,
) {
  const objectId = getObjectId(tarjeta.id);
  const classId = getClassId();

  return {
    id: objectId,
    classId,
    state: tarjeta.estado === "activa" ? "ACTIVE" : "EXPIRED",
    accountId: tarjeta.id,
    accountName: `${paciente.nombre} ${paciente.apellido}`,
    loyaltyPoints: {
      label: "SELLOS",
      balance: { int: tarjeta.sellosUsados },
    },
    secondaryLoyaltyPoints: {
      label: "Progreso",
      balance: {
        string: `${tarjeta.sellosUsados}/${tarjeta.sellosTotal}`,
      },
    },
    barcode: {
      type: "QR_CODE",
      value: tarjeta.id,
      alternateText: tarjeta.id.slice(0, 8),
    },
    textModulesData: [
      {
        id: "recompensa",
        header: "Recompensa",
        body: tarjeta.recompensa,
      },
      {
        id: "cliente",
        header: "Cliente",
        body: paciente.nombre,
      },
    ],
    linksModuleData: {
      uris: [
        {
          uri: KAYA_KALP_BASE_URL,
          description: "Kaya Kalp",
          id: "website",
        },
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// Create or Update Loyalty Object via API (real-time updates)
// ---------------------------------------------------------------------------

/**
 * Creates or updates a loyalty object in Google Wallet.
 * Call this when stamps change, reward is redeemed, etc.
 * The pass updates instantly on the user's device.
 */
export async function updateGoogleWalletObject(
  tarjeta: TarjetaLealtad,
  paciente: Paciente,
): Promise<boolean> {
  if (!isGoogleWalletConfigured()) return false;

  try {
    const token = await getWalletAccessToken();
    const objectId = getObjectId(tarjeta.id);
    const loyaltyObject = buildLoyaltyObject(tarjeta, paciente);

    // Try PUT first (update existing)
    const putRes = await fetch(`${WALLET_API}/loyaltyObject/${objectId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loyaltyObject),
    });

    if (putRes.status === 200) {
      console.log(`[wallet-google] Object updated: ${objectId}`);
      return true;
    }

    if (putRes.status === 404) {
      // Object doesn't exist yet (user hasn't saved to wallet)
      // Create it so it's ready when they do
      const postRes = await fetch(`${WALLET_API}/loyaltyObject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loyaltyObject),
      });

      if (postRes.ok) {
        console.log(`[wallet-google] Object created: ${objectId}`);
        return true;
      }

      const err = await postRes.text();
      console.error("[wallet-google] Object create error:", err);
      return false;
    }

    const err = await putRes.text();
    console.error("[wallet-google] Object update error:", err);
    return false;
  } catch (error) {
    console.error("[wallet-google] updateGoogleWalletObject failed:", error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Send push message to a pass
// ---------------------------------------------------------------------------

/**
 * Sends a visible message/notification to a Google Wallet pass.
 */
export async function sendGoogleWalletMessage(
  tarjetaId: string,
  title: string,
  body: string,
): Promise<boolean> {
  if (!isGoogleWalletConfigured()) return false;

  try {
    const token = await getWalletAccessToken();
    const objectId = getObjectId(tarjetaId);
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const now = new Date();
    const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const res = await fetch(
      `${WALLET_API}/loyaltyObject/${objectId}/addMessage`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            header: title,
            body,
            id: messageId,
            messageType: "TEXT",
            displayInterval: {
              start: { date: now.toISOString() },
              end: { date: endTime.toISOString() },
            },
          },
        }),
      },
    );

    if (res.status === 200) {
      console.log(`[wallet-google] Message sent to ${objectId}`);
      return true;
    }

    if (res.status === 404) {
      console.log(`[wallet-google] Object ${objectId} not found (user hasn't saved pass)`);
      return false;
    }

    const err = await res.text();
    console.error("[wallet-google] Message error:", err);
    return false;
  } catch (error) {
    console.error("[wallet-google] sendGoogleWalletMessage failed:", error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Generate "Save to Google Wallet" URL (JWT approach)
// ---------------------------------------------------------------------------

/**
 * Generates a "Save to Google Wallet" URL for the given loyalty card.
 * Returns `null` if Google Wallet is not configured.
 *
 * The JWT contains the loyalty object data. When the user clicks the link,
 * Google creates the object in their wallet.
 */
export async function generateGoogleWalletSaveUrl(
  tarjeta: TarjetaLealtad,
  paciente: Paciente,
): Promise<string | null> {
  if (!isGoogleWalletConfigured()) {
    return null;
  }

  const saEmail = getSaEmail();
  const saKey = getSaPrivateKey();

  // Ensure the class exists before generating a save link
  try {
    await ensureLoyaltyClass();
  } catch (err) {
    console.error("[wallet-google] Failed to ensure class:", err);
  }

  const loyaltyObject = buildLoyaltyObject(tarjeta, paciente);

  try {
    const privateKey = await importPKCS8(saKey, "RS256");

    const token = await new SignJWT({
      iss: saEmail,
      aud: "google",
      typ: "savetowallet",
      origins: [KAYA_KALP_BASE_URL],
      payload: {
        loyaltyObjects: [loyaltyObject],
      },
    })
      .setProtectedHeader({ alg: "RS256" })
      .setIssuedAt()
      .sign(privateKey);

    return `https://pay.google.com/gp/v/save/${token}`;
  } catch (error) {
    console.error("[wallet-google] Failed to generate save URL:", error);
    return null;
  }
}
