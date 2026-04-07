import { Link, Outlet } from 'react-router-dom';

export function Layout(): React.JSX.Element {
  return (
    <>
      <a
        href="#main-content"
        className="govuk-skip-link"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          margin: 0,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          clipPath: 'inset(50%)',
          whiteSpace: 'nowrap',
          fontSize: '16px',
          fontFamily: '"GDS Transport", arial, sans-serif',
          color: '#0b0c0c',
          backgroundColor: '#fd0',
          padding: '10px 15px',
          textDecoration: 'underline',
          textDecorationThickness: 'max(3px, .1875rem)',
          textUnderlineOffset: '.1578em',
        }}
        onFocus={(e) => {
          const el = e.currentTarget;
          el.style.position = 'static';
          el.style.width = 'auto';
          el.style.height = 'auto';
          el.style.margin = '0';
          el.style.overflow = 'visible';
          el.style.clip = 'auto';
          el.style.clipPath = 'none';
          el.style.whiteSpace = 'normal';
        }}
        onBlur={(e) => {
          const el = e.currentTarget;
          el.style.position = 'absolute';
          el.style.width = '1px';
          el.style.height = '1px';
          el.style.margin = '0';
          el.style.overflow = 'hidden';
          el.style.clip = 'rect(0 0 0 0)';
          el.style.clipPath = 'inset(50%)';
          el.style.whiteSpace = 'nowrap';
        }}
      >
        Skip to main content
      </a>

      <header
        role="banner"
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
        tabIndex={-1}
        style={{
          maxWidth: '1020px',
          margin: '0 auto',
          padding: '20px 15px 40px',
          outline: 'none',
        }}
      >
        <Outlet />
      </main>

      <footer
        role="contentinfo"
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
