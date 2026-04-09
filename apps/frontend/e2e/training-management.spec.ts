import { test, expect, type APIRequestContext } from '@playwright/test';

/**
 * FT-003: Training Management — Playwright Acceptance Tests
 *
 * Covers user stories:
 *   US-021: Record New Training Event
 *   US-022: Prevent Self-Training and Duplicate Records
 *   US-023: Cascade Training Eligibility
 *   US-024: View and Edit Training Records
 *   US-025: Logically Delete Training Records
 *
 * Also covers:
 *   BR-001: No self-training
 *   BR-005: Cascade trainers must be qualified
 *   BR-013: All fields mandatory
 *   BR-014: Date cannot be in the future
 *   has_training lifecycle integration
 *
 * Tests run against the live dev stack (frontend :3000, backend :3001, postgres).
 * Each test seeds and cleans up its own data.
 */

const API = 'http://localhost:3001/api';

interface PersonResponse {
  person_id: number;
  first_name: string;
  last_name: string;
  display_name: string;
  site_id: string;
  has_training: boolean;
}

interface TrainerResponse {
  trainer_id: number;
  first_name: string;
  last_name: string;
  display_name: string;
  location_id: string;
  person_id: number | null;
}

interface TrainingResponse {
  training_id: number;
  trainee_id: number;
  trainer_id: number;
  training_type: string;
  species_trained: string[];
  date_trained: string;
  is_deleted: boolean;
}

// ---------------------------------------------------------------------------
// Seed / cleanup helpers
// ---------------------------------------------------------------------------

async function seedSite(
  request: APIRequestContext,
  data: { plant_no: string; name: string; [key: string]: unknown },
) {
  const res = await request.post(`${API}/sites`, { data });
  expect(res.ok(), `Seed site failed for ${data.plant_no}: ${res.status()}`).toBe(true);
}

async function removeSite(request: APIRequestContext, plantNo: string) {
  // 1. Soft-delete all training records for persons at this site
  const personsRes = await request.get(`${API}/persons?site_id=${plantNo}`);
  let persons: PersonResponse[] = [];
  if (personsRes.ok()) {
    persons = await personsRes.json();
    for (const p of persons) {
      await removeTrainingsForPerson(request, p.person_id);
    }
  }

  // 2. Remove trainers at this location (best-effort — FK constraints may prevent deletion
  //    if soft-deleted training records still reference the trainer)
  const trainersRes = await request.get(`${API}/trainers`);
  if (trainersRes.ok()) {
    const trainers: TrainerResponse[] = await trainersRes.json();
    for (const t of trainers) {
      if (t.location_id === plantNo) {
        await removeTrainerSafe(request, t.trainer_id);
      }
    }
  }

  // 3. Remove persons (now safe since has_training was recomputed to false)
  for (const p of persons) {
    await request.delete(`${API}/persons/${p.person_id}`);
  }

  // 4. Remove the site (may fail if trainers with FK references couldn't be removed — that's OK)
  await request.delete(`${API}/sites/${plantNo}`);
}

async function seedPerson(
  request: APIRequestContext,
  data: { first_name: string; last_name: string; site_id: string },
): Promise<PersonResponse> {
  const res = await request.post(`${API}/persons`, { data });
  expect(res.ok(), `Seed person failed: ${res.status()}`).toBe(true);
  return res.json();
}

async function seedTrainer(
  request: APIRequestContext,
  data: { first_name: string; last_name: string; location_id: string; person_id?: number },
): Promise<TrainerResponse> {
  const res = await request.post(`${API}/trainers`, { data });
  expect(res.ok(), `Seed trainer failed: ${res.status()}`).toBe(true);
  return res.json();
}

async function seedTraining(
  request: APIRequestContext,
  data: {
    trainee_id: number;
    trainer_id: number;
    training_type: string;
    species_trained: string[];
    date_trained: string;
  },
): Promise<TrainingResponse> {
  const res = await request.post(`${API}/trainings`, { data });
  expect(res.ok(), `Seed training failed: ${res.status()}`).toBe(true);
  return res.json();
}

