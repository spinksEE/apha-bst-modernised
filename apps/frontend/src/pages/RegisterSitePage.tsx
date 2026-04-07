import { useNavigate } from 'react-router-dom';
import {
  TextInput,
  Checkbox,
  Button,
  Group,
  Title,
  Alert,
  List,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCreateSite } from '../hooks/useSites';
import type { CreateSiteRequest } from '@apha-bst/shared';
import { useState } from 'react';
import { AxiosError } from 'axios';

interface ServerError {
  message: string | string[];
  statusCode: number;
}

export function RegisterSitePage(): React.JSX.Element {
  const navigate = useNavigate();
  const createSite = useCreateSite();
  const [serverErrors, setServerErrors] = useState<string[]>([]);

  const form = useForm<CreateSiteRequest>({
    initialValues: {
      plant_no: '',
      name: '',
      address_line_1: '',
      address_line_2: '',
      address_town: '',
      address_county: '',
      address_post_code: '',
      telephone: '',
      fax: '',
      is_apha_site: false,
    },
    validate: {
      plant_no: (value) => {
        if (!value) return 'Enter a plant number';
        if (value.length > 11) return 'Plant number must be 11 characters or fewer';
        if (!/^[a-zA-Z0-9]+$/.test(value)) return 'Plant number must only contain letters and numbers';
        return null;
      },
      name: (value) => {
        if (!value) return 'Enter a site name';
        if (value.length > 50) return 'Site name must be 50 characters or fewer';
        return null;
      },
      address_line_1: (value) =>
        value && value.length > 50 ? 'Address line 1 must be 50 characters or fewer' : null,
      address_line_2: (value) =>
        value && value.length > 50 ? 'Address line 2 must be 50 characters or fewer' : null,
      address_town: (value) =>
        value && value.length > 50 ? 'Town must be 50 characters or fewer' : null,
      address_county: (value) =>
        value && value.length > 50 ? 'County must be 50 characters or fewer' : null,
      address_post_code: (value) =>
        value && value.length > 50 ? 'Post code must be 50 characters or fewer' : null,
      telephone: (value) =>
        value && value.length > 50 ? 'Telephone must be 50 characters or fewer' : null,
      fax: (value) =>
        value && value.length > 50 ? 'Fax must be 50 characters or fewer' : null,
    },
  });

  function handleSubmit(values: CreateSiteRequest) {
    setServerErrors([]);

    const payload: CreateSiteRequest = {
      plant_no: values.plant_no,
      name: values.name,
      is_apha_site: values.is_apha_site,
    };
    if (values.address_line_1) payload.address_line_1 = values.address_line_1;
    if (values.address_line_2) payload.address_line_2 = values.address_line_2;
    if (values.address_town) payload.address_town = values.address_town;
    if (values.address_county) payload.address_county = values.address_county;
    if (values.address_post_code) payload.address_post_code = values.address_post_code;
    if (values.telephone) payload.telephone = values.telephone;
    if (values.fax) payload.fax = values.fax;

    createSite.mutate(payload, {
      onSuccess: (site) => {
        navigate(`/sites?selected=${site.plant_no}`);
      },
      onError: (error) => {
        const axiosError = error as AxiosError<ServerError>;
        const data = axiosError.response?.data;
        if (data) {
          const messages = Array.isArray(data.message) ? data.message : [data.message];

          for (const msg of messages) {
            if (msg.includes('Plant Number')) {
              form.setFieldError('plant_no', msg);
            } else if (msg.includes('Name')) {
              form.setFieldError('name', msg);
            }
          }

          setServerErrors(messages);
        } else {
          setServerErrors(['An unexpected error occurred. Please try again.']);
        }
      },
    });
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
      <Title order={1} style={{ fontFamily: '"GDS Transport", arial, sans-serif', fontSize: '36px', fontWeight: 700, marginBottom: '30px' }}>
        Register a new site
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
          id="plant_no"
          label="Plant Number"
          description="A unique identifier, up to 11 alphanumeric characters"
          required
          maxLength={11}
          error={form.errors.plant_no}
          {...form.getInputProps('plant_no')}
          mb="md"
          data-testid="plant-no-input"
        />

        <TextInput
          id="name"
          label="Site Name"
          required
          maxLength={50}
          error={form.errors.name}
          {...form.getInputProps('name')}
          mb="md"
          data-testid="site-name-input"
        />

        <TextInput
          id="address_line_1"
          label="Address line 1"
          maxLength={50}
          {...form.getInputProps('address_line_1')}
          mb="md"
        />

        <TextInput
          id="address_line_2"
          label="Address line 2"
          maxLength={50}
          {...form.getInputProps('address_line_2')}
          mb="md"
        />

        <TextInput
          id="address_town"
          label="Town"
          maxLength={50}
          {...form.getInputProps('address_town')}
          mb="md"
        />

        <TextInput
          id="address_county"
          label="County"
          maxLength={50}
          {...form.getInputProps('address_county')}
          mb="md"
        />

        <TextInput
          id="address_post_code"
          label="Post code"
          maxLength={50}
          {...form.getInputProps('address_post_code')}
          mb="md"
        />

        <TextInput
          id="telephone"
          label="Telephone"
          maxLength={50}
          {...form.getInputProps('telephone')}
          mb="md"
        />

        <TextInput
          id="fax"
          label="Fax"
          maxLength={50}
          {...form.getInputProps('fax')}
          mb="md"
        />

        <Checkbox
          id="is_apha_site"
          label="This is an APHA site"
          {...form.getInputProps('is_apha_site', { type: 'checkbox' })}
          mb="xl"
        />

        <Group>
          <Button
            variant="outline"
            color="gray"
            onClick={() => navigate('/sites')}
            data-testid="cancel-button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={createSite.isPending}
            data-testid="save-button"
          >
            Save Site
          </Button>
        </Group>
      </form>
    </div>
  );
}
