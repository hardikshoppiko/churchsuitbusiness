export const metadata = {
  title: "Maintenance Mode",
};

export default function MaintenancePage() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center p-4">
        <h1 className="mb-3 fw-bold">We'll be back soon</h1>
        <p className="text-muted mb-4">
          Our website is currently under maintenance.
          <br />
          Please check back later.
        </p>

        <div className="text-muted small">
          © {new Date().getFullYear()} MyAffiliate
        </div>
      </div>
    </div>
  );
}