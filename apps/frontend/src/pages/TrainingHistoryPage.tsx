import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Title,
  Text,
  Table,
  Button,
  Group,
  Modal,
  Alert,
  Loader,
} from '@mantine/core';
import { usePerson } from '../hooks/usePersons';
import { useTrainingsByTrainee, useDeleteTraining } from '../hooks/useTraining';
import type { TrainingListItem } from '@apha-bst/shared';

const GDS_FONT = '"GDS Transport", arial, sans-serif';

function formatTrainingType(type: string): string {
  switch (type) {
    case 'Trained':
      return 'Trained';
    case 'CascadeTrained':
      return 'Cascade Trained';
    case 'TrainingConfirmed':
      return 'Training Confirmed';
    default:
      return type;
  }
}

export function TrainingHistoryPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const personId = id ? parseInt(id, 10) : null;
  const navigate = useNavigate();

  const { data: person, isLoading: isPersonLoading } = usePerson(personId);
  const { data: trainings, isLoading: isTrainingsLoading } = useTrainingsByTrainee(personId);
  const deleteTraining = useDeleteTraining();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [trainingToDelete, setTrainingToDelete] = useState<TrainingListItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleDeleteClick(training: TrainingListItem) {
    setDeleteError(null);
    setTrainingToDelete(training);
    setDeleteModalOpen(true);
  }

  function handleDeleteConfirm() {
    if (!trainingToDelete) return;

    deleteTraining.mutate(trainingToDelete.training_id, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        setTrainingToDelete(null);
      },
      onError: (error) => {
        const axiosError = error as { response?: { data?: { message: string } } };
        setDeleteError(
          axiosError.response?.data?.message ||
            'An unexpected error occurred. Please try again.',
        );
      },
    });
  }

  if (isPersonLoading) {
    return <Loader data-testid="page-loading" aria-label="Loading person details" />;
  }

  if (!person) {
    return (
      <Alert color="red" title="Person not found" data-testid="person-not-found" role="alert">
        No person found with ID &quot;{id}&quot;.
      </Alert>
    );
  }

  return (
    <div>
      <Title
        order={1}
        style={{
          fontFamily: GDS_FONT,
          fontSize: '36px',
          fontWeight: 700,
          marginBottom: '10px',
        }}
      >
        Training history
      </Title>

      <Text
        size="lg"
        mb="xs"
        style={{ fontFamily: GDS_FONT }}
        data-testid="person-name"
      >
        {person.display_name}
      </Text>
      <Text
        size="sm"
        c="dimmed"
        mb="lg"
        style={{ fontFamily: GDS_FONT }}
        data-testid="person-details"
      >
        Person ID: {person.person_id} | Site: {person.site_id}
      </Text>

      {deleteError && (
        <Alert
          color="red"
          title="Cannot delete training record"
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

      <Group justify="space-between" mb="md">
        <Title
          order={2}
          style={{
            fontFamily: GDS_FONT,
            fontSize: '24px',
            fontWeight: 700,
          }}
        >
          Training records
        </Title>
        <Button
          component={Link}
          to={`/training/add?trainee_id=${person.person_id}`}
          data-testid="add-training-button"
          styles={{
            root: {
              backgroundColor: '#00703c',
              color: '#ffffff',
              border: 'none',
              boxShadow: '0 2px 0 #002d18',
              fontFamily: GDS_FONT,
              fontWeight: 700,
            },
          }}
        >
          + Add New Training
        </Button>
      </Group>

      {isTrainingsLoading ? (
        <Loader data-testid="trainings-loading" aria-label="Loading training records" />
      ) : (
        <Table striped highlightOnHover withTableBorder data-testid="training-table">
          <Table.Thead>
            <Table.Tr>
              <Table.Th scope="col">Date</Table.Th>
              <Table.Th scope="col">Training Type</Table.Th>
              <Table.Th scope="col">Species</Table.Th>
              <Table.Th scope="col">Trainer</Table.Th>
              <Table.Th scope="col">Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(trainings ?? []).length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text
                    c="dimmed"
                    ta="center"
                    py="md"
                    data-testid="no-trainings-message"
                    style={{ fontFamily: GDS_FONT }}
                  >
                    No training records found for this person.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              (trainings ?? []).map((training) => (
                <Table.Tr
                  key={training.training_id}
                  data-testid={`training-row-${training.training_id}`}
                >
                  <Table.Td>{training.date_trained}</Table.Td>
                  <Table.Td>{formatTrainingType(training.training_type)}</Table.Td>
                  <Table.Td>{training.species_trained.join(', ')}</Table.Td>
                  <Table.Td>{training.trainer_display_name}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button
                        variant="default"
                        size="xs"
                        onClick={() => navigate(`/training/${training.training_id}/edit`)}
                        data-testid={`edit-training-${training.training_id}`}
                        styles={{
                          root: {
                            backgroundColor: '#f3f2f1',
                            color: '#0b0c0c',
                            border: 'none',
                            boxShadow: '0 2px 0 #929191',
                            fontFamily: GDS_FONT,
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
                        onClick={() => handleDeleteClick(training)}
                        data-testid={`delete-training-${training.training_id}`}
                        styles={{
                          root: {
                            backgroundColor: '#d4351c',
                            color: '#ffffff',
                            border: 'none',
                            boxShadow: '0 2px 0 #8a220e',
                            fontFamily: GDS_FONT,
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

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm deletion"
        centered
        data-testid="delete-training-modal"
        styles={{
          title: {
            fontFamily: GDS_FONT,
            fontWeight: 700,
            fontSize: '24px',
          },
        }}
      >
        <Text mb="md" style={{ fontFamily: GDS_FONT }}>
          Are you sure you want to delete this training record? This action will
          soft-delete the record for audit purposes.
        </Text>
        {trainingToDelete && (
          <Text size="sm" c="dimmed" mb="lg" style={{ fontFamily: GDS_FONT }}>
            Training: {formatTrainingType(trainingToDelete.training_type)} —{' '}
            {trainingToDelete.species_trained.join(', ')} on{' '}
            {trainingToDelete.date_trained}
          </Text>
        )}
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
                fontFamily: GDS_FONT,
                fontWeight: 700,
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            loading={deleteTraining.isPending}
            data-testid="confirm-delete-training-button"
            styles={{
              root: {
                backgroundColor: '#d4351c',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 2px 0 #8a220e',
                fontFamily: GDS_FONT,
                fontWeight: 700,
              },
            }}
          >
            Confirm Deletion
          </Button>
        </Group>
      </Modal>
    </div>
  );
}
