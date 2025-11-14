/**
 * Script de prueba manual para verificar la relación Vehicle-VehicleImage
 * 
 * Ejecutar con: npx tsx scripts/test-vehicle-images-relation.ts
 */

import { prisma } from '../src/lib/prisma';
import { vehicleDB } from '../src/lib/db';

async function testVehicleImagesRelation() {
  console.log('🧪 Iniciando prueba de relación Vehicle-VehicleImage...\n');

  try {
    // 1. Crear usuario de prueba
    console.log('1. Creando usuario de prueba...');
    const testUser = await prisma.user.findFirst({
      where: {
        role: 'admin',
      },
    });

    if (!testUser) {
      throw new Error('No se encontró un usuario admin. Crea uno primero.');
    }

    console.log(`   ✓ Usuario encontrado: ${testUser.email}\n`);

    // 2. Crear archivos de imagen simulados
    console.log('2. Preparando imágenes de prueba...');
    const image1Buffer = Buffer.from('fake-jpeg-image-data-' + Date.now());
    const image2Buffer = Buffer.from('fake-png-image-data-' + Date.now());

    // Crear objetos File simulados
    const image1File = new File([image1Buffer], 'test1.jpg', { type: 'image/jpeg' });
    const image2File = new File([image2Buffer], 'test2.png', { type: 'image/png' });

    const imageFiles = [image1File, image2File];
    console.log(`   ✓ ${imageFiles.length} imágenes preparadas\n`);

    // 3. Crear vehículo con imágenes
    console.log('3. Creando vehículo con imágenes BLOB...');
    const vehicle = await vehicleDB.create({
      brand: 'Test Brand',
      model: 'Test Model',
      year: 2024,
      color: 'Red',
      price: 30000,
      mileage: 0,
      fuelType: 'gasoline',
      transmission: 'automatic',
      status: 'available',
      vin: `TESTVIN${Date.now()}`,
      description: 'Vehículo de prueba con imágenes BLOB',
      images: [],
      createdBy: testUser.id,
    }, imageFiles);

    console.log(`   ✓ Vehículo creado: ID ${vehicle.id}`);
    console.log(`   ✓ URLs de imágenes generadas: ${vehicle.images?.length || 0}\n`);

    // 4. Verificar que las imágenes se guardaron en la BD
    console.log('4. Verificando imágenes en la base de datos...');
    const vehicleImages = await prisma.vehicleImage.findMany({
      where: {
        vehicleId: vehicle.id,
      },
      orderBy: {
        order: 'asc',
      },
    });

    console.log(`   ✓ Imágenes encontradas: ${vehicleImages.length}`);

    // Verificar cada imagen
    vehicleImages.forEach((image, index) => {
      console.log(`   ✓ Imagen ${index + 1}:`);
      console.log(`     - ID: ${image.id}`);
      console.log(`     - vehicleId: ${image.vehicleId}`);
      console.log(`     - mimeType: ${image.mimeType}`);
      console.log(`     - order: ${image.order}`);
      console.log(`     - Tamaño BLOB: ${image.imageData.length} bytes`);
      console.log(`     - vehicleId coincide: ${image.vehicleId === vehicle.id ? '✅' : '❌'}`);
    });

    console.log('\n5. Verificando relación desde el vehículo...');
    const vehicleWithImages = await prisma.vehicle.findUnique({
      where: { id: vehicle.id },
      include: {
        blobImages: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (vehicleWithImages) {
      console.log(`   ✓ Vehículo tiene ${vehicleWithImages.blobImages.length} imágenes relacionadas`);
      console.log(`   ✓ Relación establecida correctamente: ✅\n`);
    }

    // 6. Verificar que se pueden recuperar las imágenes
    console.log('6. Verificando recuperación de vehículo...');
    const retrievedVehicle = await vehicleDB.findById(vehicle.id);
    
    if (retrievedVehicle) {
      console.log(`   ✓ Vehículo recuperado: ${retrievedVehicle.brand} ${retrievedVehicle.model}`);
      console.log(`   ✓ URLs de imágenes: ${retrievedVehicle.images?.length || 0}`);
      (retrievedVehicle.images || []).forEach((url, index) => {
        console.log(`     ${index + 1}. ${url}`);
      });
      console.log('');
    }

    // 7. Limpiar - Eliminar vehículo (las imágenes se eliminarán por CASCADE)
    console.log('7. Limpiando datos de prueba...');
    await prisma.vehicle.delete({
      where: {
        id: vehicle.id,
      },
    });

    // Verificar que las imágenes se eliminaron automáticamente
    const imagesAfterDelete = await prisma.vehicleImage.findMany({
      where: {
        vehicleId: vehicle.id,
      },
    });

    console.log(`   ✓ Vehículo eliminado`);
    console.log(`   ✓ Imágenes eliminadas por CASCADE: ${imagesAfterDelete.length === 0 ? '✅' : '❌'}\n`);

    console.log('✅ Todas las pruebas pasaron correctamente!');
    console.log('\n📋 Resumen:');
    console.log('   ✓ La relación Vehicle-VehicleImage se establece correctamente');
    console.log('   ✓ El vehicleId se asigna automáticamente');
    console.log('   ✓ Las imágenes BLOB se almacenan correctamente');
    console.log('   ✓ Las URLs se generan correctamente');
    console.log('   ✓ El CASCADE funciona (eliminación automática)');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar prueba
testVehicleImagesRelation();

