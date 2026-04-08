import { useState, useMemo } from 'react';
import {
  Title,
  Table,
  TextInput,
  Button,
  Group,
  Text,
  Modal,
  Alert,
  Combobox,
  useCombobox,
  ScrollArea,
  Loader,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDebouncedValue } from '@mantine/hooks';
import { useTrainers, useCreateTrainer, useDeleteTrainer } from '../hooks/useTrainers';
import { useAllSites, useSearchSites } from '../hooks/useSites';
import { AxiosError } from 'axios';

interface ServerError {
  message: string | string[];
  statusCode: number;
}

export function ManageTrainersPage(): React.JSX.Element {
  const { data: trainers, isLoading } = useTrainers();
  const createTrainer = useCreateTrainer();
  const deleteTrainerMutation = useDeleteTrainer();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [trainerToDelete, setTrainerToDelete] = useState<{ id: number; name: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [serverErrors, setServerErrors] = useState<string[]>([]);

  const [siteSearchValue, setSiteSearchValue] = useState('');
  const [debouncedSiteSearch] = useDebouncedValue(siteSearchValue, 300);
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const { data: allSites, isLoading: isLoadingAllSites } = useAllSites();
  const { data: searchResults, isLoading: isSearchingSites } = useSearchSites({
    name: debouncedSiteSearch || undefined,
  });
  const sites = debouncedSiteSearch ? searchResults : allSites;
  const isSitesLoading = debouncedSiteSearch ? isSearchingSites : isLoadingAllSites;

  const form = useForm({
    initialValues: {
      first_name: '',
      last_name: '',
      location_id: '',
      person_id: undefined as number | undefined,
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
      location_id: (value) => {
        if (!value) return 'Select a location';
        return null;
      },
    },
  });

  function handleSiteSelect(plantNo: string) {
    form.setFieldValue('location_id', plantNo);
    const site = sites?.find((s) => s.plant_no === plantNo);
    if (site) {
      setSiteSearchValue(`${site.name} (${site.plant_no})`);
    }
    combobox.closeDropdown();
  }

  function handleSubmit(values: { first_name: string; last_name: string; location_id: string; person_id?: number }) {
    setServerErrors([]);
    const payload: { first_name: string; last_name: string; location_id: string; person_id?: number } = {
      first_name: values.first_name,
      last_name: values.last_name,
      location_id: values.location_id,
    };
    if (values.person_id) {
      payload.person_id = values.person_id;
    }

    createTrainer.mutate(payload, {
      onSuccess: () => {
        form.reset();
        setSiteSearchValue('');
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
      },
    });
  }

  function handleDeleteTrainer() {
    if (!trainerToDelete) return;

    setDeleteError(null);
    deleteTrainerMutation.mutate(trainerToDelete.id, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        setTrainerToDelete(null);
      },
      onError: () => {
        setDeleteError('An unexpected error occurred. Please try again.');
      },
    });
  }

  const siteOptions = useMemo(
    () =>
      (sites ?? []).map((site) => (
        <Combobox.Option value={site.plant_no} key={site.plant_no}>
          {site.name} ({site.plant_no})
        </Combobox.Option>
      )),
    [sites],
  );

  return (
    <div>
      <Title order={1} style={{ fontFamily: '"GDS Transport", arial, sans-serif', fontSize: '36px', fontWeight: 700, marginBottom: '30px' }}>
        Manage trainers
      </Title>

      {deleteError && (
        <Alert
          color="red"
          title="Cannot delete trainer"
          mb="lg"
          withCloseButton
          onClose={() => setDeleteError(null)}
          styles={{
            root: { borderLeft: '5px solid #d4351c' },
            title: { fontWeight: 700 },
          }}
          role="alert"
          data-testid="delete-trainer-error"
        >
          {deleteError}
        </Alert>
      )}

      {isLoading ? (
        <Loader data-testid="trainers-loading" aria-label="Loading trainers" />
      ) : (
        <Table striped highlightOnHover withTableBorder mb="xl" data-testid="trainers-table">
          <Table.Thead>
            <Table.Tr>
              <Table.Th scope="col">ID</Table.Th>
              <Table.Th scope="col">Trainer Name</Table.Th>
              <Table.Th scope="col">Location</Table.Th>
              <Table.Th scope="col">Type</Table.Th>
              <Table.Th scope="col">Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(trainers ?? []).length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text c="dimmed" ta="center" py="md" data-testid="no-trainers-message" style={{ fontFamily: '"GDS Transport", arial, sans-serif' }}>
                    No trainers registered.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              (trainers ?? []).map((trainer) => (
                <Table.Tr key={trainer.trainer_id} data-testid={`trainer-row-${trainer.trainer_id}`}>
                  <Table.Td>{trainer.trainer_id}</Table.Td>
                  <Table.Td>{trainer.display_name}</Table.Td>
                  <Table.Td>{trainer.location_id}</Table.Td>
                  <Table.Td>{trainer.person_id === null ? 'APHA Staff' : 'Cascade'}</Table.Td>
                  <Table.Td>
                    <Button
                      variant="filled"
                      color="red"
                      size="xs"
                      onClick={() => {
                        setDeleteError(null);
                        setTrainerToDelete({ id: trainer.trainer_id, name: trainer.display_name });
                        setDeleteModalOpen(true);
                      }}
                      data-testid={`delete-trainer-${trainer.trainer_id}`}
                      styles={{
                        root: {
                          backgroundColor: '#d4351c',
                          color: '#ffffff',
                          border: 'none',
                          boxShadow: '0 2px 0 #8a220e',
                          fontFamily: '"GDS Transport", arial, sans-serif',
                          fontWeight: 700,
                        },
                      }}
                    >
                      Delete
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      )}

      <Title order={2} style={{ fontFamily: '"GDS Transport", arial, sans-serif', fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
        Add new trainer
      </Title>

      {serverErrors.length > 0 && (
        <Alert color="red" title="Error" mb="lg" withCloseButton onClose={() => setServerErrors([])} role="alert" data-testid="create-trainer-error">
          {serverErrors.map((msg, i) => (
            <Text key={i}>{msg}</Text>
          ))}
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)} noValidate style={{ maxWidth: '680px' }}>
        <TextInput
          id="first_name"
          label="First Name"
          required
          maxLength={50}
          error={form.errors.first_name}
          {...form.getInputProps('first_name')}
          mb="md"
          data-testid="trainer-first-name-input"
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
          error={form.errors.last_name}
          {...form.getInputProps('last_name')}
          mb="md"
          data-testid="trainer-last-name-input"
          styles={{
            label: { fontWeight: 700, fontSize: '16px', fontFamily: '"GDS Transport", arial, sans-serif' },
            input: { borderColor: form.errors.last_name ? '#d4351c' : undefined, borderWidth: form.errors.last_name ? '3px' : undefined },
            error: { fontWeight: 700, color: '#d4351c' },
          }}
        />

        <Combobox store={combobox} onOptionSubmit={handleSiteSelect}>
          <Combobox.Target>
            <TextInput
              id="location_id"
              label="Location"
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
              error={form.errors.location_id}
              mb="md"
              data-testid="trainer-location-input"
              aria-autocomplete="list"
              autoComplete="off"
              styles={{
                label: { fontWeight: 700, fontSize: '16px', fontFamily: '"GDS Transport", arial, sans-serif' },
                input: { borderColor: form.errors.location_id ? '#d4351c' : undefined, borderWidth: form.errors.location_id ? '3px' : undefined },
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
          id="person_id"
          label="Person ID (optional, for cascade trainers)"
          description="Enter the person ID to link this trainer to an existing person record"
          type="number"
          {...form.getInputProps('person_id')}
          mb="xl"
          data-testid="trainer-person-id-input"
          styles={{
            label: { fontWeight: 700, fontSize: '16px', fontFamily: '"GDS Transport", arial, sans-serif' },
          }}
        />

        <Button
          type="submit"
          loading={createTrainer.isPending}
          data-testid="add-trainer-button"
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
          Add Trainer
        </Button>
      </form>

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm deletion"
        centered
        data-testid="delete-trainer-modal"
        styles={{
          title: {
            fontFamily: '"GDS Transport", arial, sans-serif',
            fontWeight: 700,
            fontSize: '24px',
          },
        }}
      >
        <Text mb="lg" style={{ fontFamily: '"GDS Transport", arial, sans-serif' }}>
          Are you sure you want to delete trainer{' '}
          <strong>{trainerToDelete?.name ?? 'this trainer'}</strong>? This action
          cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button
            variant="default"
            onClick={() => setDeleteModalOpen(false)}
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
            onClick={handleDeleteTrainer}
            loading={deleteTrainerMutation.isPending}
            data-testid="confirm-delete-trainer-button"
            styles={{
              root: {
                backgroundColor: '#d4351c',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 2px 0 #8a220e',
                fontFamily: '"GDS Transport", arial, sans-serif',
                fontWeight: 700,
              },
            }}
          >
            Delete trainer
          </Button>
        </Group>
      </Modal>
    </div>
  );
}
