import { useParams, useNavigate } from 'react-router-dom';
import {
  TextInput,
  Button,
  Group,
  Title,
  Alert,
  List,
  Loader,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { useSite, useUpdateSiteName } from '../hooks/useSites';
import { AxiosError } from 'axios';

interface ServerError {
  message: string | string[];
  statusCode: number;
}

export function EditSiteNamePage(): React.JSX.Element {
  const { plantNo } = useParams<{ plantNo: string }>();
  const navigate = useNavigate();
  const { data: site, isLoading } = useSite(plantNo ?? null);
  const updateSiteName = useUpdateSiteName();
  const [serverErrors, setServerErrors] = useState<string[]>([]);

  const form = useForm({
    initialValues: {
      new_name: '',
    },
    validate: {
      new_name: (value) => {
        if (!value) return 'Enter a new site name';
        if (value.length > 50) return 'Site name must be 50 characters or fewer';
        return null;
      },
    },
  });

  function handleSubmit(values: { new_name: string }) {
    if (!plantNo) return;

    setServerErrors([]);
    updateSiteName.mutate(
      { plantNo, newName: values.new_name },
      {
        onSuccess: () => {
          navigate(`/sites?selected=${plantNo}`);
        },
        onError: (error) => {
          const axiosError = error as AxiosError<ServerError>;
          const data = axiosError.response?.data;
          if (data) {
            const messages = Array.isArray(data.message) ? data.message : [data.message];
            for (const msg of messages) {
              if (msg.includes('Name') || msg.includes('name')) {
                form.setFieldError('new_name', msg);
              }
            }
            setServerErrors(messages);
          } else {
            setServerErrors(['An unexpected error occurred. Please try again.']);
          }
        },
      },
    );
  }

  if (isLoading) {
    return <Loader data-testid="edit-loading" />;
  }

  if (!site) {
    return (
      <Alert color="red" title="Site not found" data-testid="site-not-found">
        No site found with plant number &quot;{plantNo}&quot;.
      </Alert>
    );
  }

  const allErrors = [
    ...Object.entries(form.errors)
      .filter(([, msg]) => msg)
      .map(([field, msg]) => ({ field, message: String(msg) })),
    ...serverErrors
      .filter((msg) => !Object.values(form.errors).includes(msg))
      .map((msg) => ({ field: '', message: msg })),
  ];

  return (
    <div style={{ maxWidth: '680px' }}>
      <Title
        order={1}
        style={{
          fontFamily: '"GDS Transport", arial, sans-serif',
          fontSize: '36px',
          fontWeight: 700,
          marginBottom: '30px',
        }}
      >
        Edit site name
      </Title>

      {allErrors.length > 0 && form.isTouched() && (
        <Alert
          color="red"
          title="There is a problem"
          mb="lg"
          styles={{
            title: { fontWeight: 700 },
            root: { borderLeft: '5px solid #d4351c' },
          }}
          role="alert"
          data-testid="error-summary"
        >
          <List size="sm">
            {allErrors.map((err, i) => (
              <List.Item key={i}>
                {err.field ? (
                  <a href={`#${err.field}`} style={{ color: '#d4351c' }}>
                    {err.message}
                  </a>
                ) : (
                  <span style={{ color: '#d4351c' }}>{err.message}</span>
                )}
              </List.Item>
            ))}
          </List>
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
        <TextInput
          label="Plant Number"
          value={site.plant_no}
          readOnly
          disabled
          mb="md"
          data-testid="plant-no-readonly"
        />

        <TextInput
          label="Current Name"
          value={site.name}
          readOnly
          disabled
          mb="md"
          data-testid="current-name-readonly"
        />

        <TextInput
          id="new_name"
          label="New Name"
          description="The current name will be preserved in brackets after the new name"
          required
          maxLength={50}
          error={form.errors.new_name}
          {...form.getInputProps('new_name')}
          mb="xl"
          data-testid="new-name-input"
        />

        <Group>
          <Button
            variant="outline"
            color="gray"
            onClick={() => navigate(`/sites?selected=${plantNo}`)}
            data-testid="cancel-button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={updateSiteName.isPending}
            data-testid="save-button"
          >
            Save Changes
          </Button>
        </Group>
      </form>
    </div>
  );
}
