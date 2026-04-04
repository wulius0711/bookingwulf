import { prisma } from '@/src/lib/prisma';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditApartmentPage({ params }: PageProps) {
  const { id } = await params;
  const apartmentId = Number(id);

  if (!Number.isInteger(apartmentId)) {
    return <div style={{ padding: 40, fontFamily: 'Arial' }}>ID fehlt</div>;
  }

  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
    include: { images: true },
  });

  if (!apartment) {
    notFound();
  }

  return (
    <main style={{ padding: 40, fontFamily: 'Arial' }}>
      <h1>Apartment bearbeiten</h1>
      <p>ID: {id}</p>
      <p>Name: {apartment.name}</p>
    </main>
  );
}
