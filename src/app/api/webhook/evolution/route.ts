// ---------------------------------------------------------------------------
// Webhook endpoint for Evolution API events
// POST /api/webhook/evolution
// Public – no auth required. Must always return 200.
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";

// ── Types ──────────────────────────────────────────────────────────────────

interface EvolutionWebhookPayload {
  event: string;
  instance: string;
  data: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface MessageData {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message?: {
    conversation?: string;
    extendedTextMessage?: { text: string };
    pollUpdateMessage?: Record<string, unknown>;
  };
  pushName?: string;
  messageTimestamp?: number;
}

// ── Handlers ───────────────────────────────────────────────────────────────

function handleConnectionUpdate(instance: string, data: Record<string, unknown>) {
  const state = data.state ?? data.status;
  console.log(`[Evolution][${instance}] connection.update → ${state}`);
}

function handleQRCodeUpdated(instance: string, data: Record<string, unknown>) {
  console.log(
    `[Evolution][${instance}] qrcode.updated → count: ${data.count ?? "?"}`,
  );
}

function handleMessagesUpsert(instance: string, data: Record<string, unknown>) {
  const messages = (data.messages ?? data) as MessageData[] | MessageData;
  const list = Array.isArray(messages) ? messages : [messages];

  for (const msg of list) {
    const from = msg.key?.remoteJid ?? "unknown";
    const fromMe = msg.key?.fromMe ?? false;

    // Skip our own outgoing messages
    if (fromMe) continue;

    // -- Poll response detection --
    if (msg.message?.pollUpdateMessage) {
      console.log(
        `[Evolution][${instance}] poll response from ${from}:`,
        JSON.stringify(msg.message.pollUpdateMessage),
      );
      // TODO: persist poll response to DB
      continue;
    }

    // -- Text message --
    const text =
      msg.message?.conversation ??
      msg.message?.extendedTextMessage?.text;

    if (text) {
      console.log(
        `[Evolution][${instance}] text from ${from} (${msg.pushName ?? "?"}): ${text}`,
      );
      // TODO: persist incoming message to DB
    }
  }
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as EvolutionWebhookPayload;
    const { event, instance, data } = body;

    switch (event) {
      case "connection.update":
        handleConnectionUpdate(instance, data);
        break;
      case "qrcode.updated":
        handleQRCodeUpdated(instance, data);
        break;
      case "messages.upsert":
        handleMessagesUpsert(instance, data);
        break;
      default:
        console.log(`[Evolution][${instance}] unhandled event: ${event}`);
    }
  } catch (err) {
    // Log but never fail – webhooks must return 200
    console.error("[Evolution] webhook error:", err);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
