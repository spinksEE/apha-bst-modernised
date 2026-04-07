import { useParams, useNavigate } from 'react-router-dom';
import {
  TextInput,
  Button,
  Group,
  Title,
  Alert,
  Loader,
  Text,
  Combobox,
  useCombobox,
  ScrollArea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState, useRef, useMemo, useEffect } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import { usePerson, useUpdatePerson } from '../hooks/usePersons';
import { useAllSites, useSearchSites } from '../hooks/useSites';
import type { SiteListItem } from '@apha-bst/shared';
import { AxiosError } from 'axios';

interface ServerError {
  message: string | string[];
  statusCode: number;
}

export function EditPersonPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const personId = id ? parseInt(id, 10) : null;
  const navigate = useNavigate();
  const { data: person, isLoading } = usePerson(personId);
  const updatePerson = useUpdatePerson();
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const [siteSearchValue, setSiteSearchValue] = useState('');
  const [debouncedSiteSearch] = useDebouncedValue(siteSearchValue, 300);
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const { data: allSites, isLoading: isLoadingAll } = useAllSites();
  const { data: searchResults, isLoading: isSearching } = useSearchSites({
    name: debouncedSiteSearch || undefined,
  });
  const sites = debouncedSiteSearch ? searchResults : allSites;
  const isSitesLoading = debouncedSiteSearch ? isSearching : isLoadingAll;

  const form = useForm({
    initialValues: {
      first_name: '',
      last_name: '',
      site_id: '',
    },
    validate: {
      first_name: (value) => {
        if (!value) return 'Enter a first name';
        if (value.length > 50) return 'First name must be 50 characters or fewer';
        return null;
      },
      last_name: (value) => {
        if (!value) return 'Enter a last name';
        if (value.length > 50) return 'Last name must be 50 characters or fewer';
        return null;
      },
      site_id: (value) => {
        if (!value) return 'Select a site';
        return null;
      },
    },
  });

  // Pre-populate form when person data loads
  useEffect(() => {
    if (person) {
      form.setValues({
        first_name: person.first_name,
        last_name: person.last_name,
        site_id: person.site_id,
      });
    }
  }, [person]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-populate site search display
  useEffect(() => {
    if (person && allSites) {
      const site = allSites.find((s) => s.plant_no === person.site_id);
      if (site) {
        setSiteSearchValue(`${site.name} (${site.plant_no})`);
      }
    }
  }, [person, allSites]);

  function formatSiteOption(site: SiteListItem): string {
    return `${site.name} (${site.plant_no})`;
  }

  function handleSiteSelect(plantNo: string) {
    form.setFieldValue('site_id', plantNo);
    const site = sites?.find((s) => s.plant_no === plantNo);
    if (site) {
      setSiteSearchValue(formatSiteOption(site));
    }
    combobox.closeDropdown();
  }

  function focusErrorSummary() {
    setTimeout(() => {
      errorSummaryRef.current?.focus();
    }, 0);
  }

  function handleSubmit(values: { first_name: string; last_name: string; site_id: string }) {
    if (personId === null) return;

    setServerErrors([]);
    updatePerson.mutate(
      { id: personId, data: values },
      {
        onSuccess: () => {
          navigate(`/sites?selected=${values.site_id}`);
        },
        onError: (error) => {
          const axiosError = error as AxiosError<ServerError>;
          const data = axiosError.response?.data;
          if (data) {
            const messages = Array.isArray(data.message) ? data.message : [data.message];
            setServerErrors(messages);
          } else {
            setServerErrors(['An unexpected error occurred. Please try again.']);
          }
          focusErrorSummary();
        },
      },
    );
  }

  function handleValidationFailure() {
    focusErrorSummary();
  }

  if (isLoading) {
    return <Loader data-testid="edit-loading" aria-label="Loading person details" />;
  }

  if (!person) {
    return (
      <Alert color="red" title="Person not found" data-testid="person-not-found" role="alert">
        No person found with ID &quot;{id}&quot;.
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

  const siteOptions = useMemo(
    () =>
      (sites ?? []).map((site) => (
        <Combobox.Option value={site.plant_no} key={site.plant_no}>
          {formatSiteOption(site)}
        </Combobox.Option>
      )),
    [sites],
  );

  return (
    <div style={{ maxWidth: '680px' }}>
      <Title order={1} style={{ fontFamily: '"GDS Transport", arial, sans-serif', fontSize: '36px', fontWeight: 700, marginBottom: '30px' }}>
        Edit person details
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
                    style={{ color: '#d4351c', fontFamily: '"GDS Transport", arial, sans-serif', fontSize: '16px', fontWeight: 700 }}
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
          label="Person ID"
          value={String(person.person_id)}
          disabled
          mb="md"
          data-testid="person-id-readonly"
          aria-readonly="true"
          styles={{
            label: { fontWeight: 700, fontSize: '16px', fontFamily: '"GDS Transport", arial, sans-serif' },
          }}
        />

        <Text size="sm" c="dimmed" mb="md" style={{ fontFamily: '"GDS Transport", arial, sans-serif' }}>
          Training status: {person.has_training ? 'Trained' : 'Not trained'}
        </Text>

        <Combobox
          store={combobox}
          onOptionSubmit={handleSiteSelect}
        >
          <Combobox.Target>
            <TextInput
              id="site_id"
              label="Site"
              description="Search for and select a site"
              required
              placeholder="Start typing a site name..."
              value={siteSearchValue}
              onChange={(event) => {
                setSiteSearchValue(event.currentTarget.value);
                combobox.openDropdown();
                combobox.updateSelectedOptionIndex();
              }}
              onClick={() => combobox.openDropdown()}
              onFocus={() => combobox.openDropdown()}
              onBlur={() => combobox.closeDropdown()}
              rightSection={isSitesLoading ? <Loader size={16} aria-label="Searching sites" /> : null}
              error={form.errors.site_id}
              mb="md"
              data-testid="site-search-input"
              aria-autocomplete="list"
              autoComplete="off"
              styles={{
                label: { fontWeight: 700, fontSize: '16px', fontFamily: '"GDS Transport", arial, sans-serif' },
                input: { borderColor: form.errors.site_id ? '#d4351c' : undefined, borderWidth: form.errors.site_id ? '3px' : undefined },
                error: { fontWeight: 700, color: '#d4351c' },
              }}
            />
          </Combobox.Target>
          <Combobox.Dropdown>
            <Combobox.Options>
              <ScrollArea.Autosize mah={200}>
                {siteOptions.length > 0 ? (
                  siteOptions
                ) : (
                  <Combobox.Empty>
                    {isSitesLoading ? 'Loading...' : 'No sites found'}
                  </Combobox.Empty>
                )}
              </ScrollArea.Autosize>
            </Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>

        <TextInput
          id="first_name"
          label="First Name"
          required
          maxLength={50}
          aria-required="true"
          error={form.errors.first_name}
          {...form.getInputProps('first_name')}
          mb="md"
          data-testid="first-name-input"
          styles={{
            label: { fontWeight: 700, fontSize: '16px', fontFamily: '"GDS Transport", arial, sans-serif' },
            input: { borderColor: form.errors.first_name ? '#d4351c' : undefined, borderWidth: form.errors.first_name ? '3px' : undefined },
            error: { fontWeight: 700, color: '#d4351c' },
          }}
        />

        <TextInput
          id="last_name"
          label="Last Name"
          required
          maxLength={50}
          aria-required="true"
          error={form.errors.last_name}
          {...form.getInputProps('last_name')}
          mb="xl"
          data-testid="last-name-input"
          styles={{
            label: { fontWeight: 700, fontSize: '16px', fontFamily: '"GDS Transport", arial, sans-serif' },
            input: { borderColor: form.errors.last_name ? '#d4351c' : undefined, borderWidth: form.errors.last_name ? '3px' : undefined },
            error: { fontWeight: 700, color: '#d4351c' },
          }}
        />

        <Group>
          <Button
            variant="default"
            onClick={() => navigate(`/sites?selected=${person.site_id}`)}
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
            loading={updatePerson.isPending}
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
