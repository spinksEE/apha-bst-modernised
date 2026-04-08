import { useNavigate } from 'react-router-dom';
import {
  TextInput,
  Checkbox,
  Button,
  Group,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCreateSite } from '../hooks/useSites';
import type { CreateSiteRequest } from '@apha-bst/shared';
import { useState, useRef } from 'react';
import { AxiosError } from 'axios';

interface ServerError {
  message: string | string[];
  statusCode: number;
}

export function RegisterSitePage(): React.JSX.Element {
  const navigate = useNavigate();
  const createSite = useCreateSite();
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

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

  function focusErrorSummary() {
    setTimeout(() => {
      errorSummaryRef.current?.focus();
    }, 0);
  }

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
          focusErrorSummary();
        } else {
          setServerErrors(['An unexpected error occurred. Please try again.']);
          focusErrorSummary();
        }
      },
    });
  }

  function handleValidationFailure() {
    focusErrorSummary();
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
      <Title order={1} style={{ fontFamily: '"GDS Transport", arial, sans-serif', fontSize: '36px', fontWeight: 700, marginBottom: '30px' }}>
        Register a new site
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
          id="plant_no"
          label="Plant Number"
          description="A unique identifier, up to 11 alphanumeric characters"
          required
          maxLength={11}
          aria-required="true"
          aria-describedby={form.errors.plant_no ? 'plant_no-error' : undefined}
          error={form.errors.plant_no}
          {...form.getInputProps('plant_no')}
          mb="md"
          data-testid="plant-no-input"
          styles={{
            label: { fontWeight: 700, fontSize: '16px', fontFamily: '"GDS Transport", arial, sans-serif' },
            input: { borderColor: form.errors.plant_no ? '#d4351c' : undefined, borderWidth: form.errors.plant_no ? '3px' : undefined },
            error: { fontWeight: 700, color: '#d4351c' },
          }}
        />

        <TextInput
          id="name"
          label="Site Name"
          required
          maxLength={50}
          aria-required="true"
          aria-describedby={form.errors.name ? 'name-error' : undefined}
          error={form.errors.name}
          {...form.getInputProps('name')}
          mb="md"
          data-testid="site-name-input"
          styles={{
            label: { fontWeight: 700, fontSize: '16px', fontFamily: '"GDS Transport", arial, sans-serif' },
            input: { borderColor: form.errors.name ? '#d4351c' : undefined, borderWidth: form.errors.name ? '3px' : undefined },
            error: { fontWeight: 700, color: '#d4351c' },
          }}
        />

        <TextInput
          id="address_line_1"
          label="Address line 1"
          maxLength={50}
          {...form.getInputProps('address_line_1')}
          mb="md"
          styles={{ label: { fontWeight: 700, fontSize: '16px', fontFamily: '"GDS Transport", arial, sans-serif' } }}
        />

        <TextInput
          id="address_line_2"
          label="Address line 2"
          maxLength={50}
          {...form.getInputProps('address_line_2')}
          mb="md"
          styles={{ label: { fontWeight: 700, fontSize: '16px', fontFamily: '"GDS Transport", arial, sans-serif' } }}
        />

        <TextInput
          id="address_town"
          label="Town"
          maxLength={50}
          {...form.getInputProps('address_town')}
          mb="md"
          styles={{ label: { fontWeight: 700, fontSize: '16px', fontFamily: '"GDS Transport", arial, sans-serif' } }}
        />

        <TextInput
          id="address_county"
          label="County"
          maxLength={50}
          {...form.getInputProps('address_county')}
          mb="md"
          styles={{ label: { fontWeight: 700, fontSize: '16px', fontFamily: '"GDS Transport", arial, sans-serif' } }}
        />

        <TextInput
          id="address_post_code"
          label="Post code"
          maxLength={50}
          {...form.getInputProps('address_post_code')}
          mb="md"
          styles={{ label: { fontWeight: 700, fontSize: '16px', fontFamily: '"GDS Transport", arial, sans-serif' } }}
        />

        <TextInput
          id="telephone"
          label="Telephone"
          maxLength={50}
          {...form.getInputProps('telephone')}
          mb="md"
          styles={{ label: { fontWeight: 700, fontSize: '16px', fontFamily: '"GDS Transport", arial, sans-serif' } }}
        />

        <TextInput
          id="fax"
          label="Fax"
          maxLength={50}
          {...form.getInputProps('fax')}
          mb="md"
          styles={{ label: { fontWeight: 700, fontSize: '16px', fontFamily: '"GDS Transport", arial, sans-serif' } }}
        />

        <Checkbox
          id="is_apha_site"
          label="This is an APHA site"
          {...form.getInputProps('is_apha_site', { type: 'checkbox' })}
          mb="xl"
          styles={{ label: { fontFamily: '"GDS Transport", arial, sans-serif', fontSize: '16px' } }}
        />

        <Group>
          <Button
            variant="default"
            onClick={() => navigate('/sites')}
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
            loading={createSite.isPending}
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
            Save Site
          </Button>
        </Group>
      </form>
    </div>
  );
}
