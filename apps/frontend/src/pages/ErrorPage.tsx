import { Link } from 'react-router-dom';

const gdsFont = '"GDS Transport", arial, sans-serif';

interface ErrorPageProps {
  errorRef: string;
  resetError: () => void;
}

export function ErrorPage({ errorRef, resetError }: ErrorPageProps): React.JSX.Element {
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
        An Error Occurred
      </h1>
      <p style={{ fontSize: '19px', color: '#0b0c0c', marginBottom: '10px' }}>
        Sorry, there was a problem with the application.
      </p>
      <p style={{ fontSize: '19px', color: '#0b0c0c', marginBottom: '10px' }}>
        Error reference: <strong data-testid="error-reference">{errorRef}</strong>
      </p>
      <p style={{ fontSize: '16px', color: '#505a5f', marginBottom: '30px' }}>
        Please quote this reference if you report the problem.
      </p>
      <Link
        to="/"
        onClick={resetError}
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
