import { useState, useRef, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  TextInput,
  Button,
  Group,
  Title,
  Text,
  Checkbox,
  Radio,
  Alert,
  Loader,
  Combobox,
  useCombobox,
  ScrollArea,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useTrainers } from '../hooks/useTrainers';
import { useTraining, useUpdateTraining } from '../hooks/useTraining';
import { getPersons } from '../api/persons';
import type { Person, TrainingType, Species } from '@apha-bst/shared';
import { AxiosError } from 'axios';

interface ServerError {
  message: string | string[];
  statusCode: number;
}

const TRAINING_TYPES: { value: TrainingType; label: string }[] = [
  { value: 'Trained', label: 'Trained' },
  { value: 'CascadeTrained', label: 'Cascade Trained' },
  { value: 'TrainingConfirmed', label: 'Training Confirmed' },
];

const SPECIES_OPTIONS: { value: Species; label: string }[] = [
  { value: 'Cattle', label: 'Cattle' },
  { value: 'Sheep', label: 'Sheep' },
  { value: 'Goat', label: 'Goat' },
];

const GDS_FONT = '"GDS Transport", arial, sans-serif';
const GDS_LABEL_STYLE = { fontWeight: 700, fontSize: '16px', fontFamily: GDS_FONT };
const GDS_ERROR_STYLE = { fontWeight: 700, color: '#d4351c' };

