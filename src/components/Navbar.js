export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <a className="navbar-brand fw-semibold" href="/">
          <i className="fa-solid fa-bolt me-2"></i>
          MyAffiliate
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link" href="/">
                <i className="fa-solid fa-house me-2"></i>
                Home
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="/about">
                <i className="fa-solid fa-circle-info me-2"></i>
                About
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="/dashboard">
                <i className="fa-solid fa-gauge me-2"></i>
                Dashboard
              </a>
            </li>
          </ul>

          <div className="d-flex gap-2">
            <a className="btn btn-outline-light btn-sm" href="/login">
              <i className="fa-solid fa-right-to-bracket me-2"></i>
              Login
            </a>
            <a className="btn btn-warning btn-sm" href="/register">
              <i className="fa-solid fa-user-plus me-2"></i>
              Register
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}