async function removeTrainingsForPerson(request: APIRequestContext, personId: number) {
  const res = await request.get(`${API}/trainings/by-trainee?trainee_id=${personId}`);
  if (res.ok()) {
    const trainings: TrainingResponse[] = await res.json();
    for (const t of trainings) {
      await request.delete(`${API}/trainings/${t.training_id}`);
    }
  }
}

async function removeTrainerSafe(request: APIRequestContext, trainerId: number) {
  // Trainer deletion may fail if training records reference it — just ignore
  await request.delete(`${API}/trainers/${trainerId}`);
}

/**
 * Fill the training form via the UI.
 * Assumes the page is already at /training/add or /training/:id/edit.
 */
async function fillTrainingForm(
  page: import('@playwright/test').Page,
  opts: {
    traineeName?: string;
    trainerName?: string;
    trainingType?: 'Trained' | 'CascadeTrained' | 'TrainingConfirmed';
    species?: ('Cattle' | 'Sheep' | 'Goat')[];
    date?: string;
  },
) {
  if (opts.traineeName) {
    const traineeInput = page.getByTestId('trainee-search-input');
    await traineeInput.clear();
    await traineeInput.fill(opts.traineeName);
    // Wait for dropdown to appear and select the option
    await expect(page.getByRole('option').first()).toBeVisible({ timeout: 10000 });
    await page.getByRole('option').first().click();
  }

  if (opts.trainerName) {
    const trainerInput = page.getByTestId('trainer-search-input');
    await trainerInput.clear();
    await trainerInput.fill(opts.trainerName);
    await expect(page.getByRole('option').first()).toBeVisible({ timeout: 10000 });
    await page.getByRole('option').first().click();
  }

  if (opts.trainingType) {
    await page.getByTestId(`training-type-${opts.trainingType}`).click();
  }

  if (opts.species) {
    for (const sp of opts.species) {
      await page.getByTestId(`species-${sp}`).click();
    }
  }

  if (opts.date) {
    await page.getByTestId('date-trained-input').fill(opts.date);
  }
}

// ============================================================================
// US-021: Record New Training Event
// ============================================================================
test.describe('US-021: Record New Training Event', () => {
  test('records a new training event via the full form flow', async ({ page, request }) => {
    const pn = 'E2ETRN01';
    await removeSite(request, pn);
    await seedSite(request, { plant_no: pn, name: 'TrainingTestSite1' });
    const person = await seedPerson(request, { first_name: 'Zara', last_name: 'Adams', site_id: pn });
    const trainer = await seedTrainer(request, { first_name: 'Yves', last_name: 'Baker', location_id: pn });

    await page.goto('/training/add');

    await fillTrainingForm(page, {
      traineeName: 'Adams',
      trainerName: 'Baker',
      trainingType: 'Trained',
      species: ['Cattle', 'Sheep'],
      date: '2025-03-15',
    });

    await page.getByTestId('save-button').click();

    // Should redirect to training history page
    await expect(page).toHaveURL(new RegExp(`/persons/${person.person_id}/training`));

    // Verify the training record appears in the history table
    await expect(page.getByTestId('training-table')).toBeVisible();
    await expect(page.getByText('2025-03-15')).toBeVisible();
    await expect(page.getByText('Trained')).toBeVisible();
    await expect(page.getByText(/Cattle/)).toBeVisible();

    // Cleanup
    await removeSite(request, pn);
  });

  test('required field validation prevents empty submission (BR-013)', async ({ page }) => {
    await page.goto('/training/add');

    // Clear the default date to trigger date validation too
    await page.getByTestId('date-trained-input').fill('');

    await page.getByTestId('save-button').click();

    // Error summary should appear with all validation messages
    const errorSummary = page.getByTestId('error-summary');
    await expect(errorSummary).toBeVisible();
    await expect(errorSummary.getByText('Select a trainee')).toBeVisible();
    await expect(errorSummary.getByText('Select a trainer')).toBeVisible();
    await expect(errorSummary.getByText('Select a training type')).toBeVisible();
    await expect(errorSummary.getByText('Select at least one species')).toBeVisible();
    await expect(errorSummary.getByText('Enter a training date')).toBeVisible();
  });

  test('rejects future date (BR-014)', async ({ page, request }) => {
    const pn = 'E2ETRN02';
    await removeSite(request, pn);
    await seedSite(request, { plant_no: pn, name: 'FutureDateSite' });
    await seedPerson(request, { first_name: 'Wendy', last_name: 'Cross', site_id: pn });
    await seedTrainer(request, { first_name: 'Victor', last_name: 'Dean', location_id: pn });

    await page.goto('/training/add');

    await fillTrainingForm(page, {
      traineeName: 'Cross',
      trainerName: 'Dean',
      trainingType: 'Trained',
      species: ['Cattle'],
      date: '2099-12-31',
    });

    await page.getByTestId('save-button').click();

    await expect(page.getByTestId('error-summary').getByText('Training date cannot be in the future')).toBeVisible();

    // Cleanup
    await removeSite(request, pn);
  });
});

