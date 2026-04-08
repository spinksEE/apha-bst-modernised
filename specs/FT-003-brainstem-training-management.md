# FT-003: Brainstem Training Management

## Metadata

| Field                   | Value                                                                                                                       |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Feature ID**          | FT-003                                                                                                                      |
| **Upstream Features**   | FT-002                                                                                                                      |
| **Downstream Features** | FT-004, FT-005                                                                                                              |
| **Feature Name**        | Brainstem Training Management                                                                                               |
| **Owner**               | APHA Supervisor                                                                                                             |
| **Priority**            | Must                                                                                                                        |
| **Last Updated**        | 2026-04-07                                                                                                                  |
| **PRD Reference**       | Bounded Context - Brainstem Training Management; Business Rules BR-001 to BR-005, BR-013, BR-014; Workflows (Primary, Cascade, Maintenance) |
| **Open Questions**      | 3                                                                                                                           |

---

## 1. Problem Statement

The legacy system records training events with dates stored as free-text strings, allowing invalid entries and compromising data integrity. It fails to enforce critical business rules, theoretically permitting individuals to act as their own trainers and allowing unqualified trainers to cascade training to others. Furthermore, recording training is inefficient, particularly because sheep and goat procedures are identical yet must be logged separately, increasing the administrative burden on APHA staff.

## 2. Benefit Hypothesis

We believe that implementing a unified, strongly-typed training management capability with strict validation logic will result in accurate, reliable certification records for APHA and site personnel. We will know this is true when data entry errors (such as invalid dates or self-assigned training) drop to zero, and compliance audits can be conducted without manual data cleansing.

## 3. Target Users and Personas

| Persona | Role Description | Relationship to Feature | Usage Frequency |
|---------|-----------------|------------------------|-----------------|
| **APHA Supervisor** | Senior APHA staff with full system access | Primary — Oversees training data integrity, manages all records, and performs complex corrections. | Daily |
| **APHA Data Entry User** | APHA staff with restricted data entry permissions | Primary — Enters new training records and logs cascade training events. | Daily |
| **APHA Read-Only User** | APHA staff requiring view access | Secondary — Views training records for enquiries and verifications. | Ad-hoc |
| **Trainee / Trainer** | Personnel receiving or delivering training | Secondary — Passive subjects whose qualifications are tracked. | Ad-hoc |

## 4. User Goals and Success Criteria

| #   | User Goal                                    | Success Criterion                                                 |
| --- | -------------------------------------------- | ----------------------------------------------------------------- |
| 1   | Record a new training or cascade event       | A complete training record is saved, linking trainee and trainer. |
| 2   | Prevent illogical or fraudulent records      | System explicitly blocks self-training and duplicate events.      |
| 3   | Record combined species training             | A single training record can certify a trainee for both sheep and goats. |
| 4   | Review and maintain training history         | Authorised users can view, edit, or remove erroneous historical training records. |

## 5. Scope and Boundaries

### In Scope

- Creation of single training records linking a trainee to a trainer, date, species, and training type.
- View and maintenance capabilities (editing, logically archiving/deleting records).
- Strict enforcement of business rules including self-training prevention and required fields.
- Validation of trainer eligibility for cascade training based on historical records.
- Ability to select multiple species for a single training event (e.g., Sheep + Goat).

### Out of Scope

- Bulk entry capabilities for group training events (identified as a pain point but deferred to a future enhancement to ensure core stability first).
- Management of Site profiles (delegated to FT-001).
- Management of base Person profiles (delegated to Personnel Management feature FT-002).
- External generation of training notifications by site personnel (these remain out-of-system via post/email).

### Boundaries

- Hand-off from Personnel Management: Depends on valid Person records for Trainee and Trainer selections.
- Handoff to Reporting (FT-005): Provides cleaned, validated data for the Training Records and Trainer Activity reports.

## 6. User Stories and Acceptance Criteria

### US-021: Record New Training Event

**Story:** As an APHA Data Entry User, I want to record a new training event for an individual, so that their certification for brainstem sampling is officially recognised.

**Priority:** Must

