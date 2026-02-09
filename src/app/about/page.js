export default function AboutPage() {
  return (
    <main className="container py-5">
      <h1 className="mb-3">
        <i className="fa-solid fa-address-card me-2"></i>
        About
      </h1>

      <p>This project is ready for MySQL APIs and future Stripe subscription setup.</p>

      <a className="btn btn-secondary" href="/">
        <i className="fa-solid fa-arrow-left me-2"></i>
        Back
      </a>
    </main>
  );
}