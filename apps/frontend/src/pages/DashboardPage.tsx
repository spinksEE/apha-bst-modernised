import { Link } from 'react-router-dom';

const gdsFont = '"GDS Transport", arial, sans-serif';

const quickActions = [
  { title: 'View Sites', description: 'Browse and manage sampling sites', to: '/sites' },
  { title: 'Register Site', description: 'Add a new sampling site', to: '/sites/register' },
  { title: 'Record Training', description: 'Log a new training event', to: '/training/add' },
  { title: 'Manage Trainers', description: 'View and manage trainers', to: '/trainers' },
  { title: 'Add Person', description: 'Register a new person', to: '/persons/add' },
];

export function DashboardPage(): React.JSX.Element {
  return (
    <>
      <h1
        style={{
          fontFamily: gdsFont,
          fontSize: '36px',
          fontWeight: 700,
          color: '#0b0c0c',
          marginBottom: '30px',
        }}
      >
        Dashboard
      </h1>

      <div
        style={{
          backgroundColor: '#f3f2f1',
          border: '1px solid #b1b4b6',
          padding: '20px',
          marginBottom: '30px',
          fontFamily: gdsFont,
        }}
      >
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0b0c0c', margin: '0 0 10px' }}>
          System Announcements
        </h2>
        <p style={{ fontSize: '16px', color: '#0b0c0c', margin: 0 }}>
          Welcome to the APHA Brainstem Training Schedule system. This is a proof of concept
          application.
        </p>
      </div>

      <h2
        style={{
          fontFamily: gdsFont,
          fontSize: '24px',
          fontWeight: 700,
          color: '#0b0c0c',
          marginBottom: '20px',
        }}
      >
        Quick Navigation
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '20px',
        }}
      >
        {quickActions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            style={{
              display: 'block',
              padding: '20px',
              border: '1px solid #b1b4b6',
              textDecoration: 'none',
              color: '#0b0c0c',
              fontFamily: gdsFont,
            }}
          >
            <h3
              style={{
                fontSize: '19px',
                fontWeight: 700,
                color: '#1d70b8',
                margin: '0 0 10px',
              }}
            >
              {action.title}
            </h3>
            <p style={{ fontSize: '16px', margin: 0, color: '#505a5f' }}>{action.description}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