**Wireframes:**

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ APHA BST System                                       [ Supervisor User ▼ ] │
├─────────────────────────────────────────────────────────────────────────────┤
│  Home  │  Sites  │  Personnel  │  [ Training ]  │  Reports  │  Admin      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Training > Add New Record                                             │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║ Record New Training Event                                             ║  │
│  ║                                                                       ║  │
│  ║  Trainee:       [ Smith, John (Site: UK12345) ▼ ]                  [1] ║  │
│  ║                                                                       ║  │
│  ║  Trainer:       [ Jones, Sarah (APHA) ▼ ]                         [2] ║  │
│  ║                                                                       ║  │
│  ║  Training Type: (o) Trained  ( ) Cascade Trained  ( ) Training Confirmed  [3] ║  │
│  ║                                                                       ║  │
│  ║  Species:       [x] Cattle   [ ] Sheep   [ ] Goat                 [4] ║  │
│  ║                                                                       ║  │
│  ║  Training Date: | 01/03/2026 | [▼]                                [5] ║  │
│  ║                                                                       ║  │
│  ║                            [ Cancel ] [ Save Training Record ]        ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```
*Key:*
[1] Typeahead dropdown to search existing personnel.
[2] Searchable dropdown of registered Trainer records (per FT-002).
[3] Radio buttons to select the classification of the training.
[4] Checkboxes accommodating the new multi-species capability.
[5] Strictly typed date-picker restricting selection to valid past/present dates.

**Acceptance Criteria:**

```gherkin
Scenario: Successfully save a complete training record
  Given a person "Smith, John" exists in the system
  And a qualified trainer "Jones, Sarah" exists
  When I fill out the training form with trainee "Smith, John", trainer "Jones, Sarah", type "Trained", species "Cattle", and date "2026-03-01"
  And I click "Save Training Record"
  Then the training record is saved successfully
  And the trainee's overall training status is evaluated to TRUE
  And an entry is added to the system audit log

Scenario: Attempt to save with missing Training Date
  Given I am on the Record New Training Event screen
  When I attempt to click "Save Training Record" without selecting a Training Date
  Then the system displays an inline validation error "Training Date is required"
  And the record is not saved

Scenario: Attempt to save with missing Trainee
  Given I am on the Record New Training Event screen
  When I attempt to click "Save Training Record" without selecting a Trainee
  Then the system displays an inline validation error "Trainee Name is required"
  And the record is not saved

Scenario: Attempt to save with missing Trainer
  Given I am on the Record New Training Event screen
  When I attempt to click "Save Training Record" without selecting a Trainer
  Then the system displays an inline validation error "Trainer Name is required"
  And the record is not saved

Scenario: Attempt to save with no species selected
  Given I am on the Record New Training Event screen
  And I have filled in the Trainee, Trainer, Training Type, and Training Date
  When I attempt to click "Save Training Record" without ticking any Species checkbox
  Then the system displays an inline validation error "At least one Species must be selected"
  And the record is not saved

Scenario: Attempt to save with missing Training Type
  Given I am on the Record New Training Event screen
  And I have filled in the Trainee, Trainer, Species, and Training Date
  When I attempt to click "Save Training Record" without selecting a Training Type
  Then the system displays an inline validation error "Training Type is required"
  And the record is not saved

Scenario: Attempt to save with a future Training Date
  Given I am on the Record New Training Event screen
  And I have filled in all mandatory fields
  When I select a Training Date that is in the future
  And I attempt to click "Save Training Record"
  Then the system displays an inline validation error "Training Date cannot be in the future"
  And the record is not saved
