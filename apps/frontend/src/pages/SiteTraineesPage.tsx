import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Title,
  TextInput,
  Card,
  Text,
  Table,
  Button,
  Group,
  Modal,
  Alert,
  Box,
  Loader,
  Combobox,
  useCombobox,
  ScrollArea,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useAllSites, useSearchSites, useSite, useDeleteSite } from '../hooks/useSites';
import { usePersonsBySite, useDeletePerson } from '../hooks/usePersons';
import type { SiteListItem } from '@apha-bst/shared';

export function SiteTraineesPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedPlantNo, setSelectedPlantNo] = useState<string | null>(
    searchParams.get('selected'),
  );
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchValue, 300);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePersonModalOpen, setDeletePersonModalOpen] = useState(false);
  const [personToDelete, setPersonToDelete] = useState<{ id: number; name: string } | null>(null);
  const [deletePersonError, setDeletePersonError] = useState<string | null>(null);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const { data: allSites, isLoading: isLoadingAll } = useAllSites();
  const { data: searchResults, isLoading: isSearching } = useSearchSites({
    name: debouncedSearch || undefined,
  });
  const sites = debouncedSearch ? searchResults : allSites;
  const isSitesLoading = debouncedSearch ? isSearching : isLoadingAll;
  const { data: selectedSite, isLoading: isSiteLoading } = useSite(selectedPlantNo);
  const { data: persons, isLoading: isPersonsLoading } = usePersonsBySite(selectedPlantNo);
  const deleteSiteMutation = useDeleteSite();
  const deletePersonMutation = useDeletePerson();

  function formatSiteOption(site: SiteListItem): string {
    return `${site.name} (${site.plant_no})`;
  }

  function handleSiteSelect(plantNo: string) {
    setSelectedPlantNo(plantNo);
    setSearchParams({ selected: plantNo });
    const site = sites?.find((s) => s.plant_no === plantNo);
    if (site) {
      setSearchValue(formatSiteOption(site));
    }
    combobox.closeDropdown();
  }

  function handleDelete() {
    if (!selectedPlantNo || !selectedSite) return;

    setDeleteError(null);
    deleteSiteMutation.mutate(selectedPlantNo, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        setSelectedPlantNo(null);
        setSearchValue('');
        setSearchParams({});
      },
      onError: (error) => {
        const axiosError = error as { response?: { status: number; data?: { message: string } } };
        if (axiosError.response?.status === 409) {
          setDeleteModalOpen(false);
          setDeleteError(
            axiosError.response.data?.message ||
            `There are personnel from ${selectedSite.name}. You can only delete a site with no trainees.`,
          );
        } else {
          setDeleteError('An unexpected error occurred. Please try again.');
        }
      },
    });
  }

  function handleDeletePerson() {
    if (!personToDelete) return;

    setDeletePersonError(null);
    deletePersonMutation.mutate(personToDelete.id, {
      onSuccess: () => {
        setDeletePersonModalOpen(false);
        setPersonToDelete(null);
      },
      onError: (error) => {
        const axiosError = error as { response?: { status: number; data?: { message: string } } };
        if (axiosError.response?.status === 409) {
          setDeletePersonModalOpen(false);
          setDeletePersonError(
            axiosError.response.data?.message ||
            'Training records must be deleted before a person can be removed.',
          );
        } else {
          setDeletePersonError('An unexpected error occurred. Please try again.');
        }
      },
    });
  }

  const options = useMemo(
    () =>
      (sites ?? []).map((site) => (
        <Combobox.Option value={site.plant_no} key={site.plant_no}>
          {formatSiteOption(site)}
        </Combobox.Option>
      )),
    [sites],
  );

  return (
    <div>
      <Title
        order={1}
        style={{
          fontFamily: '"GDS Transport", arial, sans-serif',
          fontSize: '36px',
          fontWeight: 700,
          marginBottom: '30px',
        }}
      >
        Site trainees
      </Title>

      {deleteError && (
        <Alert
          color="red"
          title="Cannot delete site"
          mb="lg"
          withCloseButton
          onClose={() => setDeleteError(null)}
          styles={{
            root: { borderLeft: '5px solid #d4351c' },
            title: { fontWeight: 700 },
          }}
          role="alert"
          data-testid="delete-error"
        >
          {deleteError}
        </Alert>
      )}

      <Box style={{ maxWidth: '680px' }} mb="xl">
        <Combobox
          store={combobox}
          onOptionSubmit={handleSiteSelect}
        >
          <Combobox.Target>
            <TextInput
              label="Search for a site"
              description="Search by site name"
              placeholder="Start typing a site name..."
              value={searchValue}
              onChange={(event) => {
                setSearchValue(event.currentTarget.value);
                combobox.openDropdown();
                combobox.updateSelectedOptionIndex();
              }}
              onClick={() => combobox.openDropdown()}
              onFocus={() => combobox.openDropdown()}
              onBlur={() => combobox.closeDropdown()}
              rightSection={isSitesLoading ? <Loader size={16} aria-label="Searching sites" /> : null}
              data-testid="site-search-input"
              aria-autocomplete="list"
              autoComplete="off"
              styles={{
                label: { fontWeight: 700, fontSize: '16px', fontFamily: '"GDS Transport", arial, sans-serif' },
              }}
            />
          </Combobox.Target>

          <Combobox.Dropdown>
            <Combobox.Options>
              <ScrollArea.Autosize mah={200}>
                {options.length > 0 ? (
                  options
                ) : (
                  <Combobox.Empty>
                    {isSitesLoading ? 'Loading...' : 'No sites found'}
                  </Combobox.Empty>
                )}
              </ScrollArea.Autosize>
            </Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>
      </Box>

      {!selectedPlantNo && (
        isSitesLoading ? (
          <Loader data-testid="sites-loading" aria-label="Loading sites" />
        ) : (sites ?? []).length > 0 ? (
          <Table striped highlightOnHover withTableBorder data-testid="sites-table">
            <Table.Thead>
              <Table.Tr>
                <Table.Th scope="col">Site name</Table.Th>
                <Table.Th scope="col">Plant number</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {(sites ?? []).map((site) => (
                <Table.Tr
                  key={site.plant_no}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSiteSelect(site.plant_no)}
                  data-testid={`site-row-${site.plant_no}`}
                >
                  <Table.Td>{site.name}</Table.Td>
                  <Table.Td>{site.plant_no}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <Text c="dimmed" data-testid="no-sites-message">No sites found.</Text>
        )
      )}

      {selectedPlantNo && (
        <>
          {isSiteLoading ? (
            <Loader data-testid="site-loading" aria-label="Loading site details" />
          ) : selectedSite ? (
            <>
              <Card
                withBorder
                mb="lg"
                data-testid="site-details-card"
                component="section"
                aria-label={`Details for ${selectedSite.name}`}
              >
                <Group justify="space-between" mb="md">
                  <Title
                    order={2}
                    style={{
                      fontFamily: '"GDS Transport", arial, sans-serif',
                      fontSize: '24px',
                      fontWeight: 700,
                    }}
                  >
                    {selectedSite.name}
                  </Title>
                  <Group>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => navigate(`/sites/${selectedPlantNo}/edit`)}
                      data-testid="edit-site-button"
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
                      Edit
                    </Button>
                    <Button
                      variant="filled"
                      color="red"
                      size="sm"
                      onClick={() => {
                        setDeleteError(null);
                        setDeleteModalOpen(true);
                      }}
                      data-testid="delete-site-button"
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
                  </Group>
                </Group>

                <Text size="sm" c="dimmed" mb="xs" style={{ fontFamily: '"GDS Transport", arial, sans-serif' }}>
                  Plant Number: {selectedSite.plant_no}
                </Text>
                {selectedSite.address_line_1 && (
                  <Text size="sm" style={{ fontFamily: '"GDS Transport", arial, sans-serif' }}>{selectedSite.address_line_1}</Text>
                )}
                {selectedSite.address_line_2 && (
                  <Text size="sm" style={{ fontFamily: '"GDS Transport", arial, sans-serif' }}>{selectedSite.address_line_2}</Text>
                )}
                {(selectedSite.address_town || selectedSite.address_county) && (
                  <Text size="sm" style={{ fontFamily: '"GDS Transport", arial, sans-serif' }}>
                    {[selectedSite.address_town, selectedSite.address_county]
                      .filter(Boolean)
                      .join(', ')}
                  </Text>
                )}
                {selectedSite.address_post_code && (
                  <Text size="sm" style={{ fontFamily: '"GDS Transport", arial, sans-serif' }}>{selectedSite.address_post_code}</Text>
                )}
                {selectedSite.telephone && (
                  <Text size="sm" style={{ fontFamily: '"GDS Transport", arial, sans-serif' }}>Tel: {selectedSite.telephone}</Text>
                )}
                {selectedSite.fax && (
                  <Text size="sm" style={{ fontFamily: '"GDS Transport", arial, sans-serif' }}>Fax: {selectedSite.fax}</Text>
                )}
                <Text size="sm" mt="md" fw={700} style={{ fontFamily: '"GDS Transport", arial, sans-serif' }} data-testid="personnel-count">
                  Total Personnel: {selectedSite.personnel_count ?? persons?.length ?? 0}
                </Text>
              </Card>

              {deletePersonError && (
                <Alert
                  color="red"
                  title="Cannot delete person"
                  mb="lg"
                  withCloseButton
                  onClose={() => setDeletePersonError(null)}
                  styles={{
                    root: { borderLeft: '5px solid #d4351c' },
                    title: { fontWeight: 700 },
                  }}
                  role="alert"
                  data-testid="delete-person-error"
                >
                  {deletePersonError}
                </Alert>
              )}

              <Group justify="space-between" mb="sm">
                <Title
                  order={3}
                  style={{
                    fontFamily: '"GDS Transport", arial, sans-serif',
                    fontSize: '19px',
                    fontWeight: 700,
                  }}
                >
                  Personnel
                </Title>
                <Button
                  size="sm"
                  onClick={() => navigate(`/persons/add?site_id=${selectedPlantNo}`)}
                  data-testid="add-person-button"
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
                  Add Person
                </Button>
              </Group>

              {isPersonsLoading ? (
                <Loader data-testid="persons-loading" aria-label="Loading personnel" />
              ) : (
                <Table striped highlightOnHover withTableBorder data-testid="personnel-table">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th scope="col">Name</Table.Th>
                      <Table.Th scope="col">Trained?</Table.Th>
                      <Table.Th scope="col">Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {(persons ?? []).length === 0 ? (
                      <Table.Tr>
                        <Table.Td colSpan={3}>
                          <Text c="dimmed" ta="center" py="md" data-testid="no-trainees-message" style={{ fontFamily: '"GDS Transport", arial, sans-serif' }}>
                            No trainees associated with this site.
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ) : (
                      (persons ?? []).map((person) => (
                        <Table.Tr key={person.person_id} data-testid={`person-row-${person.person_id}`}>
                          <Table.Td>{person.display_name}</Table.Td>
                          <Table.Td>{person.has_training ? 'Yes' : 'No'}</Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              <Button
                                variant="default"
                                size="xs"
                                onClick={() => navigate(`/persons/${person.person_id}/training`)}
                                data-testid={`training-history-${person.person_id}`}
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
                                Training
                              </Button>
                              <Button
                                variant="default"
                                size="xs"
                                onClick={() => navigate(`/persons/${person.person_id}/edit`)}
                                data-testid={`edit-person-${person.person_id}`}
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
                                Edit
                              </Button>
                              <Button
                                variant="filled"
                                color="red"
                                size="xs"
                                onClick={() => {
                                  setDeletePersonError(null);
                                  setPersonToDelete({ id: person.person_id, name: person.display_name });
                                  setDeletePersonModalOpen(true);
                                }}
                                data-testid={`delete-person-${person.person_id}`}
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
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))
                    )}
                  </Table.Tbody>
                </Table>
              )}
            </>
          ) : null}
        </>
      )}

      <Modal
        opened={deletePersonModalOpen}
        onClose={() => setDeletePersonModalOpen(false)}
        title="Confirm deletion"
        centered
        data-testid="delete-person-modal"
        styles={{
          title: {
            fontFamily: '"GDS Transport", arial, sans-serif',
            fontWeight: 700,
            fontSize: '24px',
          },
        }}
      >
        <Text mb="lg" style={{ fontFamily: '"GDS Transport", arial, sans-serif' }}>
          Are you sure you want to delete{' '}
          <strong>{personToDelete?.name ?? 'this person'}</strong>? This action
          cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button
            variant="default"
            onClick={() => setDeletePersonModalOpen(false)}
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
            onClick={handleDeletePerson}
            loading={deletePersonMutation.isPending}
            data-testid="confirm-delete-person-button"
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
            Confirm Deletion
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm deletion"
        centered
        data-testid="delete-modal"
        aria-labelledby="delete-modal-title"
        styles={{
          title: {
            fontFamily: '"GDS Transport", arial, sans-serif',
            fontWeight: 700,
            fontSize: '24px',
          },
        }}
      >
        <Text mb="lg" style={{ fontFamily: '"GDS Transport", arial, sans-serif' }}>
          Are you sure you want to delete{' '}
          <strong>{selectedSite?.name ?? 'this site'}</strong>? This action
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
            onClick={handleDelete}
            loading={deleteSiteMutation.isPending}
            data-testid="confirm-delete-button"
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
            Delete site
          </Button>
        </Group>
      </Modal>
    </div>
  );
}