export function EditTrainingPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const trainingId = id ? parseInt(id, 10) : null;
  const navigate = useNavigate();

  const { data: training, isLoading: isTrainingLoading } = useTraining(trainingId);
  const updateTraining = useUpdateTraining();
  const { data: trainers } = useTrainers();

  // Form state
  const [traineeId, setTraineeId] = useState<number | null>(null);
  const [trainerId, setTrainerId] = useState<number | null>(null);
  const [trainingType, setTrainingType] = useState<TrainingType | ''>('');
  const [speciesTrained, setSpeciesTrained] = useState<Species[]>([]);
  const [dateTrained, setDateTrained] = useState<string>('');
  const [formLoaded, setFormLoaded] = useState(false);

  // Search state
  const [traineeSearchValue, setTraineeSearchValue] = useState('');
  const [debouncedTraineeSearch] = useDebouncedValue(traineeSearchValue, 300);
  const [personResults, setPersonResults] = useState<Person[]>([]);
  const [isSearchingPersons, setIsSearchingPersons] = useState(false);
  const [trainerSearchValue, setTrainerSearchValue] = useState('');

  // Error state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [selfTrainingError, setSelfTrainingError] = useState<string | null>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const traineeCombobox = useCombobox({
    onDropdownClose: () => traineeCombobox.resetSelectedOption(),
  });
  const trainerCombobox = useCombobox({
    onDropdownClose: () => trainerCombobox.resetSelectedOption(),
  });

  // Pre-populate form when training data loads
  useEffect(() => {
    if (training && !formLoaded) {
      setTraineeId(training.trainee_id);
      setTraineeSearchValue(training.trainee_display_name);
      setTrainerId(training.trainer_id);
      setTrainerSearchValue(training.trainer_display_name);
      setTrainingType(training.training_type);
      setSpeciesTrained([...training.species_trained]);
      setDateTrained(training.date_trained);
      setFormLoaded(true);
    }
  }, [training, formLoaded]);

  // Search persons when debounced search value changes
  useEffect(() => {
    if (!debouncedTraineeSearch || debouncedTraineeSearch.length < 1) {
      setPersonResults([]);
      return;
    }
    setIsSearchingPersons(true);
    getPersons(undefined, debouncedTraineeSearch)
      .then((results) => setPersonResults(results))
      .catch(() => setPersonResults([]))
      .finally(() => setIsSearchingPersons(false));
  }, [debouncedTraineeSearch]);

  // Self-training detection (BR-001)
  useEffect(() => {
    if (traineeId !== null && trainerId !== null && trainers) {
      const trainer = trainers.find((t) => t.trainer_id === trainerId);
      if (trainer && trainer.person_id !== null && trainer.person_id === traineeId) {
        setSelfTrainingError('A person cannot train themselves. Please select a different trainer.');
      } else {
        setSelfTrainingError(null);
      }
    } else {
      setSelfTrainingError(null);
    }
  }, [traineeId, trainerId, trainers]);

  // Filtered trainers for search
  const filteredTrainers = useMemo(() => {
    if (!trainers) return [];
    if (!trainerSearchValue) return trainers;
    return trainers.filter((t) =>
      t.display_name.toLowerCase().includes(trainerSearchValue.toLowerCase()),
    );
  }, [trainers, trainerSearchValue]);

  function handleTraineeSelect(personIdStr: string) {
    const personId = parseInt(personIdStr, 10);
    const person = personResults.find((p) => p.person_id === personId);
    if (person) {
      setTraineeId(person.person_id);
      setTraineeSearchValue(person.display_name);
    }
    traineeCombobox.closeDropdown();
  }

  function handleTrainerSelect(trainerIdStr: string) {
    const tid = parseInt(trainerIdStr, 10);
    const trainer = trainers?.find((t) => t.trainer_id === tid);
    if (trainer) {
      setTrainerId(trainer.trainer_id);
      setTrainerSearchValue(trainer.display_name);
    }
    trainerCombobox.closeDropdown();
  }

  function handleSpeciesChange(species: Species, checked: boolean) {
    if (checked) {
      setSpeciesTrained((prev) => [...prev, species]);
    } else {
      setSpeciesTrained((prev) => prev.filter((s) => s !== species));
    }
  }

  function focusErrorSummary() {
    setTimeout(() => {
      errorSummaryRef.current?.focus();
    }, 0);
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (traineeId === null) {
      errors.trainee_id = 'Select a trainee';
    }
    if (trainerId === null) {
      errors.trainer_id = 'Select a trainer';
    }
    if (!trainingType) {
      errors.training_type = 'Select a training type';
    }
    if (speciesTrained.length === 0) {
      errors.species_trained = 'Select at least one species';
    }
    if (!dateTrained) {
      errors.date_trained = 'Enter a training date';
    } else {
      const today = new Date().toISOString().split('T')[0];
      if (dateTrained > today) {
        errors.date_trained = 'Training date cannot be in the future';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setHasSubmitted(true);
    setServerErrors([]);

    if (selfTrainingError) {
      focusErrorSummary();
      return;
    }

    if (!validate()) {
      focusErrorSummary();
      return;
    }

    if (trainingId === null) return;

    const dateStr = dateTrained;

    updateTraining.mutate(
      {
        id: trainingId,
        data: {
          trainee_id: traineeId!,
          trainer_id: trainerId!,
          training_type: trainingType as TrainingType,
          species_trained: speciesTrained,
          date_trained: dateStr,
        },
      },
      {
        onSuccess: () => {
          navigate(`/persons/${traineeId}/training`);
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

  function handleErrorLinkClick(e: React.MouseEvent<HTMLAnchorElement>, fieldId: string) {
    e.preventDefault();
    const el = document.getElementById(fieldId);
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  const allErrors = [
    ...(selfTrainingError ? [{ field: 'trainer_id', message: selfTrainingError }] : []),
    ...Object.entries(fieldErrors).map(([field, message]) => ({ field, message })),
    ...serverErrors.map((msg) => ({ field: '', message: msg })),
  ];

  const traineeOptions = useMemo(
    () =>
      personResults.map((person) => (
        <Combobox.Option value={String(person.person_id)} key={person.person_id}>
          {person.display_name} (ID: {person.person_id})
        </Combobox.Option>
      )),
    [personResults],
  );

  const trainerOptions = useMemo(
    () =>
      filteredTrainers.map((trainer) => (
        <Combobox.Option value={String(trainer.trainer_id)} key={trainer.trainer_id}>
          {trainer.display_name}
          {trainer.person_id ? ' (Cascade)' : ' (APHA Staff)'}
        </Combobox.Option>
      )),
    [filteredTrainers],
  );

  if (isTrainingLoading) {
    return <Loader data-testid="edit-loading" aria-label="Loading training record" />;
  }

  if (!training) {
    return (
      <Alert color="red" title="Training record not found" data-testid="training-not-found" role="alert">
        No training record found with ID &quot;{id}&quot;.
      </Alert>
    );
  }

  return (
    <div style={{ maxWidth: '680px' }}>
      <Title
        order={1}
        style={{
          fontFamily: GDS_FONT,
          fontSize: '36px',
          fontWeight: 700,
          marginBottom: '30px',
        }}
      >
        Edit training record
      </Title>

      {allErrors.length > 0 && hasSubmitted && (
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
              fontFamily: GDS_FONT,
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
                      fontFamily: GDS_FONT,
                      fontSize: '16px',
                      fontWeight: 700,
                    }}
                  >
                    {err.message}
                  </a>
                ) : (
                  <span
                    style={{
                      color: '#d4351c',
                      fontFamily: GDS_FONT,
                      fontSize: '16px',
                      fontWeight: 700,
                    }}
                  >
                    {err.message}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {selfTrainingError && (
        <Alert
          color="red"
          title="Self-training not allowed"
          mb="lg"
          styles={{
            root: { borderLeft: '5px solid #d4351c' },
            title: { fontWeight: 700 },
          }}
          role="alert"
          data-testid="self-training-error"
        >
          {selfTrainingError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <Combobox store={traineeCombobox} onOptionSubmit={handleTraineeSelect}>
          <Combobox.Target>
            <TextInput
              id="trainee_id"
              label="Trainee"
              description="Search for a person by name"
              required
              placeholder="Start typing a name..."
              value={traineeSearchValue}
              onChange={(event) => {
                setTraineeSearchValue(event.currentTarget.value);
                setTraineeId(null);
                traineeCombobox.openDropdown();
                traineeCombobox.updateSelectedOptionIndex();
              }}
              onClick={() => traineeCombobox.openDropdown()}
              onFocus={() => traineeCombobox.openDropdown()}
              onBlur={() => traineeCombobox.closeDropdown()}
              rightSection={isSearchingPersons ? <Loader size={16} aria-label="Searching persons" /> : null}
              error={hasSubmitted ? fieldErrors.trainee_id : undefined}
              mb="md"
              data-testid="trainee-search-input"
              aria-autocomplete="list"
              autoComplete="off"
              styles={{
                label: GDS_LABEL_STYLE,
                input: {
                  borderColor: hasSubmitted && fieldErrors.trainee_id ? '#d4351c' : undefined,
                  borderWidth: hasSubmitted && fieldErrors.trainee_id ? '3px' : undefined,
                },
                error: GDS_ERROR_STYLE,
              }}
            />
          </Combobox.Target>
          <Combobox.Dropdown>
            <Combobox.Options>
              <ScrollArea.Autosize mah={200}>
                {traineeOptions.length > 0 ? (
                  traineeOptions
                ) : (
                  <Combobox.Empty>
                    {isSearchingPersons ? 'Loading...' : 'No persons found'}
                  </Combobox.Empty>
                )}
              </ScrollArea.Autosize>
            </Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>

        <Combobox store={trainerCombobox} onOptionSubmit={handleTrainerSelect}>
          <Combobox.Target>
            <TextInput
              id="trainer_id"
              label="Trainer"
              description="Search for a trainer by name"
              required
              placeholder="Start typing a trainer name..."
              value={trainerSearchValue}
              onChange={(event) => {
                setTrainerSearchValue(event.currentTarget.value);
                setTrainerId(null);
                trainerCombobox.openDropdown();
                trainerCombobox.updateSelectedOptionIndex();
              }}
              onClick={() => trainerCombobox.openDropdown()}
              onFocus={() => trainerCombobox.openDropdown()}
              onBlur={() => trainerCombobox.closeDropdown()}
              error={hasSubmitted ? fieldErrors.trainer_id : undefined}
              mb="md"
              data-testid="trainer-search-input"
              aria-autocomplete="list"
              autoComplete="off"
              styles={{
                label: GDS_LABEL_STYLE,
                input: {
                  borderColor: hasSubmitted && fieldErrors.trainer_id ? '#d4351c' : undefined,
                  borderWidth: hasSubmitted && fieldErrors.trainer_id ? '3px' : undefined,
                },
                error: GDS_ERROR_STYLE,
              }}
            />
          </Combobox.Target>
          <Combobox.Dropdown>
            <Combobox.Options>
              <ScrollArea.Autosize mah={200}>
                {trainerOptions.length > 0 ? (
                  trainerOptions
                ) : (
                  <Combobox.Empty>No trainers found</Combobox.Empty>
                )}
              </ScrollArea.Autosize>
            </Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>

        <fieldset
          id="training_type"
          style={{
            border: 'none',
            padding: 0,
            margin: '0 0 16px 0',
          }}
        >
          <legend
            style={{
              ...GDS_LABEL_STYLE,
              marginBottom: '8px',
              display: 'block',
            }}
          >
            Training Type <span style={{ color: '#d4351c' }}>*</span>
          </legend>
          <Radio.Group
            value={trainingType}
            onChange={(value) => setTrainingType(value as TrainingType)}
            error={hasSubmitted ? fieldErrors.training_type : undefined}
          >
            {TRAINING_TYPES.map((tt) => (
              <Radio
                key={tt.value}
                value={tt.value}
                label={tt.label}
                mb="xs"
                data-testid={`training-type-${tt.value}`}
                styles={{
                  label: { fontFamily: GDS_FONT, fontSize: '16px' },
                }}
              />
            ))}
          </Radio.Group>
        </fieldset>

        <fieldset
          id="species_trained"
          style={{
            border: 'none',
            padding: 0,
            margin: '0 0 16px 0',
          }}
        >
          <legend
            style={{
              ...GDS_LABEL_STYLE,
              marginBottom: '8px',
              display: 'block',
            }}
          >
            Species <span style={{ color: '#d4351c' }}>*</span>
          </legend>
          {SPECIES_OPTIONS.map((sp) => (
            <Checkbox
              key={sp.value}
              label={sp.label}
              checked={speciesTrained.includes(sp.value)}
              onChange={(e) => handleSpeciesChange(sp.value, e.currentTarget.checked)}
              mb="xs"
              data-testid={`species-${sp.value}`}
              styles={{
                label: { fontFamily: GDS_FONT, fontSize: '16px' },
              }}
            />
          ))}
          {hasSubmitted && fieldErrors.species_trained && (
            <Text size="sm" style={GDS_ERROR_STYLE} mt="xs" data-testid="species-error">
              {fieldErrors.species_trained}
            </Text>
          )}
        </fieldset>

        <TextInput
          id="date_trained"
          label="Training Date"
          required
          type="date"
          value={dateTrained}
          onChange={(event) => setDateTrained(event.currentTarget.value)}
          max={new Date().toISOString().split('T')[0]}
          mb="xl"
          data-testid="date-trained-input"
          error={hasSubmitted ? fieldErrors.date_trained : undefined}
          styles={{
            label: GDS_LABEL_STYLE,
            input: {
              borderColor: hasSubmitted && fieldErrors.date_trained ? '#d4351c' : undefined,
              borderWidth: hasSubmitted && fieldErrors.date_trained ? '3px' : undefined,
            },
            error: GDS_ERROR_STYLE,
          }}
        />

        <Group>
          <Button
            variant="default"
            onClick={() => navigate(`/persons/${training?.trainee_id}/training`)}
            data-testid="cancel-button"
            styles={{
              root: {
                backgroundColor: '#f3f2f1',
                color: '#0b0c0c',
                border: 'none',
                boxShadow: '0 2px 0 #929191',
                fontFamily: GDS_FONT,
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
            loading={updateTraining.isPending}
            disabled={!!selfTrainingError}
            data-testid="save-button"
            styles={{
              root: {
                backgroundColor: '#00703c',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 2px 0 #002d18',
                fontFamily: GDS_FONT,
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