```

### US-022: Prevent Self-Training and Duplicate Records

**Story:** As an APHA Data Entry User, I want the system to validate trainees and trainers, so that illogical combinations like self-training or exact duplicate records are blocked.

**Priority:** Must

**Wireframes:**

```text
╔═══════════════════════════════════════════════════════════════════════╗
║ Record New Training Event                                             ║
║                                                                       ║
║  ┌─────────────────────────────────────────────────────────────────┐  ║
║  │ [!] Error: Trainer and Trainee cannot be the same person.       │  ║
║  └─────────────────────────────────────────────────────────────────┘  ║
║                                                                       ║
║  Trainee:       [ Smith, John (Site: UK12345) ▼ ]                      ║
║  Trainer:       [ Smith, John (Site: UK12345) ▼ ]                  [1] ║
║                                                                       ║
║                            [ Cancel ] [ Save Training Record ]    [2] ║
╚═══════════════════════════════════════════════════════════════════════╝
```
*Key:*
[1] Same individual selected as both Trainee and Trainer.
[2] Save button deactivated or triggers the validation error banner upon click.

**Acceptance Criteria:**

```gherkin
Scenario: Prevent self-training assignment
  Given I am filling out a new training record
  And I have selected "Smith, John" as the Trainee
  When I select "Smith, John" as the Trainer
  Then the system displays an error banner "Trainer and Trainee cannot be the same person"
  And the "Save Training Record" capability is blocked

Scenario: Prevent duplicate training entry
  Given a training record already exists for "Smith, John" with type "Trained", species "Cattle", on "01/03/2026"
  When I attempt to save a new record with the exact same Trainee, Training Type, Species, and Date
  Then the system displays an error "A training record for this person, training type, species, and date already exists."
  And a duplicate record is not created
```

### US-023: Record Cascade Training with Eligibility Validation

**Story:** As an APHA Data Entry User, I want the system to verify the trainer's qualifications when recording a cascade training event, so that site personnel can only train others on species they are certified for themselves.

**Priority:** Should

**Wireframes:**

```text
╔═══════════════════════════════════════════════════════════════════════╗
║ Record New Training Event                                             ║
║                                                                       ║
║  Trainee:       [ Evans, Mark (Site: UK5678) ▼ ]                       ║
║  Trainer:       [ Smith, John (Site: UK12345) ▼ ]                  [1] ║
║                                                                       ║
║  Training Type: ( ) Trained  (o) Cascade Trained  ( ) Training Confirmed  [2] ║
║                                                                       ║
║  Species:       [ ] Cattle   [x] Sheep   [ ] Goat                 [3] ║
║                 (Trainer is only qualified for: Cattle, Sheep)        ║
║                                                                       ║
║                            [ Cancel ] [ Save Training Record ]        ║
╚═══════════════════════════════════════════════════════════════════════╝
```
*Key:*
[1] A site personnel member is selected as Trainer.
[2] "Cascade Trained" is chosen as the training type.
[3] System validates the selected species against the Trainer's historical qualifications.

**Acceptance Criteria:**

```gherkin
Scenario: Restrict species selection to trainer's qualifications
  Given I have selected "Cascade Trained" as the Training Type
  And I have selected a registered cascade Trainer (per FT-002 US-015) linked to a Person record
  And the Trainer's only historical certification is in "Cattle"
  When I attempt to select "Goat" as the training species
  Then the system displays an error "Trainer is not qualified to deliver training for Goat"
  And I am prevented from saving the record

Scenario: Successfully save valid cascade training
  Given I have selected "Cascade Trained" as the Training Type
  And I have selected a registered cascade Trainer (per FT-002 US-015) linked to a Person record
  And the Trainer is qualified in "Sheep"
  When I select "Sheep" as the target species
  And successfully save the record
  Then the training record is logged with type "Cascade Trained"
  And it is implicitly linked to the trainer's qualification lineage
```

### US-024: View and Edit Individual Training Records

**Story:** As an APHA Supervisor, I want to view a chronological list of an individual's training entries and modify them, so that I can correct data entry errors or manage compliance statuses.

**Priority:** Must

**Wireframes:**

```text
╔══════════════════════════════════════════════════════════════════════════════╗
║ Training History: Smith, John                                                ║
║                                                                              ║
║  [ + Add New Training ]                                                      ║
║                                                                              ║
║  Date       │ Training Type   │ Species │ Trainer         │ Actions          ║
║ ────────────┼─────────────────┼─────────┼─────────────────┼──────────────────║
║  01/03/2026 │ Trained         │ Cattle  │ Jones, Sarah    │ [Edit] [Delete]  ║ 
║  15/06/2025 │ Cascade Trained │ Sheep   │ Evans, Mark     │ [Edit] [Delete]  ║ 
╚══════════════════════════════════════════════════════════════════════════════╝
```

**Acceptance Criteria:**

```gherkin
Scenario: View training history
  Given I navigate to a Person's profile
  When I view the "Training" tab or section
  Then I am presented with a chronological list of all training events associated with that person
  And the grid displays Date, Type, Species, and Trainer name

