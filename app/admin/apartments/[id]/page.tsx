import { prisma } from '@/src/lib/prisma';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: {
    id: string;
  };
};

export default async function EditApartmentPage({ params }: PageProps) {
  const apartmentId = Number(params.id);

  if (!apartmentId) {
    return <div style={{ padding: 40 }}>ID fehlt</div>;
  }

  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
    include: { images: true },
  });

  if (!apartment) {
    notFound();
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Apartment bearbeiten</h1>
      <p>ID: {params.id}</p>
      <p>Name: {apartment.name}</p>
    </main>
  );
}
