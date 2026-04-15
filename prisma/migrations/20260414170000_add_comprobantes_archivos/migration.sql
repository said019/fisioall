-- CreateTable
CREATE TABLE "comprobantes_archivos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "mime_type" VARCHAR(80) NOT NULL,
    "data" BYTEA NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comprobantes_archivos_pkey" PRIMARY KEY ("id")
);