Scenario: Edit a training record
  Given I am viewing a person's training history
  When I click "[Edit]" on a specific historical record
  Then I am presented with the training form populated with the existing data
  And when I change the Date and click "Save", the record is updated successfully
  And an entry detailing the modification is written to the audit log
```

### US-025: Logically Delete Invalid Training Records

**Story:** As an APHA Supervisor, I want to delete erroneous training records with an audit trail, so that the individual's certification history accurately reflects reality without losing the required audit information.

**Priority:** Must

**Wireframes:**

```text
╔═══════════════════════════════════════════════════════════════════════╗
║ Delete Training Record                                                ║
║                                                                       ║
║  Are you sure you want to delete this training record?                ║
║                                                                       ║
║  Trainee: Smith, John                                                 ║
║  Date:    01/03/2026                                                  ║
║  Species: Cattle                                                      ║
║                                                                       ║
║  [!] This action will be recorded in the system audit log.        [1] ║
║                                                                       ║
║                            [ Cancel ] [ Confirm Delete ]              ║
╚═══════════════════════════════════════════════════════════════════════╝
```
*Key:*
[1] Warning to ensure the supervisor is aware the deletion is logged.

**Acceptance Criteria:**

```gherkin
Scenario: Logically delete a record
  Given I am viewing a person's training history
  When I click "[Delete]" on a training record and confirm the prompt
  Then the training record is logically marked as deleted
  And it no longer appears in the standard training history grid or reports
  And an entry detailing the deletion is written to the audit log
