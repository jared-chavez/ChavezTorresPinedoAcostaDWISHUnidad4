// API Route para importar ventas desde Excel

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { saleDB, vehicleDB } from '@/lib/db';
import { saleSchema } from '@/lib/validations';
import { generateInvoiceNumber, calculateTax, calculateTotal } from '@/lib/invoice-utils';
import * as XLSX from 'xlsx';

interface ExcelRow {
  VIN?: string;
  'Nombre Cliente'?: string;
  'Email Cliente'?: string;
  'Teléfono Cliente'?: string | number;
  'Precio Venta'?: number | string;
  'Método Pago'?: string;
  'Estado'?: string;
  'Fecha Venta'?: string | Date | number;
  'Notas'?: string;
}

interface ImportError {
  row: number;
  error: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo admin y emprendedores pueden importar ventas
    if (session.user.role !== 'admin' && session.user.role !== 'emprendedores') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Leer el archivo Excel
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'El archivo Excel está vacío' },
        { status: 400 }
      );
    }

    // Obtener todos los vehículos para mapeo rápido
    const allVehicles = await vehicleDB.getAll();
    const vehicleMap = new Map(allVehicles.map(v => [v.vin.toUpperCase(), v]));

    const results = {
      success: 0,
      errors: [] as ImportError[],
    };

    // Procesar cada fila
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 porque la fila 1 es el header y el índice empieza en 0

      try {
        // Validar campos requeridos
        if (!row.VIN || !row['Nombre Cliente'] || !row['Email Cliente'] || !row['Precio Venta']) {
          results.errors.push({
            row: rowNumber,
            error: 'Faltan campos requeridos: VIN, Nombre Cliente, Email Cliente o Precio Venta',
          });
          continue;
        }

        // Buscar vehículo por VIN
        const vin = String(row.VIN).trim().toUpperCase();
        const vehicle = vehicleMap.get(vin);

        if (!vehicle) {
          results.errors.push({
            row: rowNumber,
            error: `Vehículo con VIN "${vin}" no encontrado`,
          });
          continue;
        }

        if (vehicle.status !== 'available') {
          results.errors.push({
            row: rowNumber,
            error: `Vehículo con VIN "${vin}" no está disponible (estado: ${vehicle.status})`,
          });
          continue;
        }

        // Validar y convertir precio
        const salePrice = typeof row['Precio Venta'] === 'string'
          ? parseFloat(row['Precio Venta'].replace(/[^0-9.-]/g, ''))
          : Number(row['Precio Venta']);

        if (isNaN(salePrice) || salePrice <= 0) {
          results.errors.push({
            row: rowNumber,
            error: 'Precio de venta inválido',
          });
          continue;
        }

        // Validar método de pago
        const paymentMethodMap: Record<string, 'cash' | 'credit' | 'financing'> = {
          'cash': 'cash',
          'efectivo': 'cash',
          'credit': 'credit',
          'tarjeta': 'credit',
          'card': 'credit',
          'financing': 'financing',
          'financiamiento': 'financing',
        };

        const paymentMethodInput = String(row['Método Pago'] || 'credit').toLowerCase().trim();
        const paymentMethod = paymentMethodMap[paymentMethodInput] || 'credit';

        // Validar estado
        const statusMap: Record<string, 'completed' | 'pending' | 'cancelled' | 'refunded'> = {
          'completed': 'completed',
          'completada': 'completed',
          'pending': 'pending',
          'pendiente': 'pending',
          'cancelled': 'cancelled',
          'cancelada': 'cancelled',
          'refunded': 'refunded',
          'reembolsada': 'refunded',
        };

        const statusInput = String(row['Estado'] || 'completed').toLowerCase().trim();
        const status = statusMap[statusInput] || 'completed';

        // Validar email
        const email = String(row['Email Cliente']).trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          results.errors.push({
            row: rowNumber,
            error: 'Email inválido',
          });
          continue;
        }

        // Procesar teléfono (opcional)
        let customerPhone: string | undefined;
        if (row['Teléfono Cliente']) {
          const phoneValue = String(row['Teléfono Cliente']).trim();
          // Si es "N/A" o vacío, dejarlo como undefined
          if (phoneValue && phoneValue.toUpperCase() !== 'N/A' && phoneValue !== '') {
            customerPhone = phoneValue;
          }
        }

        // Procesar notas (opcional)
        let notes: string | undefined;
        if (row['Notas']) {
          const notesValue = String(row['Notas']).trim();
          // Si es "N/A" o vacío, dejarlo como undefined
          if (notesValue && notesValue.toUpperCase() !== 'N/A' && notesValue !== '') {
            notes = notesValue;
          }
        }

        // Procesar fecha de venta (opcional)
        let saleDate: Date | undefined;
        if (row['Fecha Venta']) {
          try {
            const dateValue = row['Fecha Venta'];
            if (typeof dateValue === 'number') {
              // Si es un número (serial de Excel), convertir a fecha
              // Excel almacena fechas como números seriales (días desde 1900-01-01)
              const excelEpoch = new Date(1899, 11, 30); // 30 de diciembre de 1899
              const days = Math.floor(dateValue);
              const milliseconds = (dateValue - days) * 86400000; // Fracción del día
              saleDate = new Date(excelEpoch.getTime() + days * 86400000 + milliseconds);
            } else {
              // Intentar parsear como string
              const dateStr = String(dateValue).trim();
              if (dateStr && dateStr.toUpperCase() !== 'N/A' && dateStr !== '') {
                // Intentar diferentes formatos de fecha
                const parsedDate = new Date(dateStr);
                if (!isNaN(parsedDate.getTime())) {
                  saleDate = parsedDate;
                } else {
                  // Intentar formato YYYY-MM-DD
                  const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
                  if (dateMatch) {
                    saleDate = new Date(parseInt(dateMatch[1]), parseInt(dateMatch[2]) - 1, parseInt(dateMatch[3]));
                  } else {
                    // Intentar formato DD/MM/YYYY o MM/DD/YYYY
                    const dateMatch2 = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
                    if (dateMatch2) {
                      // Asumir formato DD/MM/YYYY
                      saleDate = new Date(parseInt(dateMatch2[3]), parseInt(dateMatch2[2]) - 1, parseInt(dateMatch2[1]));
                    }
                  }
                }
              }
            }
          } catch (dateError) {
            // Si hay error al parsear la fecha, usar fecha actual (se establecerá en saleDB.create)
            console.warn(`Error al parsear fecha en fila ${rowNumber}, usando fecha actual:`, dateError);
          }
        }

        // Preparar datos para validación con Zod
        const saleData = {
          vehicleId: vehicle.id,
          customerName: String(row['Nombre Cliente']).trim(),
          customerEmail: email,
          customerPhone,
          salePrice,
          paymentMethod,
          status,
          notes,
        };

        // Validar con Zod
        const validated = saleSchema.parse(saleData);

        // Calcular impuestos y total
        const taxAmount = calculateTax(validated.salePrice);
        const totalAmount = calculateTotal(validated.salePrice, taxAmount);

        // Generar número de factura único
        const invoiceNumber = generateInvoiceNumber();

        // Crear venta
        await saleDB.create({
          invoiceNumber,
          vehicleId: validated.vehicleId,
          userId: session.user.id,
          customerName: validated.customerName,
          customerEmail: validated.customerEmail,
          customerPhone: validated.customerPhone || 'N/A', // Usar "N/A" si no se proporciona
          salePrice: validated.salePrice,
          taxAmount,
          totalAmount,
          paymentMethod: validated.paymentMethod,
          status: validated.status || 'completed',
          notes: validated.notes,
          saleDate: saleDate, // Usar fecha del Excel o undefined (se usará fecha actual por defecto)
        });

        // Actualizar estado del vehículo a "sold"
        await vehicleDB.update(validated.vehicleId, { status: 'sold' });

        results.success++;
      } catch (error) {
        let errorMessage = 'Error desconocido';
        
        if (error instanceof Error) {
          if ('errors' in error) {
            // Error de validación Zod
            const zodError = error as { errors: Array<{ message: string }> };
            errorMessage = zodError.errors.map(e => e.message).join(', ');
          } else {
            errorMessage = error.message;
          }
        }

        results.errors.push({
          row: rowNumber,
          error: errorMessage,
        });
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error al importar ventas:', error);
    return NextResponse.json(
      { error: 'Error al procesar el archivo Excel' },
      { status: 500 }
    );
  }
}

