import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, Button } from '@mantine/core';
import { ErrorBoundary } from './ErrorBoundary';
import { ErrorPage } from '../pages/ErrorPage';

const gdsFont = '"GDS Transport", arial, sans-serif';

const menuItemStyle: React.CSSProperties = {
  fontFamily: gdsFont,
  fontSize: '16px',
  color: '#0b0c0c',
};

export function Layout(): React.JSX.Element {
  const location = useLocation();

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
          fontFamily: gdsFont,
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
              fontFamily: gdsFont,
            }}
          >
            APHA BST
          </Link>
          <span
            style={{
              color: '#ffffff',
              fontFamily: gdsFont,
              fontSize: '16px',
            }}
          >
            Hello, Smith, J (Supv)
          </span>
        </div>
      </header>

      <nav
        aria-label="Main navigation"
        style={{
          backgroundColor: '#f3f2f1',
          borderBottom: '1px solid #b1b4b6',
        }}
      >
        <div
          style={{
            maxWidth: '1020px',
            margin: '0 auto',
            padding: '0 15px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Link
            to="/"
            style={{
              fontFamily: gdsFont,
              fontSize: '16px',
              fontWeight: 700,
              color: '#0b0c0c',
              textDecoration: 'none',
              padding: '10px 15px',
            }}
          >
            Home
          </Link>

          <Menu trigger="click-hover" position="bottom-start" shadow="md">
            <Menu.Target>
              <Button
                variant="subtle"
                color="dark"
                styles={{
                  root: {
                    fontFamily: gdsFont,
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#0b0c0c',
                    padding: '10px 15px',
                    height: 'auto',
                    border: 'none',
                    borderRadius: 0,
                    backgroundColor: 'transparent',
                  },
                }}
              >
                Brainstem ▾
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item component={Link} to="/training/add" style={menuItemStyle}>
                Add Training
              </Menu.Item>
              <Menu.Item component={Link} to="/trainers" style={menuItemStyle}>
                Manage Trainers
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          <Menu trigger="click-hover" position="bottom-start" shadow="md">
            <Menu.Target>
              <Button
                variant="subtle"
                color="dark"
                styles={{
                  root: {
                    fontFamily: gdsFont,
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#0b0c0c',
                    padding: '10px 15px',
                    height: 'auto',
                    border: 'none',
                    borderRadius: 0,
                    backgroundColor: 'transparent',
                  },
                }}
              >
                Sites ▾
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item component={Link} to="/sites" style={menuItemStyle}>
                View All Sites
              </Menu.Item>
              <Menu.Item component={Link} to="/sites/register" style={menuItemStyle}>
                Add New Site
              </Menu.Item>
              <Menu.Item component={Link} to="/persons/add" style={menuItemStyle}>
                Add Person
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </nav>

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
            fontFamily: gdsFont,
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
        <ErrorBoundary
          key={location.pathname}
          fallbackRender={({ errorRef, resetError }) => (
            <ErrorPage errorRef={errorRef} resetError={resetError} />
          )}
        >
          <Outlet />
        </ErrorBoundary>
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
            fontFamily: gdsFont,
            fontSize: '14px',
            color: '#505a5f',
          }}
        >
          APHA BST System v2.0 POC | Crown Copyright 2026
        </div>
      </footer>
    </>
  );
}