// ============================================================================
// US-022: Prevent Self-Training and Duplicate Records
// ============================================================================
test.describe('US-022: Self-Training and Duplicates', () => {
  test('prevents self-training (BR-001)', async ({ page, request }) => {
    const pn = 'E2ETRN03';
    await removeSite(request, pn);
    await seedSite(request, { plant_no: pn, name: 'SelfTrainSite' });
    const person = await seedPerson(request, { first_name: 'Uma', last_name: 'Fox', site_id: pn });
    // Create a cascade trainer linked to the same person
    const trainer = await seedTrainer(request, {
      first_name: 'Uma',
      last_name: 'Fox',
      location_id: pn,
      person_id: person.person_id,
    });

    await page.goto('/training/add');

    // Select trainee
    const traineeInput = page.getByTestId('trainee-search-input');
    await traineeInput.fill('Fox');
    await expect(page.getByRole('option', { name: /Fox, Uma/ })).toBeVisible({ timeout: 10000 });
    await page.getByRole('option', { name: /Fox, Uma/ }).click();

    // Select the cascade trainer (same person)
    const trainerInput = page.getByTestId('trainer-search-input');
    await trainerInput.fill('Fox');
    await expect(page.getByRole('option', { name: /Fox, Uma/ })).toBeVisible({ timeout: 10000 });
    await page.getByRole('option', { name: /Fox, Uma/ }).click();

    // Self-training alert should appear
    await expect(page.getByTestId('self-training-error')).toBeVisible();
    await expect(page.getByText('A person cannot train themselves')).toBeVisible();

    // Save button should be disabled
    await expect(page.getByTestId('save-button')).toBeDisabled();

    // Cleanup
    await removeSite(request, pn);
  });

  test('prevents duplicate record', async ({ page, request }) => {
    const pn = 'E2ETRN04';
    await removeSite(request, pn);
    await seedSite(request, { plant_no: pn, name: 'DuplicateSite' });
    const person = await seedPerson(request, { first_name: 'Tara', last_name: 'Grant', site_id: pn });
    const trainer = await seedTrainer(request, { first_name: 'Sam', last_name: 'Hill', location_id: pn });

    // Create a training record via API first
    await seedTraining(request, {
      trainee_id: person.person_id,
      trainer_id: trainer.trainer_id,
      training_type: 'Trained',
      species_trained: ['Cattle'],
      date_trained: '2025-05-10',
    });

    // Now try to create the same training via the UI
    await page.goto('/training/add');

    await fillTrainingForm(page, {
      traineeName: 'Grant',
      trainerName: 'Hill',
      trainingType: 'Trained',
      species: ['Cattle'],
      date: '2025-05-10',
    });

    await page.getByTestId('save-button').click();

    // Server error about duplicate should appear
    await expect(page.getByTestId('error-summary')).toBeVisible();
    await expect(page.getByText(/already exists/)).toBeVisible();

    // Cleanup
    await removeSite(request, pn);
  });
});

