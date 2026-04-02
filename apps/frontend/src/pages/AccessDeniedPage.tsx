import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Title,
  Text,
  Button,
  Stack,
  Center,
  Box,
} from '@mantine/core';

function generateReferenceId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `UA-${year}${month}${day}-${hours}${minutes}-${random}`;
}

export function AccessDeniedPage(): React.JSX.Element {
  const navigate = useNavigate();
  const referenceId = useMemo(() => generateReferenceId(), []);

  return (
    <Center mih="100vh" bg="gray.1">
      <Box w={480}>
        <Card shadow="sm" padding="xl" withBorder>
          <Stack gap="md">
            <Title order={2} ta="center" c="red.7" data-testid="access-denied-heading">
              Access Denied
            </Title>

            <Text ta="center">
              You do not have permission to access the Brainstem Training System.
            </Text>

            <Text ta="center" size="sm" c="dimmed">
              This access attempt has been logged and the system administrator has
              been notified.
            </Text>

            <Text ta="center" size="sm" fw={600} data-testid="reference-id">
              Reference: {referenceId}
            </Text>

            <Text ta="center" size="sm" data-testid="contact-info">
              If you believe this is an error, please contact support at{' '}
              <Text component="span" fw={600}>bst-support@apha.gov.uk</Text>
              {' '}or{' '}
              <Text component="span" fw={600}>01234 567890</Text>
            </Text>

            <Button
              fullWidth
              variant="outline"
              data-testid="return-button"
              onClick={() => navigate('/login')}
            >
              Return to Login
            </Button>
          </Stack>
        </Card>
      </Box>
    </Center>
  );
}
