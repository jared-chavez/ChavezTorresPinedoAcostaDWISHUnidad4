import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { prisma } from '@/lib/prisma';
import { vehicleDB } from '@/lib/db';

// Verificar que la BD está disponible
const isDatabaseAvailable = process.env.DATABASE_URL && 
  process.env.DATABASE_URL.includes('postgresql') &&
  !process.env.DATABASE_URL.includes('test_db');

describe('Vehicle Images BLOB Relation Tests', () => {
  // Skip si la BD no está disponible
  if (!isDatabaseAvailable) {
    console.log('⚠️  Saltando tests de BD: DATABASE_URL no configurada o es BD de test');
    return;
  }

  let testVehicleId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Crear un usuario de prueba
    const testUser = await prisma.user.create({
      data: {
        email: `test_vehicle_images_${Date.now()}@test.com`,
        name: 'Test User',
        password: 'hashedpassword',
        role: 'admin',
        emailVerified: true,
      } as any,
    });
    testUserId = testUser.id;
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    if (testVehicleId) {
      // Eliminar vehículo (las imágenes se eliminarán automáticamente por CASCADE)
      await prisma.vehicle.deleteMany({
        where: {
          id: testVehicleId,
        },
      });
    }
    
    if (testUserId) {
      await prisma.user.deleteMany({
        where: {
          id: testUserId,
        },
      });
    }
  });

  it('should create vehicle with BLOB images and establish relationship', async () => {
    // Crear archivos de imagen simulados (Buffer)
    const image1Buffer = Buffer.from('fake-image-data-1');
    const image2Buffer = Buffer.from('fake-image-data-2');

    // Crear objetos File simulados
    const image1File = new File([image1Buffer], 'test1.jpg', { type: 'image/jpeg' });
    const image2File = new File([image2Buffer], 'test2.png', { type: 'image/png' });

    const imageFiles = [image1File, image2File];

    // Crear vehículo con imágenes
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
      description: 'Test vehicle with BLOB images',
      images: [],
      createdBy: testUserId,
    }, imageFiles);

    testVehicleId = vehicle.id;

    // Verificar que el vehículo se creó
    expect(vehicle).toBeDefined();
    expect(vehicle.id).toBeDefined();
    expect(vehicle.images?.length || 0).toBeGreaterThan(0);

    // Verificar que las imágenes se guardaron en la BD
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vehicleImages = await (prisma as any).vehicleImage.findMany({
      where: {
        vehicleId: vehicle.id,
      },
      orderBy: {
        order: 'asc',
      },
    });

    // Verificar cantidad de imágenes
    expect(vehicleImages.length).toBe(2);

    // Verificar que cada imagen tiene el vehicleId correcto
    vehicleImages.forEach((image: any) => {
      expect(image.vehicleId).toBe(vehicle.id);
      expect(image.imageData).toBeDefined();
      expect(image.mimeType).toMatch(/^image\/(jpeg|png|webp)$/);
    });

    // Verificar que la primera imagen es JPEG
    expect(vehicleImages[0].mimeType).toBe('image/jpeg');
    expect(vehicleImages[0].order).toBe(0);

    // Verificar que la segunda imagen es PNG
    expect(vehicleImages[1].mimeType).toBe('image/png');
    expect(vehicleImages[1].order).toBe(1);

    // Verificar que los datos BLOB están presentes
    expect(vehicleImages[0].imageData).toBeInstanceOf(Buffer);
    expect(vehicleImages[1].imageData).toBeInstanceOf(Buffer);
  });

  it('should retrieve vehicle with BLOB images and correct URLs', async () => {
    if (!testVehicleId) {
      console.log('⚠️  Saltando test: no hay vehículo de prueba');
      return;
    }

    // Recuperar vehículo
    const vehicle = await vehicleDB.findById(testVehicleId);

    expect(vehicle).toBeDefined();
    expect((vehicle?.images?.length || 0)).toBeGreaterThan(0);

    // Verificar que las URLs tienen el formato correcto
    (vehicle?.images || []).forEach((imageUrl) => {
      if (imageUrl.startsWith('/api/vehicles/')) {
        expect(imageUrl).toMatch(/^\/api\/vehicles\/[^/]+\/image\/[^/]+$/);
      }
    });
  });

  it('should delete vehicle images when vehicle is deleted (CASCADE)', async () => {
    if (!testVehicleId) {
      console.log('⚠️  Saltando test: no hay vehículo de prueba');
      return;
    }

    // Verificar que hay imágenes antes de eliminar
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imagesBefore = await (prisma as any).vehicleImage.findMany({
      where: {
        vehicleId: testVehicleId,
      },
    });
    expect(imagesBefore.length).toBeGreaterThan(0);

    // Eliminar vehículo
    await prisma.vehicle.delete({
      where: {
        id: testVehicleId,
      },
    });

    // Verificar que las imágenes se eliminaron automáticamente (CASCADE)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imagesAfter = await (prisma as any).vehicleImage.findMany({
      where: {
        vehicleId: testVehicleId,
      },
    });
    expect(imagesAfter.length).toBe(0);

    // Limpiar testVehicleId para que afterAll no intente eliminar de nuevo
    testVehicleId = '';
  });

  it('should retrieve all vehicles with their BLOB images', async () => {
    // Crear otro vehículo de prueba con imágenes
    const imageBuffer = Buffer.from('fake-image-data');
    const imageFile = new File([imageBuffer], 'test.jpg', { type: 'image/jpeg' });

    const vehicle = await vehicleDB.create({
      brand: 'Test Brand 2',
      model: 'Test Model 2',
      year: 2024,
      color: 'Blue',
      price: 25000,
      mileage: 1000,
      fuelType: 'electric',
      transmission: 'automatic',
      status: 'available',
      vin: `TESTVIN2${Date.now()}`,
      description: 'Test vehicle 2',
      images: [],
      createdBy: testUserId,
    }, [imageFile]);

    // Recuperar todos los vehículos
    const vehicles = await vehicleDB.getAll();

    // Verificar que el vehículo está en la lista
    const foundVehicle = vehicles.find(v => v.id === vehicle.id);
    expect(foundVehicle).toBeDefined();
    expect((foundVehicle?.images?.length || 0)).toBeGreaterThan(0);

    // Limpiar
    await prisma.vehicle.delete({
      where: {
        id: vehicle.id,
      },
    });
  });
});