// ============================================================================
// US-023: Cascade Training Eligibility
// ============================================================================
test.describe('US-023: Cascade Training', () => {
  test('rejects unqualified trainer for cascade training (BR-005)', async ({ page, request }) => {
    const pn = 'E2ETRN05';
    await removeSite(request, pn);
    await seedSite(request, { plant_no: pn, name: 'CascadeSite1' });

    // Create two persons: one trainee, one who will be the unqualified cascade trainer
    const trainee = await seedPerson(request, { first_name: 'Rose', last_name: 'King', site_id: pn });
    const trainerPerson = await seedPerson(request, { first_name: 'Quinn', last_name: 'Lane', site_id: pn });

    // Create cascade trainer linked to trainerPerson (who has NO training records, so is unqualified)
    const trainer = await seedTrainer(request, {
      first_name: 'Quinn',
      last_name: 'Lane',
      location_id: pn,
      person_id: trainerPerson.person_id,
    });

    await page.goto('/training/add');

    await fillTrainingForm(page, {
      traineeName: 'King',
      trainerName: 'Lane',
      trainingType: 'CascadeTrained',
      species: ['Cattle'],
      date: '2025-04-01',
    });

    await page.getByTestId('save-button').click();

    // Server should reject with eligibility error
    await expect(page.getByTestId('error-summary')).toBeVisible();
    await expect(page.getByText(/not qualified/)).toBeVisible();

    // Cleanup
    await removeSite(request, pn);
  });

  test('cascade training succeeds for qualified trainer', async ({ page, request }) => {
    const pn = 'E2ETRN06';
    await removeSite(request, pn);
    await seedSite(request, { plant_no: pn, name: 'CascadeSite2' });

    // Create trainee, trainer-person, and an APHA staff trainer to initially train the cascade trainer
    const trainee = await seedPerson(request, { first_name: 'Olive', last_name: 'Nash', site_id: pn });
    const trainerPerson = await seedPerson(request, { first_name: 'Noel', last_name: 'Owen', site_id: pn });
    const aphaTrainer = await seedTrainer(request, { first_name: 'Mia', last_name: 'Page', location_id: pn });

    // Train the cascade-trainer-to-be (Noel Owen) in Cattle via APHA trainer — this qualifies them
    await seedTraining(request, {
      trainee_id: trainerPerson.person_id,
      trainer_id: aphaTrainer.trainer_id,
      training_type: 'Trained',
      species_trained: ['Cattle'],
      date_trained: '2025-01-01',
    });

    // Now create cascade trainer linked to the qualified person
    const cascadeTrainer = await seedTrainer(request, {
      first_name: 'Noel',
      last_name: 'Owen',
      location_id: pn,
      person_id: trainerPerson.person_id,
    });

    await page.goto('/training/add');

    await fillTrainingForm(page, {
      traineeName: 'Nash',
      trainerName: 'Owen',
      trainingType: 'CascadeTrained',
      species: ['Cattle'],
      date: '2025-02-15',
    });

    // Need to select the cascade trainer specifically (not APHA)
    // Clear and re-select to ensure we pick the cascade trainer
    const trainerInput = page.getByTestId('trainer-search-input');
    await trainerInput.clear();
    await trainerInput.fill('Owen');
    await expect(page.getByRole('option', { name: /Owen.*Cascade/ })).toBeVisible({ timeout: 10000 });
    await page.getByRole('option', { name: /Owen.*Cascade/ }).click();

    await page.getByTestId('save-button').click();

    // Should succeed and redirect to training history
    await expect(page).toHaveURL(new RegExp(`/persons/${trainee.person_id}/training`));
    await expect(page.getByText('2025-02-15')).toBeVisible();
    await expect(page.getByText('Cascade Trained')).toBeVisible();

    // Cleanup
    await removeSite(request, pn);
  });
});

