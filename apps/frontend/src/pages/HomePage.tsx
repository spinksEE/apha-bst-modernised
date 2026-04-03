import { AppShell } from '../components/AppShell';
import { ReadOnlyNotice, useReadOnlyAccess } from '../components/readOnly';
import { formatUserContext, formatUserRole } from '../components/userContext';
import { useAuthStore } from '../store/auth';
import type { UserContext, UserRole } from '../types/auth';

type NavigationSection = {
  id: string;
  title: string;
  description: string;
  roles: UserRole[];
  items: Record<UserRole, string[]>;
};

const navigationSections: NavigationSection[] = [
  {
    id: 'training-records',
    title: 'Training Records',
    description: 'Access training management functions.',
    roles: ['Supervisor', 'DataEntry', 'ReadOnly'],
    items: {
      Supervisor: ['Create training record', 'Update assessment outcomes', 'View training history'],
      DataEntry: ['Enter training record', 'Update assessment outcomes', 'View training history'],
      ReadOnly: ['View training history', 'Download read-only summary'],
      SystemAdministrator: ['View training history'],
    },
  },
  {
    id: 'site-management',
    title: 'Site Management',
    description: 'Manage APHA locations and facilities.',
    roles: ['Supervisor', 'DataEntry', 'ReadOnly'],
    items: {
      Supervisor: ['Add new site', 'Update site status', 'View site register'],
      DataEntry: ['Update site status', 'View site register'],
      ReadOnly: ['View site register'],
      SystemAdministrator: ['View site register'],
    },
  },
  {
    id: 'personnel-management',
    title: 'Personnel Management',
    description: 'Access trainee and trainer records.',
    roles: ['Supervisor', 'DataEntry', 'ReadOnly'],
    items: {
      Supervisor: ['Add new personnel', 'Assign trainers', 'View personnel directory'],
      DataEntry: ['Assign trainers', 'View personnel directory'],
      ReadOnly: ['View personnel directory'],
      SystemAdministrator: ['View personnel directory'],
    },
  },
  {
    id: 'reports',
    title: 'Reports',
    description: 'Review operational and compliance reports.',
    roles: ['Supervisor', 'DataEntry', 'ReadOnly'],
    items: {
      Supervisor: ['Generate compliance report', 'Export training summary', 'View audit overview'],
      DataEntry: ['View training summary', 'Export read-only report'],
      ReadOnly: ['View training summary', 'Export read-only report'],
      SystemAdministrator: ['View audit overview'],
    },
  },
  {
    id: 'user-management',
    title: 'User Management',
    description: 'Supervisor access only.',
    roles: ['Supervisor'],
    items: {
      Supervisor: ['Manage user access', 'Reset credentials', 'Review role assignments'],
      DataEntry: [],
      ReadOnly: [],
      SystemAdministrator: [],
    },
  },
];

const resolveRoleItems = (section: NavigationSection, role: UserRole): string[] => {
  return section.items[role] ?? [];
};

const getRoleDescription = (role: UserRole): string => {
  switch (role) {
    case 'ReadOnly':
      return 'You have read-only access. Editing actions are disabled.';
    case 'DataEntry':
      return 'You can update operational records within your assigned scope.';
    case 'SystemAdministrator':
      return 'System administration access is limited in this POC build.';
    default:
      return 'You have full access to BST system functions.';
  }
};

export function HomePage(): React.JSX.Element {
  const userContext = useAuthStore((state) => state.userContext);
  const { isReadOnly } = useReadOnlyAccess();

  if (!userContext) {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>BST System - Home</h1>
        <p>Loading...</p>
      </main>
    );
  }

  const userContextLabel = formatUserContext(userContext);
  const userRoleLabel = formatUserRole(userContext.role);
  const visibleSections = navigationSections.filter((section) =>
    section.roles.includes(userContext.role),
  );

  const hasNavigation = visibleSections.length > 0;

  return (
    <AppShell userContext={userContext}>
      <h1 style={{ marginBottom: '1.5rem' }}>BST System - Home</h1>
      <section
        aria-label="User context"
        style={{
          border: '1px solid #cbd5f5',
          borderRadius: '10px',
          padding: '1.5rem 1.75rem',
          background: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <div style={{ fontWeight: 700 }}>{userContextLabel}</div>
        <div style={{ color: '#475569' }}>{getRoleDescription(userContext.role)}</div>
        <ReadOnlyNotice isReadOnly={isReadOnly} />
      </section>

      <section aria-label="Navigation overview" style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Navigation</h2>
        <p style={{ marginTop: 0, color: '#475569' }}>
          Choose a functional area to continue. Items below reflect your {userRoleLabel} access.
        </p>
        {!hasNavigation ? (
          <div
            role="status"
            style={{
              marginTop: '1.5rem',
              padding: '1rem 1.25rem',
              borderRadius: '8px',
              background: '#fff7ed',
              border: '1px solid #fed7aa',
            }}
          >
            We could not load navigation options for your role. Please contact your system
            administrator.
          </div>
        ) : (
          <div
            style={{
              marginTop: '1.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {visibleSections.map((section) => (
              <details
                key={section.id}
                style={{
                  border: '1px solid #d4d8f4',
                  borderRadius: '10px',
                  background: '#ffffff',
                  padding: '1rem 1.25rem',
                  boxShadow: '0 6px 14px rgba(15, 23, 42, 0.06)',
                }}
              >
                <summary
                  style={{
                    listStyle: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontWeight: 700,
                    color: '#0f172a',
                  }}
                >
                  <span>{section.title}</span>
                  <span aria-hidden="true" style={{ fontSize: '1.1rem' }}>
                    ▾
                  </span>
                </summary>
                <p style={{ marginTop: '0.75rem', color: '#475569' }}>{section.description}</p>
                <ul style={{ margin: '0.75rem 0 0', paddingLeft: '1.25rem', color: '#1f2937' }}>
                  {resolveRoleItems(section, userContext.role).map((item) => (
                    <li key={item} style={{ marginBottom: '0.4rem' }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
