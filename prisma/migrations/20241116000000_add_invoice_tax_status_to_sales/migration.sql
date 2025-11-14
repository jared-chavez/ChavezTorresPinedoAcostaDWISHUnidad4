-- AlterTable: Agregar campos invoiceNumber, taxAmount, totalAmount, status a la tabla sales

-- Agregar columna invoiceNumber (única)
ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "invoiceNumber" TEXT;

-- Generar números de factura para ventas existentes usando CTE
WITH numbered_sales AS (
  SELECT 
    id,
    'INV-' || TO_CHAR("saleDate", 'YYYYMMDD') || '-' || LPAD(
      ROW_NUMBER() OVER (PARTITION BY DATE("saleDate") ORDER BY "saleDate", id)::TEXT,
      4,
      '0'
    ) AS new_invoice_number
  FROM "sales"
  WHERE "invoiceNumber" IS NULL
)
UPDATE "sales" s
SET "invoiceNumber" = ns.new_invoice_number
FROM numbered_sales ns
WHERE s.id = ns.id;

-- Hacer invoiceNumber único y NOT NULL
ALTER TABLE "sales" ALTER COLUMN "invoiceNumber" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "sales_invoiceNumber_key" ON "sales"("invoiceNumber");

-- Agregar columna taxAmount (impuestos)
ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Calcular taxAmount para ventas existentes (16% IVA)
UPDATE "sales" 
SET "taxAmount" = ROUND(CAST("salePrice" * 0.16 AS NUMERIC), 2)
WHERE "taxAmount" = 0;

-- Agregar columna totalAmount (total con impuestos)
ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Calcular totalAmount para ventas existentes
UPDATE "sales" 
SET "totalAmount" = ROUND(CAST("salePrice" + "taxAmount" AS NUMERIC), 2)
WHERE "totalAmount" = 0;

-- Agregar columna status (estado de venta)
ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'completed';

-- Crear índices
CREATE INDEX IF NOT EXISTS "sales_invoiceNumber_idx" ON "sales"("invoiceNumber");
CREATE INDEX IF NOT EXISTS "sales_status_idx" ON "sales"("status");