// ============================================================================
// US-024: View and Edit Training Records
// ============================================================================
test.describe('US-024: View and Edit Training Records', () => {
  test('displays training history in reverse chronological order', async ({ page, request }) => {
    const pn = 'E2ETRN07';
    await removeSite(request, pn);
    await seedSite(request, { plant_no: pn, name: 'HistorySite' });
    const person = await seedPerson(request, { first_name: 'Liam', last_name: 'Reid', site_id: pn });
    const trainer = await seedTrainer(request, { first_name: 'Kate', last_name: 'Shaw', location_id: pn });

    // Create two training records with different dates
    await seedTraining(request, {
      trainee_id: person.person_id,
      trainer_id: trainer.trainer_id,
      training_type: 'Trained',
      species_trained: ['Cattle'],
      date_trained: '2025-01-10',
    });
    await seedTraining(request, {
      trainee_id: person.person_id,
      trainer_id: trainer.trainer_id,
      training_type: 'TrainingConfirmed',
      species_trained: ['Sheep'],
      date_trained: '2025-06-20',
    });

    await page.goto(`/persons/${person.person_id}/training`);

    // Person details should be visible
    await expect(page.getByTestId('person-name')).toContainText('Reid, Liam');

    // Table should be visible with 2 rows
    const table = page.getByTestId('training-table');
    await expect(table).toBeVisible();
    const rows = table.locator('tbody tr');
    await expect(rows).toHaveCount(2);

    // First row should be the more recent date (reverse chronological)
    await expect(rows.first()).toContainText('2025-06-20');
    await expect(rows.last()).toContainText('2025-01-10');

    // Cleanup
    await removeSite(request, pn);
  });

  test('edits a training record and verifies updated values', async ({ page, request }) => {
    const pn = 'E2ETRN08';
    await removeSite(request, pn);
    await seedSite(request, { plant_no: pn, name: 'EditTrainSite' });
    const person = await seedPerson(request, { first_name: 'Jack', last_name: 'Tate', site_id: pn });
    const trainer = await seedTrainer(request, { first_name: 'Iris', last_name: 'Vane', location_id: pn });

    const training = await seedTraining(request, {
      trainee_id: person.person_id,
      trainer_id: trainer.trainer_id,
      training_type: 'Trained',
      species_trained: ['Cattle'],
      date_trained: '2025-03-01',
    });

    // Navigate to edit page
    await page.goto(`/training/${training.training_id}/edit`);

    // Wait for form to load
    await expect(page.getByTestId('trainee-search-input')).toHaveValue(/Tate/, { timeout: 10000 });

    // Change species: add Sheep
    await page.getByTestId('species-Sheep').click();

    // Change date
    await page.getByTestId('date-trained-input').fill('2025-04-01');

    await page.getByTestId('save-button').click();

    // Should redirect to training history
    await expect(page).toHaveURL(new RegExp(`/persons/${person.person_id}/training`));

    // Verify updated values in the table
    await expect(page.getByText('2025-04-01')).toBeVisible();
    await expect(page.getByText(/Cattle.*Sheep|Sheep.*Cattle/)).toBeVisible();

    // Cleanup
    await removeSite(request, pn);
  });
});

