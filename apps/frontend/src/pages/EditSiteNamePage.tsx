import { useParams, useNavigate } from 'react-router-dom';
import {
  TextInput,
  Button,
  Group,
  Title,
  Alert,
  Loader,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState, useRef } from 'react';
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
  const errorSummaryRef = useRef<HTMLDivElement>(null);

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

  function focusErrorSummary() {
    setTimeout(() => {
      errorSummaryRef.current?.focus();
    }, 0);
  }

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
            focusErrorSummary();
          } else {
            setServerErrors(['An unexpected error occurred. Please try again.']);
            focusErrorSummary();
          }
        },
      },
    );
  }

  function handleValidationFailure() {
    focusErrorSummary();
  }

  if (isLoading) {
    return <Loader data-testid="edit-loading" aria-label="Loading site details" />;
  }

  if (!site) {
    return (
      <Alert color="red" title="Site not found" data-testid="site-not-found" role="alert">
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

  function handleErrorLinkClick(e: React.MouseEvent<HTMLAnchorElement>, fieldId: string) {
    e.preventDefault();
    const el = document.getElementById(fieldId);
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

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
        <div
          ref={errorSummaryRef}
          role="alert"
          aria-labelledby="error-summary-title"
          tabIndex={-1}
          data-testid="error-summary"
          style={{
            padding: '20px',
            marginBottom: '30px',
            border: '5px solid #d4351c',
            outline: 'none',
          }}
        >
          <h2
            id="error-summary-title"
            style={{
              fontFamily: '"GDS Transport", arial, sans-serif',
              fontSize: '19px',
              fontWeight: 700,
              margin: '0 0 15px 0',
              color: '#0b0c0c',
            }}
          >
            There is a problem
          </h2>
          <ul style={{ margin: 0, padding: '0 0 0 20px', listStyleType: 'none' }}>
            {allErrors.map((err, i) => (
              <li key={i} style={{ marginBottom: '5px' }}>
                {err.field ? (
                  <a
                    href={`#${err.field}`}
                    onClick={(e) => handleErrorLinkClick(e, err.field)}
                    style={{
                      color: '#d4351c',
                      fontFamily: '"GDS Transport", arial, sans-serif',
                      fontSize: '16px',
                      fontWeight: 700,
                    }}
                  >
                    {err.message}
                  </a>
                ) : (
                  <span style={{ color: '#d4351c', fontFamily: '"GDS Transport", arial, sans-serif', fontSize: '16px', fontWeight: 700 }}>
                    {err.message}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={form.onSubmit(handleSubmit, handleValidationFailure)} noValidate>
        <TextInput
          label="Plant Number"
          value={site.plant_no}
          readOnly
          disabled
          mb="md"
          data-testid="plant-no-readonly"
          aria-readonly="true"
          styles={{
            label: { fontWeight: 700, fontSize: '16px', fontFamily: '"GDS Transport", arial, sans-serif' },
          }}
        />

        <TextInput
          label="Current Name"
          value={site.name}
          readOnly
          disabled
          mb="md"
          data-testid="current-name-readonly"
          aria-readonly="true"
          styles={{
            label: { fontWeight: 700, fontSize: '16px', fontFamily: '"GDS Transport", arial, sans-serif' },
          }}
        />

        <TextInput
          id="new_name"
          label="New Name"
          description="The current name will be preserved in brackets after the new name"
          required
          maxLength={50}
          aria-required="true"
          aria-describedby={form.errors.new_name ? 'new_name-error' : undefined}
          error={form.errors.new_name}
          {...form.getInputProps('new_name')}
          mb="xl"
          data-testid="new-name-input"
          styles={{
            label: { fontWeight: 700, fontSize: '16px', fontFamily: '"GDS Transport", arial, sans-serif' },
            input: { borderColor: form.errors.new_name ? '#d4351c' : undefined, borderWidth: form.errors.new_name ? '3px' : undefined },
            error: { fontWeight: 700, color: '#d4351c' },
          }}
        />

        <Group>
          <Button
            variant="default"
            onClick={() => navigate(`/sites?selected=${plantNo}`)}
            data-testid="cancel-button"
            styles={{
              root: {
                backgroundColor: '#f3f2f1',
                color: '#0b0c0c',
                border: 'none',
                boxShadow: '0 2px 0 #929191',
                fontFamily: '"GDS Transport", arial, sans-serif',
                fontWeight: 700,
                fontSize: '16px',
                padding: '8px 16px',
                minHeight: '40px',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={updateSiteName.isPending}
            data-testid="save-button"
            styles={{
              root: {
                backgroundColor: '#00703c',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 2px 0 #002d18',
                fontFamily: '"GDS Transport", arial, sans-serif',
                fontWeight: 700,
                fontSize: '16px',
                padding: '8px 16px',
                minHeight: '40px',
              },
            }}
          >
            Save Changes
          </Button>
        </Group>
      </form>
    </div>
  );
}