```

---

## 7. User Flows and Scenarios

### Flow 1: Primary Training Flow
- **Entry point:** APHA User receives a physical/email notification from a site and navigates to the "Training" menu, selecting "Add New Record".
- **Step-by-step actions:** The user searches for the trainee. If the trainee is found, they proceed; if not, they navigate away to create the Person record first. The user selects the Trainer from the dropdown, chooses "Trained" as the type, ticks the correct species checkboxes, and inputs the date.
- **Decision points:** Does a duplicate exist? The system checks and either blocks or allows.
- **Exit points:** User clicks "Save", returning to a success confirmation screen and then the Trainee's profile.
- **Error/exception paths:** If a required field is missed, validation halts the process.

### Flow 2: Cascade Training Flow
- **Entry point:** A site submits a cascade training notification.
- **Step-by-step actions:** User selects the Trainee. User selects the site colleague as the Trainer. The user selects "Cascade" as the type.
- **Decision points:** The system evaluates whether the Trainer has previous training in the species requested.
- **Error/exception paths:** If the Trainer is unqualified for the species, an error blocks submission until corrected.

### Flow 3: Data Maintenance Flow
- **Entry point:** Data quality review identifies an incorrect date. APHA Supervisor opens the person's profile.
- **Step-by-step actions:** Supervisor navigates to the Training tab, locates the erroneous record, and clicks "Edit" or "Delete".
- **Decision points:** Update vs Delete.
- **Exit points:** System updates the database and creates an audit log entry. Supervisor continues their review.

## 8. UI/Layout Specifications

### 8.1 Add Training Modal / Form
- **Screen Title:** Record New Training Event
- **Layout:** Standard single-column form suitable for a modal or a centralized page.
- **Fields:**
  - **Trainee:** Searchable typeahead dropdown. Required. Label: "Trainee Name".
  - **Trainer:** Searchable typeahead dropdown filtered to users designated as qualified trainers. Required. Label: "Trainer Name".
  - **Training Type:** Radio button group (Trained, Cascade Trained, Training Confirmed). Required.
  - **Species:** Checkbox group (Cattle, Sheep, Goat) — allows multi-select functionality. Required.
  - **Training Date:** Native date-picker component. Pre-populated with current date but alterable. Cannot be in the future. Required.
- **Action Buttons:** "Cancel" (Secondary styling, dismisses view), "Save Training Record" (Primary styling, conditionally disabled if pristine or loading).
- **Interaction States:** Loading spinner on Save; global error banner for duplicated/business rule failures.

### 8.2 Training History Tab
- **Context:** Tab integrated within the 'View Person' profile page.
- **Layout:** Standard tabular datagrid.
- **Columns:** Date, Training Type, Species, Trainer, Actions.
- **Controls:** A primary "[ + Add New Training ]" button placed above the grid. Row-level "[Edit]" and "[Delete]" buttons relying on user permission levels (Supervisors see both, Data Entry might see neither).

## 9. Business Rules and Validation

| Rule ID | Rule Description                            | Applies To                  | Validation Behaviour                                                                  |
| ------- | ------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------- |
| BR-001  | A person cannot train themselves            | Save Training Event form    | Error message blocks save: "Trainer and Trainee cannot be the same person".           |
| BR-002  | A person can hold multiple training records | Trainee entity              | Allows saving of new records for different dates/species without collision.           |
| BR-003  | Training type must be strictly typed        | Training Type selection     | Restricted via UI controls (Trained, Cascade Trained, Training Confirmed).            |
| BR-004  | Species must be standard classifications    | Species selection           | Form enforces combinations of Cattle, Sheep, or Goat.                                 |
| BR-005  | Trainers must be qualified for Cascade      | Cascade Training submission | Evaluates Trainer's history. Errors if species requested is not in trainer's history. |
| BR-013  | All fields are mandatory                    | Entire Training Event form  | Inline validation prevents submission until all fields are populated.                 |
| BR-014  | Training date cannot be in the future       | Training Date field         | Date picker restricts to past/present. Error message blocks save: "Training Date cannot be in the future". |

## 10. Data Model and Requirements

### Entities

| Entity | Key Attributes | Description |
|--------|---------------|-------------|
| **Training** | `training_id` (PK), `trainee_id` (FK), `trainer_id` (FK), `date_trained` (Date), `species_trained` (Enum/Flags), `training_type` (Enum), `is_deleted` (Bool), `created_by` (FK), `created_at` (Timestamp), `modified_by` (FK), `modified_at` (Timestamp), `deleted_by` (FK, nullable), `deleted_at` (Timestamp, nullable) | Central record linking all training parameters. Audit fields support NFR-002 traceability. |

### Search Parameters

| Parameter | Type | Behaviour | Required |
|-----------|------|-----------|----------|
| `trainee_id` | Integer | Exact match | Yes |
| `trainer_id` | Integer | Exact match | No |

### Data Relationships
- **Person → Training (Trainee):** One-to-Many (A person can undergo training many times).
- **Person → Training (Trainer):** One-to-Many (A qualified person can train many others).
- **Trainer → Person → Training (Cascade Eligibility):** To validate BR-005, the system traverses from Trainer (via `person_id`) to the Person's Training records to verify species qualification.

## 11. Integration Points and External Dependencies

| System | Integration Type | Direction | Description | Criticality |
|--------|-----------------|-----------|-------------|-------------|
| PostgreSQL Database | Database | Bidirectional | Direct storage and retrieval of training entity data. | Required |

## 12. Non-Functional Requirements

| NFR ID  | Category       | Requirement                                                                  | Acceptance Threshold                                                                         |
| ------- | -------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| NFR-001 | Data Integrity | Dates must be strictly typed and structurally validated.                     | 100% of stored dates must cast to standard Date formats; textual entries must be impossible. |
| NFR-002 | Auditability   | All creations, modifications, and logical deletions of training records must maintain an audit trail detailing user and timestamp. | 100% of create, update, and delete operations covered by system audit logs.                   |

## 13. Legacy Pain Points and Proposed Improvements

| #   | Legacy Pain Point                                              | Impact                                               | Proposed Improvement                                                                       | Rationale                                                   |
| --- | -------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| 1   | One training type max per person allowed, forcing workarounds. | Data manipulation and inaccurate reporting.          | Data model permits one-to-many relationship giving unlimited historical records.           | Better reflects standard compliance reality.                |
| 2   | Sheep and goat training must be manually entered twice.        | Wasted effort for identical procedures.              | Introduce multi-select checkboxes for species on a single record.                          | Halves data entry time for small ruminant cascade training. |
| 3   | Trainer qualification not validated against species.           | Regulatory compliance risk (unqualified trainers).   | System forces a programmatic check on Trainer's past history during "Cascade" submissions. | Secures the integrity of the compliance scheme.             |
| 4   | Dates stored as raw text string format.                        | Impossible to reliably sequence or query timeframes. | Mandated structural Date fields and UI pickers.                                            | Essential for robust data governance.                       |

## 14. Internal System Dependencies

| Dependency | Type | Description | Impact if Unavailable |
|------------|------|-------------|----------------------|
| **Personnel Management (FT-002)** | Blocks | Requires Trainee and Trainer reference data to exist before a record can be saved. | Cannot assign training attributes without base Person records. |

## 15. Business Dependencies

| Dependency                                                        | Owner                        | Description              | Status                             |
| ----------------------------------------------------------------- | ---------------------------- | ------------------------ | ---------------------------------- |
| Legacy Data Migration Mapping | Data Team | Requires mapping of textual dates and orphaned records before import into the new clean schema. | Pending |

## 16. Key Assumptions

| # | Assumption | Risk if Invalid |
|---|-----------|-----------------|
| 1 | A "Trainer" does not require a distinct data structure, they are simply a standard Person entity who holds previous training qualifications or an overarching system flag. | If a Trainer requires a completely distinct lifecycle/approval flow, FT-003 constraints need fundamental redesign. |

## 17. Success Metrics and KPIs

| Metric                                     | Baseline (Legacy)            | Target (New System) | Measurement Method                  |
| ------------------------------------------ | ---------------------------- | ------------------- | ----------------------------------- |
| Self-training data errors                  | Unknown / Present in DB      | 0 incidents         | System automated validation metrics |
| Time to enter combined Sheep/Goat training | ~2 minutes (two submissions) | < 1 minute          | Observational UX testing            |

## 18. Effort Estimate

| Dimension        | Estimate       | Assumptions                                |
| ---------------- | -------------- | ------------------------------------------ |
| **Human Effort** | 5 person-days  | Baseline Person tables and basic UI shell are established upstream. Validation logic assumes simple synchronous DB checks. |

## 19. Open Questions

| #   | Question                                                                                                                                               | Context                                                                                                                                      | Impact                                                                     | Raised By | Status                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | --------- | --------------------------------------- |
| 1   | Should "Bulk Upload" for group events be considered for a fast-follow release?                                                                         | Identified in pain points but omitted here to protect core scope.                                                                            | Could relieve substantial admin burden for large abattoirs.                | Agent     | Deferred                                |
| 2   | Do historical records combining multiple species require specific data uncoupling during migration?                                                    | The new multi-select UI changes how training granularity is displayed.                                                                       | Impacts reporting query complexity.                                        | Agent     | Deferred                                |
| 3   | Should recording a "Training Confirmed" event require the system to verify the trainee already holds an active certification for the selected species? | Glossary defines Training Confirmed as refresher training for existing certification holders, but no user story validates this precondition. | Could allow "confirmed" records for untrained individuals if not enforced. | Agent     | Resolved: does not require verification |

## 20. Definition of Done

This feature is considered done when all of the following are satisfied:

- [ ] All user stories in User Stories and Acceptance Criteria are implemented and pass their acceptance criteria
- [ ] All test scenarios have been met
- [ ] UI implementations match the specifications in UI/Layout Specifications
- [ ] All business rules in Business Rules and Validation are enforced and validated
- [ ] All data model requirements in Data Model and Requirements are implemented
- [ ] All integration points in Integration Points and External Dependencies are connected and functional
- [ ] No open questions in Open Questions remain with status "Open" that block release
- [ ] Feature has been reviewed and accepted by the product owner
- [ ] Feature has been demonstrated to stakeholders

## 21. Glossary

| Term                   | Definition                                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------------------- |
| **Cascade Training**   | Training delivered by a previously trained site person to colleagues, rather than by APHA staff directly. |
| **Training Confirmed** | Secondary or refresher training provided to an individual with an actively existing certification.        |
| **Species Flags**      | The explicit selection identifying whether a trainee is certified to sample Cattle, Sheep, or Goat.       |