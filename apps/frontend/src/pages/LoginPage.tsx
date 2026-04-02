import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Stack,
  Center,
  Box,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import axios from 'axios';
import { login } from '../api/auth';
import { useAuthStore } from '../stores/auth.store';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage(): React.JSX.Element {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    initialValues: {
      username: '',
      password: '',
    },
    validate: zodResolver(loginSchema),
  });

  async function handleSubmit(values: LoginFormValues): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      const response = await login(values.username, values.password);
      setAuth(response.accessToken, {
        userId: response.user.userId,
        userName: response.user.userName,
        userLevel: response.user.userLevel,
        userLocation: response.user.userLocation,
        locationName: response.user.locationName,
        sessionId: '',
      });
      navigate('/');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 403) {
          navigate('/access-denied');
          return;
        }
        if (err.response?.status === 401) {
          setError('Invalid username or password. Please try again.');
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Center mih="100vh" bg="gray.1">
      <Box w={420}>
        <form data-testid="login-form" onSubmit={form.onSubmit(handleSubmit)}>
          <Card shadow="sm" padding="xl" withBorder>
            <Stack gap="md">
              <Title order={2} ta="center">
                Brainstem Training System
              </Title>

              <TextInput
                label="Username"
                placeholder="Enter your username"
                data-testid="username-input"
                {...form.getInputProps('username')}
              />

              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                data-testid="password-input"
                {...form.getInputProps('password')}
              />

              {error && (
                <Text c="red" size="sm" data-testid="login-error">
                  {error}
                </Text>
              )}

              <Button
                type="submit"
                fullWidth
                loading={loading}
                data-testid="login-submit"
              >
                Sign in
              </Button>
            </Stack>
          </Card>

          <Text ta="center" size="sm" c="dimmed" mt="md">
            APHA BST System 2026
          </Text>
        </form>
      </Box>
    </Center>
  );
}
