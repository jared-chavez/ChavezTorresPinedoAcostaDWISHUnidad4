import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { vehicleDB } from '@/lib/db';
import Navbar from '@/components/Navbar';
import LandingNavbar from '@/components/LandingNavbar';
import VehicleDetail from '@/components/VehicleDetail';

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  
  // Permitir acceso público (solo lectura)
  // No redirigir si no hay sesión

  const { id } = await params;
  const vehicle = await vehicleDB.findById(id);

  if (!vehicle) {
    redirect('/inventory');
  }

  return (
    <>
      {session ? <Navbar /> : <LandingNavbar />}
      <VehicleDetail vehicle={vehicle} session={session} />
    </>
  );
}

