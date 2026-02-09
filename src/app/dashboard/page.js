async function getCustomers() {
  const API_URL = process.env.API_URL_PREFIX;

  const res = await fetch(`${API_URL}/customer`, { cache: "no-store" });

  return res.json();
}

export default async function DashboardPage() {
  const data = await getCustomers();
  
  return (
    <main className="container py-5">
      <h1 className="mb-3">
        <i className="fa-solid fa-gauge me-2"></i>
        Dashboard
      </h1>

      <pre className="bg-light p-3 rounded">{JSON.stringify(data, null, 2)}</pre>

      <a className="btn btn-secondary" href="/">
        <i className="fa-solid fa-arrow-left me-2"></i>
        Back
      </a>
    </main>
  );
}