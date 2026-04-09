import { Link } from 'react-router-dom';

const gdsFont = '"GDS Transport", arial, sans-serif';

export function NotFoundPage(): React.JSX.Element {
  return (
    <div style={{ fontFamily: gdsFont }}>
      <h1
        style={{
          fontSize: '36px',
          fontWeight: 700,
          color: '#0b0c0c',
          marginBottom: '20px',
        }}
      >
        Page not found
      </h1>
      <p style={{ fontSize: '19px', color: '#0b0c0c', marginBottom: '20px' }}>
        If you typed the web address, check it is correct.
      </p>
      <p style={{ fontSize: '19px', color: '#0b0c0c', marginBottom: '30px' }}>
        If you pasted the web address, check you copied the entire address.
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-block',
          backgroundColor: '#00703c',
          color: '#ffffff',
          padding: '8px 10px 7px',
          border: '2px solid transparent',
          borderRadius: 0,
          fontSize: '19px',
          fontWeight: 700,
          fontFamily: gdsFont,
          textDecoration: 'none',
          boxShadow: '0 2px 0 #002d18',
        }}
      >
        Return to Home Dashboard
      </Link>
    </div>
  );
}
