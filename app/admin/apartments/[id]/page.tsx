type PageProps = {
  params: {
    id: string;
  };
};

export default function EditApartmentPage({ params }: PageProps) {
  return (
    <main style={{ padding: 40, fontFamily: 'Arial' }}>
      <h1>Test Edit Page</h1>
      <p>ID: {params.id}</p>
    </main>
  );
}
