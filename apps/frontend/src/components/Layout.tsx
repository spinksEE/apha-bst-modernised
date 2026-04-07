import { Link, Outlet } from 'react-router-dom';

export function Layout(): React.JSX.Element {
  return (
    <>
      <a href="#main-content" className="govuk-skip-link">
        Skip to main content
      </a>

      <header
        style={{
          backgroundColor: '#0b0c0c',
          borderBottom: '10px solid #1d70b8',
          color: '#ffffff',
          padding: '10px 0',
        }}
      >
        <div
          style={{
            maxWidth: '1020px',
            margin: '0 auto',
            padding: '0 15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Link
            to="/"
            style={{
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '24px',
              fontFamily: '"GDS Transport", arial, sans-serif',
            }}
          >
            APHA BST
          </Link>
          <nav aria-label="Main navigation">
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                gap: '20px',
                margin: 0,
                padding: 0,
              }}
            >
              <li>
                <Link
                  to="/sites/register"
                  style={{
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontFamily: '"GDS Transport", arial, sans-serif',
                    fontSize: '16px',
                  }}
                >
                  Register Site
                </Link>
              </li>
              <li>
                <Link
                  to="/sites"
                  style={{
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontFamily: '"GDS Transport", arial, sans-serif',
                    fontSize: '16px',
                  }}
                >
                  View Sites
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <div
        style={{
          maxWidth: '1020px',
          margin: '0 auto',
          padding: '0 15px',
        }}
      >
        <div
          style={{
            backgroundColor: '#1d70b8',
            color: '#ffffff',
            padding: '5px 8px',
            display: 'inline-block',
            marginTop: '10px',
            fontFamily: '"GDS Transport", arial, sans-serif',
            fontSize: '14px',
          }}
        >
          <strong>ALPHA</strong>
          <span style={{ marginLeft: '8px' }}>
            This is a new service — your feedback will help us improve it.
          </span>
        </div>
      </div>

      <main
        id="main-content"
        role="main"
        style={{
          maxWidth: '1020px',
          margin: '0 auto',
          padding: '20px 15px 40px',
        }}
      >
        <Outlet />
      </main>

      <footer
        style={{
          backgroundColor: '#f3f2f1',
          borderTop: '1px solid #b1b4b6',
          padding: '25px 0',
          marginTop: '40px',
        }}
      >
        <div
          style={{
            maxWidth: '1020px',
            margin: '0 auto',
            padding: '0 15px',
            fontFamily: '"GDS Transport", arial, sans-serif',
            fontSize: '14px',
            color: '#505a5f',
          }}
        >
          APHA Brainstem Training Schedule
        </div>
      </footer>
    </>
  );
}
