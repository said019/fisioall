-- Garantiza una sola fila inicial por (tenant, paciente, tipo)
-- y una sola fila de seguimiento por (tenant, paciente, tipo, cita).
-- Antes del fix, el server action hacía create() en cada save y la tabla acumulaba duplicados.

CREATE UNIQUE INDEX "expediente_inicial_unico"
  ON "expedientes_especializados" ("tenant_id", "paciente_id", "tipo")
  WHERE "es_inicial" = true;

CREATE UNIQUE INDEX "expediente_seguimiento_unico"
  ON "expedientes_especializados" ("tenant_id", "paciente_id", "tipo", "cita_id")
  WHERE "es_inicial" = false AND "cita_id" IS NOT NULL;