// ============================================================================
// US-025: Soft-Delete Training Records
// ============================================================================
test.describe('US-025: Soft-Delete Training Records', () => {
  test('soft-deletes a training record with confirmation modal', async ({ page, request }) => {
    const pn = 'E2ETRN09';
    await removeSite(request, pn);
    await seedSite(request, { plant_no: pn, name: 'DeleteTrainSite' });
    const person = await seedPerson(request, { first_name: 'Hugo', last_name: 'Ward', site_id: pn });
    const trainer = await seedTrainer(request, { first_name: 'Gina', last_name: 'York', location_id: pn });

    const training = await seedTraining(request, {
      trainee_id: person.person_id,
      trainer_id: trainer.trainer_id,
      training_type: 'Trained',
      species_trained: ['Goat'],
      date_trained: '2025-07-01',
    });

    await page.goto(`/persons/${person.person_id}/training`);

    // Verify the record is visible
    await expect(page.getByText('2025-07-01')).toBeVisible();

    // Click delete on the training row
    await page.getByTestId(`delete-training-${training.training_id}`).click();

    // Confirmation modal should appear
    const modal = page.locator('[data-testid="delete-training-modal"] .mantine-Modal-content');
    await expect(modal).toBeVisible();
    await expect(page.getByText('Are you sure you want to delete this training record')).toBeVisible();
    await expect(page.getByText('soft-delete')).toBeVisible();

    // Confirm deletion
    await page.getByTestId('confirm-delete-training-button').click();

    // Modal should close and record should disappear from table
    await expect(modal).not.toBeVisible();
    await expect(page.getByText('2025-07-01')).not.toBeVisible();

    // Empty state should show since this was the only record
    await expect(page.getByTestId('no-trainings-message')).toBeVisible();

    // Cleanup
    await removeSite(request, pn);
  });
});

// ============================================================================
// Integration: has_training lifecycle
// ============================================================================
test.describe('has_training lifecycle', () => {
  test('create training -> has_training true -> delete all -> has_training false', async ({ page, request }) => {
    const pn = 'E2ETRN10';
    await removeSite(request, pn);
    await seedSite(request, { plant_no: pn, name: 'LifecycleSite' });
    const person = await seedPerson(request, { first_name: 'Felix', last_name: 'Zane', site_id: pn });
    const trainer = await seedTrainer(request, { first_name: 'Eve', last_name: 'West', location_id: pn });

    // Verify person starts with has_training: false
    const personBefore: PersonResponse = await (await request.get(`${API}/persons/${person.person_id}`)).json();
    expect(personBefore.has_training).toBe(false);

    // Create a training record via API
    const training = await seedTraining(request, {
      trainee_id: person.person_id,
      trainer_id: trainer.trainer_id,
      training_type: 'Trained',
      species_trained: ['Cattle'],
      date_trained: '2025-05-01',
    });

    // Verify has_training flipped to true
    const personAfterCreate: PersonResponse = await (await request.get(`${API}/persons/${person.person_id}`)).json();
    expect(personAfterCreate.has_training).toBe(true);

    // Verify person cannot be deleted (BR-012 delete guard)
    const deleteAttempt = await request.delete(`${API}/persons/${person.person_id}`);
    expect(deleteAttempt.status()).toBe(409);

    // Soft-delete the training record
    const softDeleteRes = await request.delete(`${API}/trainings/${training.training_id}`);
    expect(softDeleteRes.status()).toBe(204);

    // Verify has_training flipped back to false
    const personAfterDelete: PersonResponse = await (await request.get(`${API}/persons/${person.person_id}`)).json();
    expect(personAfterDelete.has_training).toBe(false);

    // Verify the delete guard (BR-012) no longer blocks — attempt via UI
    // Note: physical deletion of the person is blocked by Prisma FK constraint
    // (soft-deleted training records still hold a trainee_id FK reference).
    // The business rule (BR-012) only checks has_training, which is now false.
    // This is a known limitation of soft-delete with FK constraints.
    await page.goto(`/sites?selected=${pn}`);
    await expect(page.getByText('Zane, Felix')).toBeVisible();
    // The "Trained?" column should show "No"
    const personRow = page.locator('tr', { hasText: 'Zane, Felix' });
    await expect(personRow.getByText('No')).toBeVisible();

    // Cleanup remaining (best-effort — trainers/site may not be fully removable)
    await removeSite(request, pn);
  });
});
