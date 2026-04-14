// ---------------------------------------------------------------------------
// Evolution API client – WhatsApp via Baileys
// ---------------------------------------------------------------------------

// ── Types ──────────────────────────────────────────────────────────────────

export interface EvolutionInstanceStatus {
  instanceName: string;
  state: "open" | "close" | "connecting";
}

export interface EvolutionQRCode {
  pairingCode: string | null;
  code: string;
  base64: string;
  count: number;
}

export interface EvolutionSendResult {
  key: { remoteJid: string; fromMe: boolean; id: string };
  message: Record<string, unknown>;
  messageTimestamp: string;
  status: string;
}

export interface EvolutionError {
  status: number;
  error: string;
  message: string | string[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Returns `true` when the three required env vars are present.
 */
export function isConfigured(): boolean {
  return !!(
    process.env.EVOLUTION_API_URL &&
    process.env.EVOLUTION_API_KEY &&
    process.env.EVOLUTION_INSTANCE_NAME
  );
}

/**
 * Normalises a Mexican phone number to WhatsApp JID format.
 *
 * Accepts 10‑digit local numbers (e.g. 3312345678) and returns
 * `52XXXXXXXXXX@s.whatsapp.net`. If the number already contains a
 * country code (starts with 52 and has 12+ digits) it is used as‑is.
 * Non‑digit characters are stripped automatically.
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    return `52${digits}@s.whatsapp.net`;
  }

  // Already has country code
  if (digits.startsWith("52") && digits.length >= 12) {
    return `${digits}@s.whatsapp.net`;
  }

  // Fallback – use as‑is
  return `${digits}@s.whatsapp.net`;
}

// ── Client class ───────────────────────────────────────────────────────────

class EvolutionClient {
  private baseUrl: string;
  private apiKey: string;
  private instance: string;

  constructor(baseUrl: string, apiKey: string, instance: string) {
    // Strip trailing slash
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.apiKey = apiKey;
    this.instance = instance;
  }

  // -- Internal fetch wrapper ------------------------------------------------

  private async request<T>(
    method: "GET" | "POST" | "DELETE",
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      apikey: this.apiKey,
      "Content-Type": "application/json",
    };

    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "unknown error");
      throw new Error(`Evolution API ${method} ${path} – ${res.status}: ${text}`);
    }

    return res.json() as Promise<T>;
  }

  // -- Public methods --------------------------------------------------------

  /** Check current instance connection state. */
  async getStatus(): Promise<EvolutionInstanceStatus> {
    const raw = await this.request<{ instance: EvolutionInstanceStatus } | EvolutionInstanceStatus>(
      "GET",
      `/instance/connectionState/${this.instance}`,
    );
    // Evolution API wraps the response in { instance: {...} }
    if ("instance" in raw && raw.instance) {
      return raw.instance;
    }
    return raw as EvolutionInstanceStatus;
  }

  /**
   * Create the instance (if it doesn't exist) and ask for a new QR code.
   * If the instance is stuck in "connecting" state, deletes and recreates it.
   * Returns the QR payload so the frontend can display it.
   */
  async connectInstance(): Promise<EvolutionQRCode> {
    // 1. Check if instance already exists and its state
    let existingState: string | null = null;
    try {
      const status = await this.getStatus();
      existingState = status.state;
    } catch {
      // Instance doesn't exist yet – that's fine
    }

    // 2. If stuck in "connecting" or "close", delete and start fresh
    if (existingState === "connecting" || existingState === "close") {
      try {
        await this.request("DELETE", `/instance/delete/${this.instance}`);
      } catch {
        // Ignore delete errors
      }
      existingState = null;
    }

    // 3. Create instance if it doesn't exist
    if (!existingState || existingState !== "open") {
      try {
        await this.request("POST", "/instance/create", {
          instanceName: this.instance,
          integration: "WHATSAPP-BAILEYS",
          qrcode: true,
        });
      } catch {
        // instance likely already exists – continue
      }
    }

    // 4. Request QR code
    return this.request<EvolutionQRCode>(
      "GET",
      `/instance/connect/${this.instance}`,
    );
  }

  /** Send a plain text message. */
  async sendText(to: string, message: string): Promise<EvolutionSendResult> {
    const number = to.includes("@") ? to : formatPhone(to);

    return this.request<EvolutionSendResult>(
      "POST",
      `/message/sendText/${this.instance}`,
      { number, text: message },
    );
  }

  /** Send a poll / survey message. */
  async sendPoll(
    to: string,
    title: string,
    options: string[],
  ): Promise<EvolutionSendResult> {
    const number = to.includes("@") ? to : formatPhone(to);

    return this.request<EvolutionSendResult>(
      "POST",
      `/message/sendPoll/${this.instance}`,
      {
        number,
        name: title,
        selectableCount: 1,
        values: options,
      },
    );
  }

  /** Disconnect (logout) the current instance. */
  async logout(): Promise<void> {
    await this.request("DELETE", `/instance/logout/${this.instance}`);
  }
}

// ── Singleton ──────────────────────────────────────────────────────────────

let _client: EvolutionClient | null = null;

/**
 * Returns the singleton Evolution API client.
 * Throws if the required env vars are missing.
 */
export function getEvolutionClient(): EvolutionClient {
  if (_client) return _client;

  const url = process.env.EVOLUTION_API_URL;
  const key = process.env.EVOLUTION_API_KEY;
  const name = process.env.EVOLUTION_INSTANCE_NAME;

  if (!url || !key || !name) {
    throw new Error(
      "Evolution API no configurada. Agrega EVOLUTION_API_URL, EVOLUTION_API_KEY y EVOLUTION_INSTANCE_NAME en .env",
    );
  }

  _client = new EvolutionClient(url, key, name);
  return _client;
}
