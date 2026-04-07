import { useState, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  TextInput,
  Button,
  Group,
  Title,
  Text,
  Modal,
  Combobox,
  useCombobox,
  ScrollArea,
  Loader,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDebouncedValue } from '@mantine/hooks';
import { useAllSites, useSearchSites } from '../hooks/useSites';
import { useCreatePerson } from '../hooks/usePersons';
import { checkDuplicate } from '../api/persons';
import type { SiteListItem } from '@apha-bst/shared';
import { AxiosError } from 'axios';

interface ServerError {
  message: string | string[];
  statusCode: number;
}

interface FormValues {
  first_name: string;
  last_name: string;
  site_id: string;
}

export function AddPersonPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedSiteId = searchParams.get('site_id');

  const createPerson = useCreatePerson();
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

  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);

  const form = useForm<FormValues>({
    initialValues: {
      first_name: '',
      last_name: '',
      site_id: preselectedSiteId ?? '',
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

  // Set initial site search display if preselected
  useState(() => {
    if (preselectedSiteId && allSites) {
      const site = allSites.find((s) => s.plant_no === preselectedSiteId);
      if (site) {
        setSiteSearchValue(`${site.name} (${site.plant_no})`);
      }
    }
  });

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

  async function handleSubmit(values: FormValues) {
    setServerErrors([]);

    try {
      const result = await checkDuplicate(values.first_name, values.last_name, values.site_id);
      if (result.isDuplicate) {
        setPendingValues(values);
        setDuplicateModalOpen(true);
        return;
      }
    } catch {
      // If duplicate check fails, proceed with creation
    }

    doCreate(values);
  }

  function doCreate(values: FormValues) {
    createPerson.mutate(
      {
        first_name: values.first_name,
        last_name: values.last_name,
        site_id: values.site_id,
      },
      {
        onSuccess: (person) => {
          navigate(`/sites?selected=${values.site_id}`, {
            state: {
              notification: `Person ${person.display_name} successfully added with ID: ${person.person_id}`,
            },
          });
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

  function handleDuplicateProceed() {
    setDuplicateModalOpen(false);
    if (pendingValues) {
      doCreate(pendingValues);
      setPendingValues(null);
    }
  }

  function handleDuplicateCancel() {
    setDuplicateModalOpen(false);
    setPendingValues(null);
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
        Add a new person
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
          id="person_id_display"
          label="Person ID"
          value="Auto-generated on save"
          disabled
          mb="md"
          data-testid="person-id-display"
          styles={{
            label: { fontWeight: 700, fontSize: '16px', fontFamily: '"GDS Transport", arial, sans-serif' },
          }}
        />

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
          mb="md"
          data-testid="last-name-input"
          styles={{
            label: { fontWeight: 700, fontSize: '16px', fontFamily: '"GDS Transport", arial, sans-serif' },
            input: { borderColor: form.errors.last_name ? '#d4351c' : undefined, borderWidth: form.errors.last_name ? '3px' : undefined },
            error: { fontWeight: 700, color: '#d4351c' },
          }}
        />

        <Text size="sm" c="dimmed" mb="xl" style={{ fontFamily: '"GDS Transport", arial, sans-serif' }}>
          Display name will be shown as &quot;Last Name, First Name&quot;
        </Text>

        <Group>
          <Button
            variant="default"
            onClick={() => navigate(preselectedSiteId ? `/sites?selected=${preselectedSiteId}` : '/sites')}
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
            loading={createPerson.isPending}
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
            Save Person
          </Button>
        </Group>
      </form>

      <Modal
        opened={duplicateModalOpen}
        onClose={handleDuplicateCancel}
        title="Possible duplicate"
        centered
        data-testid="duplicate-modal"
        styles={{
          title: {
            fontFamily: '"GDS Transport", arial, sans-serif',
            fontWeight: 700,
            fontSize: '24px',
          },
        }}
      >
        <Text mb="lg" style={{ fontFamily: '"GDS Transport", arial, sans-serif' }}>
          A person with this name already exists at this site. Do you still want to proceed?
        </Text>
        <Group justify="flex-end">
          <Button
            variant="default"
            onClick={handleDuplicateCancel}
            data-testid="duplicate-cancel-button"
            styles={{
              root: {
                backgroundColor: '#f3f2f1',
                color: '#0b0c0c',
                border: 'none',
                boxShadow: '0 2px 0 #929191',
                fontFamily: '"GDS Transport", arial, sans-serif',
                fontWeight: 700,
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDuplicateProceed}
            data-testid="duplicate-proceed-button"
            styles={{
              root: {
                backgroundColor: '#00703c',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 2px 0 #002d18',
                fontFamily: '"GDS Transport", arial, sans-serif',
                fontWeight: 700,
              },
            }}
          >
            Proceed
          </Button>
        </Group>
      </Modal>
    </div>
  );
}
