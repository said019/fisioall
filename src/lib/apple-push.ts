import { SignJWT, importPKCS8 } from "jose";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

function getEnv(key: string): string | undefined {
  return process.env[key];
}

export function isApplePushConfigured(): boolean {
  return Boolean(
    getEnv("APPLE_KEY_ID") &&
    getEnv("APPLE_TEAM_ID") &&
    getEnv("APPLE_APNS_KEY_BASE64") &&
    getEnv("APPLE_PASS_TYPE_ID"),
  );
}

// ---------------------------------------------------------------------------
// APNs JWT token (ES256, valid 1 hour)
// ---------------------------------------------------------------------------

let _cachedToken: { jwt: string; expiresAt: number } | null = null;

async function getAPNsToken(): Promise<string> {
  // Reuse token if still valid (refresh 5 min before expiry)
  if (_cachedToken && Date.now() < _cachedToken.expiresAt - 5 * 60_000) {
    return _cachedToken.jwt;
  }

  const keyId = getEnv("APPLE_KEY_ID")!;
  const teamId = getEnv("APPLE_TEAM_ID")!;
  const keyBase64 = getEnv("APPLE_APNS_KEY_BASE64")!;

  const keyPem = Buffer.from(keyBase64, "base64").toString("utf8");
  const privateKey = await importPKCS8(keyPem, "ES256");

  const now = Math.floor(Date.now() / 1000);
  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: keyId })
    .setIssuer(teamId)
    .setIssuedAt(now)
    .sign(privateKey);

  _cachedToken = { jwt, expiresAt: Date.now() + 60 * 60_000 };
  return jwt;
}

// ---------------------------------------------------------------------------
// Send push to APNs
// ---------------------------------------------------------------------------

async function sendPushToDevice(
  pushToken: string,
  type: "background" | "alert",
  payload: string,
): Promise<boolean> {
  const token = await getAPNsToken();
  const passTypeId = getEnv("APPLE_PASS_TYPE_ID")!;

  const url = `https://api.push.apple.com/3/device/${pushToken}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        authorization: `bearer ${token}`,
        "apns-topic": passTypeId,
        "apns-push-type": type,
        "apns-priority": type === "background" ? "5" : "10",
      },
      body: payload,
    });

    if (res.status === 200) return true;

    if (res.status === 410) {
      // Token invalid — clean up device
      await prisma.appleDevice.deleteMany({
        where: { pushToken },
      });
      console.log(`[apple-push] Removed invalid pushToken: ${pushToken.slice(0, 8)}...`);
      return false;
    }

    const body = await res.text();
    console.error(`[apple-push] APNs ${res.status}: ${body}`);
    return false;
  } catch (error) {
    console.error("[apple-push] Failed to send push:", error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Send a silent background push to all devices registered for this tarjeta.
 * This tells Apple Wallet to fetch the updated pass via the Web Service.
 */
export async function notifyPassUpdate(serialNumber: string): Promise<void> {
  if (!isApplePushConfigured()) return;

  const devices = await prisma.appleDevice.findMany({
    where: { serialNumber },
  });

  if (devices.length === 0) return;

  // Record the update timestamp
  await prisma.applePassUpdate.create({
    data: { serialNumber },
  });

  for (const device of devices) {
    await sendPushToDevice(device.pushToken, "background", "{}");
  }

  console.log(
    `[apple-push] Sent background push to ${devices.length} device(s) for tarjeta ${serialNumber.slice(0, 8)}`,
  );
}

/**
 * Send a visible alert notification + background refresh push.
 */
export async function notifyPassUpdateWithAlert(
  serialNumber: string,
  message: string,
): Promise<void> {
  if (!isApplePushConfigured()) return;

  const devices = await prisma.appleDevice.findMany({
    where: { serialNumber },
  });

  if (devices.length === 0) return;

  // Record the update
  await prisma.applePassUpdate.create({
    data: { serialNumber, message },
  });

  const alertPayload = JSON.stringify({
    aps: {
      alert: { title: "Kaya Kalp", body: message },
      sound: "default",
    },
  });

  for (const device of devices) {
    // Background push to refresh the pass
    await sendPushToDevice(device.pushToken, "background", "{}");
    // Visible alert
    await sendPushToDevice(device.pushToken, "alert", alertPayload);
  }

  console.log(
    `[apple-push] Sent alert push to ${devices.length} device(s): "${message}"`,
  );
}
