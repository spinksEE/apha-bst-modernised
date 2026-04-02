import {
  Title,
  Text,
  Paper,
  SimpleGrid,
  Card,
  Group,
  ThemeIcon,
  Stack,
  List,
} from '@mantine/core';
import { UserRole } from '@apha-bst/shared';
import { useAuthStore } from '../stores/auth.store';

interface NavCard {
  title: string;
  testId: string;
  description: string;
  items: string[];
  supervisorOnly?: boolean;
}

const NAV_CARDS: NavCard[] = [
  {
    title: 'Training Records',
    testId: 'nav-training',
    description: 'Manage brainstem training records and certifications',
    items: ['Record New Training', 'View Training Records', 'Cascade Training'],
  },
  {
    title: 'Site Management',
    testId: 'nav-sites',
    description: 'Register and manage sampling sites',
    items: ['Register New Site', 'View Sites', 'Site Personnel'],
  },
  {
    title: 'Personnel Management',
    testId: 'nav-personnel',
    description: 'Manage personnel and trainer records',
    items: ['Add New Person', 'Search Personnel', 'Manage Trainers'],
  },
  {
    title: 'Reports',
    testId: 'nav-reports',
    description: 'Generate reports and export data',
    items: ['Generate Complete Report', 'Export to Excel'],
  },
  {
    title: 'User Management',
    testId: 'nav-user-management',
    description: 'Manage user accounts and permissions',
    items: ['Create User', 'View Users', 'Audit Log'],
    supervisorOnly: true,
  },
];

export function HomePage(): React.JSX.Element {
  const user = useAuthStore((s) => s.user);

  const visibleCards = NAV_CARDS.filter(
    (card) => !card.supervisorOnly || user?.userLevel === UserRole.Supervisor,
  );

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder data-testid="welcome-banner">
        <Title order={2}>
          Welcome, {user?.userName}
        </Title>
        <Text size="sm" c="dimmed" mt="xs">
          Role: {user?.userLevel} | Location: {user?.locationName}
        </Text>
      </Paper>

      <SimpleGrid
        cols={{ base: 1, sm: 2 }}
        spacing="md"
        data-testid="nav-grid"
      >
        {visibleCards.map((card) => (
          <Card
            key={card.testId}
            withBorder
            padding="lg"
            data-testid={card.testId}
          >
            <Group mb="xs">
              <ThemeIcon variant="light" size="lg">
                <Text size="sm" fw={700}>
                  {card.title.charAt(0)}
                </Text>
              </ThemeIcon>
              <Title order={4}>{card.title}</Title>
            </Group>
            <Text size="sm" c="dimmed" mb="sm">
              {card.description}
            </Text>
            <List size="sm" spacing="xs">
              {card.items.map((item) => (
                <List.Item key={item}>{item}</List.Item>
              ))}
            </List>
          </Card>
        ))}
      </SimpleGrid>

      <Paper p="md" withBorder data-testid="announcements-panel">
        <Title order={4} mb="xs">
          System Announcements
        </Title>
        <Text size="sm" c="dimmed">
          No current system announcements.
        </Text>
      </Paper>
    </Stack>
  );
}
