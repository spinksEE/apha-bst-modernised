# FT-004: Brainstem Training Management

## Metadata

| Field                   | Value                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Feature ID**          | FT-004                                                                                                                         |
| **Upstream Features**   | FT-001, FT-002, FT-003                                                                                                         |
| **Downstream Features** | FT-005                                                                                                                 |
| **Feature Name**        | Brainstem Training Management                                                                                                     |
| **Owner**               | APHA Data Management Team                                                               |
| **Priority**            | Must — Core functionality for training certification tracking, essential for regulatory compliance and site personnel qualification management |
| **Last Updated**        | 2026-03-31                                                                                     |
| **PRD Reference**       | Bounded Context: Brainstem Training Management; Primary Training Workflow; Cascade Training Workflow                                  |
| **Open Questions**      | 4                                                     |

---

## 1. Problem Statement

The current system relies on manual processes and fragmented data entry for recording brainstem sampling training certifications, leading to data quality issues, duplicate records, and inefficient maintenance of trainer qualifications. Users struggle with inconsistent date formats, lack of validation for trainer eligibility, and cumbersome workarounds for multiple training types, creating compliance risks and operational inefficiency.

## 2. Benefit Hypothesis

We believe that implementing a comprehensive training record management system with automated validation, standardised data entry, and integrated trainer qualification checking will result in improved data quality, reduced administrative overhead, and enhanced regulatory compliance for APHA staff and site personnel. We will know this is true when training record errors decrease by 80%, data entry time reduces by 50%, and compliance reporting becomes automated rather than manual.

## 3. Target Users and Personas

| Persona | Role Description | Relationship to Feature | Usage Frequency |
|---------|-----------------|------------------------|-----------------|
| APHA Supervisor | Senior APHA staff with full system access | Primary | Daily |
| APHA Data Entry User | APHA staff with restricted access for data entry | Primary | Daily |
| APHA Read-Only User | APHA staff requiring view access for enquiries | Secondary | Weekly |
| Trainer | APHA staff or qualified site personnel delivering training | Secondary | Ad-hoc |
| Trainee | Individual receiving training whose records are managed | Occasional | Ad-hoc |

Training record management requires domain expertise in regulatory compliance and understanding of brainstem sampling procedures. Users need familiarity with training types, species requirements, and cascade training eligibility rules.

## 4. User Goals and Success Criteria

| #   | User Goal                                    | Success Criterion                                                 |
| --- | -------------------------------------------- | ----------------------------------------------------------------- |
| 1   | Record new training events accurately and efficiently | Training record created within 2 minutes with zero validation errors |
| 2   | View complete training history for any individual | All training records displayed within 3 seconds with full details |
| 3   | Maintain data quality through validation | 95% reduction in duplicate or invalid training records |
| 4   | Support cascade training workflow | Trainer qualification validated automatically before record creation |
| 5   | Ensure regulatory compliance through complete records | 100% of training records contain all mandatory fields and pass audit |

## 5. Scope and Boundaries

### In Scope

- Training record creation, viewing, editing, and deletion functionality
- Validation of business rules (self-training prevention, trainer eligibility, required fields)
- Support for three training types: Trained, Cascade Trained, Training Confirmed
- Species-specific training certification for Cattle, Sheep, and Goat
- Integration with Personnel Management for trainer/trainee data
- Integration with Site Management for training location data
- Automated training status flag updates
- Audit trail logging for all training operations
- Training record search and filtering capabilities

### Out of Scope

- Person/Personnel record management — covered by FT-002
- Site record management — covered by FT-001
- User authentication and authorisation — covered by FT-003
- Training compliance reporting — covered by FT-005
- External training notification submission (handled outside system)
- Training scheduling or calendar management
- Training material or curriculum management

### Boundaries

This feature hands off to Personnel Management for trainer/trainee identity verification, to Site Management for training location validation, and to Reporting for training compliance analysis. It receives training notifications from external site personnel via APHA staff input.

## 6. User Stories and Acceptance Criteria

### US-031: Record new training event

**Story:** As an APHA Data Entry User, I want to create a new training record for a site person, so that their brainstem sampling certification is officially documented and tracked.

**Priority:** Must

**Wireframes:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ BST System - Animal and Plant Health Agency                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ Home | Personnel | Sites | Training | Users | Reports                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ╔═══════════════════════════════════════════════════════════════════════╗   │
│ ║ Add Training Record                                                   ║   │
│ ╠═══════════════════════════════════════════════════════════════════════╣   │
│ ║                                                                       ║   │
│ ║ Trainee (*)        ▼ Select person...                        [1]     ║   │
│ ║                                                                       ║   │
│ ║ Trainer (*)        ▼ Select trainer...                       [2]     ║   │
│ ║                                                                       ║   │
│ ║ Training Type (*)  ▼ Select type...                          [3]     ║   │
│ ║                                                                       ║   │
│ ║ Training Date (*)  |  DD/MM/YYYY  |                          [4]     ║   │
│ ║                                                                       ║   │
│ ║ Species (*)        ▼ Select species...                       [5]     ║   │
│ ║                                                                       ║   │
│ ║ [ Save Training Record ]  [ Cancel ]                         [6][7]  ║   │
│ ║                                                                       ║   │
│ ╚═══════════════════════════════════════════════════════════════════════╝   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key:**
[1] Trainee dropdown - searchable list of all personnel
[2] Trainer dropdown - filtered list of qualified trainers only
[3] Training Type dropdown - Trained, Cascade Trained, Training Confirmed
[4] Date picker with DD/MM/YYYY format validation
[5] Species dropdown - Cattle, Sheep, Goat
[6] Save button - validates all rules before saving
[7] Cancel button - returns to previous screen

**Empty state:** Form displays with all dropdowns showing placeholder text and date field empty.
**Error state:** Validation messages appear below relevant fields in red text.
**Loading state:** Save button shows spinner and becomes disabled during processing.

**Acceptance Criteria:**

```gherkin
Scenario: Successfully create new training record
  Given I am logged in as an APHA Data Entry User
  And person "Smith, John" exists in the system
  And trainer "Jones, Sarah" exists and is qualified
  And species "Cattle" is available for training
  When I select trainee "Smith, John"
  And I select trainer "Jones, Sarah"
  And I select training type "Trained"
  And I enter training date "01/03/2026"
  And I select species "Cattle"
  And I click "Save Training Record"
  Then the training record is saved successfully
  And I see confirmation message "Training record created successfully"
  And the person's training status flag is updated to TRUE
  And an audit log entry is created

Scenario: Prevent self-training assignment
  Given I am logged in as an APHA Data Entry User
  And person "Smith, John" exists as both trainee and potential trainer
  When I select trainee "Smith, John"
  And I attempt to select trainer "Smith, John"
  Then I see error message "A person cannot train themselves"
  And the trainer selection is not accepted
  And the Save button remains disabled

Scenario: Validate required fields
  Given I am logged in as an APHA Data Entry User
  When I click "Save Training Record" without completing all required fields
  Then I see error messages indicating which fields are required
  And the training record is not saved
  And focus moves to the first empty required field
```

### US-032: View training records for an individual

**Story:** As an APHA Read-Only User, I want to view all training records for a specific person, so that I can verify their certification status and training history.

**Priority:** Must

**Wireframes:**

```
╔═══════════════════════════════════════════════════════════════════════╗
║ View Training Records                                                 ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║ Select Person:  ▼ Choose person...                           [1]     ║
║                                                                       ║
║ Training Records for: Smith, John                                     ║
║                                                                       ║
║ ┌───────────┬────────────┬──────────────┬───────────┬─────────────┐   ║
║ │ Date      │ Trainer    │ Type         │ Species   │ Actions     │   ║
║ ├───────────┼────────────┼──────────────┼───────────┼─────────────┤   ║
║ │ 01/03/26  │ Jones, S   │ Trained      │ Cattle    │ Edit Delete │   ║
║ │ 15/02/26  │ Brown, M   │ Cascade      │ Sheep     │ Edit Delete │   ║
║ │ 10/01/26  │ White, P   │ Confirmed    │ Goat      │ Edit Delete │   ║
║ └───────────┴────────────┴──────────────┴───────────┴─────────────┘   ║
║                                                                 [2]   ║
║ [ Add New Training ]                                          [3]     ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
```

**Key:**
[1] Person selection dropdown with search capability
[2] Training records grid showing chronological training history
[3] Add New Training button (visible for users with edit permissions)

**Empty state:** "No training records found for selected person" message displayed.
**Error state:** "Unable to load training records" with retry option.
**Loading state:** Grid shows loading spinner while fetching data.

**Acceptance Criteria:**

```gherkin
Scenario: Successfully view training records
  Given I am logged in as an APHA Read-Only User
  And person "Smith, John" exists with training records
  When I select "Smith, John" from the person dropdown
  Then I see all training records for "Smith, John" displayed in chronological order
  And each record shows training date, trainer name, training type, and species
  And the records are sorted by date with most recent first

Scenario: View person with no training records
  Given I am logged in as an APHA Read-Only User
  And person "Brown, Mary" exists with no training records
  When I select "Brown, Mary" from the person dropdown
  Then I see message "No training records found for Brown, Mary"
  And the training records grid is empty

Scenario: Handle person selection change
  Given I am viewing training records for "Smith, John"
  When I select a different person "Jones, Sarah" from the dropdown
  Then the training records grid updates to show records for "Jones, Sarah"
  And the previous person's records are no longer displayed
```

### US-033: Edit existing training record

**Story:** As an APHA Supervisor, I want to edit an existing training record to correct errors or update information, so that training data remains accurate and compliant.

**Priority:** Must

**Wireframes:**

```
╔═══════════════════════════════════════════════════════════════════════╗
║ Edit Training Record                                                  ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║ Trainee (*)        ▼ Smith, John                             [1]     ║
║                                                                       ║
║ Trainer (*)        ▼ Jones, Sarah                            [2]     ║
║                                                                       ║
║ Training Type (*)  ▼ Trained                                 [3]     ║
║                                                                       ║
║ Training Date (*)  |  01/03/2026  |                         [4]     ║
║                                                                       ║
║ Species (*)        ▼ Cattle                                  [5]     ║
║                                                                       ║
║ [ Update Training Record ]  [ Cancel ]                      [6][7]   ║
║                                                                       ║
║ Created: 01/03/2026 by admin                                         ║
║ Last Modified: 05/03/2026 by supervisor                              ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
```

**Key:**
[1] Trainee dropdown - pre-populated with current value
[2] Trainer dropdown - pre-populated with current value
[3] Training Type dropdown - pre-populated with current value
[4] Date field - pre-populated with current value
[5] Species dropdown - pre-populated with current value
[6] Update button - validates changes before saving
[7] Cancel button - returns without saving changes

**Acceptance Criteria:**

```gherkin
Scenario: Successfully update training record
  Given I am logged in as an APHA Supervisor
  And a training record exists for trainee "Smith, John" dated "01/03/2026"
  When I open the training record for editing
  And I change the training date to "02/03/2026"
  And I click "Update Training Record"
  Then the training record is updated successfully
  And I see confirmation message "Training record updated successfully"
  And an audit log entry records the change
  And the last modified timestamp is updated

Scenario: Prevent invalid updates
  Given I am editing a training record
  When I attempt to change the trainer to be the same as the trainee
  Then I see error message "A person cannot train themselves"
  And the change is not saved
  And the trainer field reverts to the previous valid value

Scenario: Track modification history
  Given I have updated a training record
  When I view the record details
  Then I can see the creation date and user
  And I can see the last modification date and user
  And the audit trail reflects all changes made
```

### US-034: Delete training record

**Story:** As an APHA Supervisor, I want to delete an incorrect training record, so that the system maintains accurate certification data without invalid entries.

**Priority:** Must

**Wireframes:**

```
╔═══════════════════════════════════════════════════════════════════════╗
║ Confirm Delete Training Record                                        ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║ Are you sure you want to delete this training record?                ║
║                                                                       ║
║ Trainee: Smith, John                                                  ║
║ Trainer: Jones, Sarah                                                 ║
║ Training Type: Trained                                                ║
║ Training Date: 01/03/2026                                             ║
║ Species: Cattle                                                       ║
║                                                                       ║
║ Warning: This action cannot be undone.                               ║
║                                                                       ║
║ [ Confirm Delete ]  [ Cancel ]                                [1][2] ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
```

**Key:**
[1] Confirm Delete button - permanently removes the record
[2] Cancel button - returns without deleting

**Acceptance Criteria:**

```gherkin
Scenario: Successfully delete training record
  Given I am logged in as an APHA Supervisor
  And a training record exists for trainee "Smith, John"
  When I click "Delete" on the training record
  And I see the confirmation dialog with record details
  And I click "Confirm Delete"
  Then the training record is permanently deleted
  And I see confirmation message "Training record deleted successfully"
  And an audit log entry records the deletion
  And the person's training status flag is recalculated

Scenario: Cancel deletion
  Given I am viewing the delete confirmation dialog
  When I click "Cancel"
  Then the dialog closes without deleting the record
  And I return to the training records view
  And the record remains unchanged

Scenario: Update training status after deletion
  Given person "Smith, John" has only one training record
  When I delete that training record
  Then the person's training status flag is updated to FALSE
  And their certification status reflects no current training
```

### US-035: Record cascade training event

**Story:** As an APHA Data Entry User, I want to record cascade training delivered by a site person to their colleagues, so that all training pathways are properly documented and tracked.

**Priority:** Must

**Wireframes:**

```
╔═══════════════════════════════════════════════════════════════════════╗
║ Add Cascade Training Record                                           ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║ Trainee (*)        ▼ Brown, Mary                             [1]     ║
║                                                                       ║
║ Site Trainer (*)   ▼ Smith, John (Site Personnel)           [2]     ║
║                    💡 Previously trained: 01/02/2026 - Cattle       ║
║                                                                       ║
║ Training Type (*)  ▼ Cascade Trained                         [3]     ║
║                                                                       ║
║ Training Date (*)  |  15/03/2026  |                         [4]     ║
║                                                                       ║
║ Species (*)        ▼ Cattle                                  [5]     ║
║                                                                       ║
║ [ Save Training Record ]  [ Cancel ]                        [6][7]   ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
```

**Key:**
[1] Trainee dropdown - person receiving cascade training
[2] Trainer dropdown - filtered to show only previously trained site personnel
[3] Training Type dropdown - pre-selected to "Cascade Trained"
[4] Date picker for when cascade training occurred
[5] Species dropdown - limited to species trainer is qualified for
[6] Save button - validates trainer eligibility
[7] Cancel button - returns to previous screen

**Acceptance Criteria:**

```gherkin
Scenario: Successfully record cascade training
  Given I am logged in as an APHA Data Entry User
  And person "Smith, John" has existing training for "Cattle" from "01/02/2026"
  And person "Brown, Mary" exists as a potential trainee
  When I select trainee "Brown, Mary"
  And I select site trainer "Smith, John"
  And I select training type "Cascade Trained"
  And I enter training date "15/03/2026"
  And I select species "Cattle"
  And I click "Save Training Record"
  Then the cascade training record is created successfully
  And the record links to the original trainer's qualification
  And an audit log entry records the cascade training

Scenario: Validate trainer qualification for cascade training
  Given person "Wilson, Tom" has no existing training records
  When I attempt to select "Wilson, Tom" as a cascade trainer
  Then "Wilson, Tom" does not appear in the trainer dropdown
  And I see message "Only previously trained personnel can provide cascade training"

Scenario: Restrict species based on trainer qualification
  Given person "Smith, John" is trained only for "Cattle"
  When I select "Smith, John" as cascade trainer
  Then the species dropdown only shows "Cattle"
  And other species options are not available
```

### US-036: Validate training business rules

**Story:** As an APHA Data Entry User, I want the system to prevent invalid training records according to business rules, so that data integrity is maintained and compliance requirements are met.

**Priority:** Must

**Wireframes:**

```
╔═══════════════════════════════════════════════════════════════════════╗
║ Add Training Record - Validation Error                               ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║ ❌ Error: Smith, John has already trained for Cattle brainstem       ║
║    removal on 01/03/2026. Cannot create duplicate record.            ║
║                                                                       ║
║ Trainee (*)        ▼ Smith, John                             [1]     ║
║                                                                       ║
║ Trainer (*)        ▼ Jones, Sarah                            [2]     ║
║                                                                       ║
║ Training Type (*)  ▼ Trained                                 [3]     ║
║                                                                       ║
║ Training Date (*)  |  01/03/2026  | ❌ Duplicate date               ║
║                                                                [4]    ║
║                                                                       ║
║ Species (*)        ▼ Cattle       | ❌ Already trained               ║
║                                                                [5]    ║
║                                                                       ║
║ [ Save Training Record ]  [ Cancel ]                        [6][7]   ║
║   (disabled)                                                          ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
```

**Key:**
[1] Trainee selection shows validation state
[2] Trainer dropdown excludes trainee to prevent self-training
[3] Training type selection
[4] Date field with inline validation error
[5] Species field with inline validation error
[6] Save button disabled when validation errors exist
[7] Cancel button remains enabled

**Acceptance Criteria:**

```gherkin
Scenario: Prevent duplicate training records
  Given person "Smith, John" has existing training for "Cattle" on "01/03/2026"
  When I attempt to create another training record for "Smith, John" for "Cattle" on "01/03/2026"
  Then I see error message "Smith, John has already trained for Cattle brainstem removal on 01/03/2026. Cannot create duplicate record."
  And the Save button is disabled
  And no duplicate record is created

Scenario: Prevent self-training assignment
  Given person "Smith, John" exists as both potential trainee and trainer
  When I select "Smith, John" as trainee
  Then "Smith, John" does not appear in the trainer dropdown options
  And I cannot assign them as their own trainer

Scenario: Validate all required fields
  Given I am creating a new training record
  When I attempt to save without completing trainee, trainer, training type, date, or species
  Then I see specific error messages for each missing field
  And the Save button remains disabled
  And focus moves to the first incomplete required field
```

### US-037: Handle multiple species training

**Story:** As an APHA Data Entry User, I want to record training for multiple species separately, so that each species certification is tracked individually for compliance purposes.

**Priority:** Should

**Wireframes:**

```
╔═══════════════════════════════════════════════════════════════════════╗
║ Training Records - Multiple Species                                   ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║ Training Records for: Smith, John                                     ║
║                                                                       ║
║ ┌───────────┬────────────┬──────────────┬───────────┬─────────────┐   ║
║ │ Date      │ Trainer    │ Type         │ Species   │ Actions     │   ║
║ ├───────────┼────────────┼──────────────┼───────────┼─────────────┤   ║
║ │ 01/03/26  │ Jones, S   │ Trained      │ Cattle    │ Edit Delete │   ║
║ │ 01/03/26  │ Jones, S   │ Trained      │ Sheep     │ Edit Delete │   ║
║ │ 01/03/26  │ Jones, S   │ Trained      │ Goat      │ Edit Delete │   ║
║ └───────────┴────────────┴──────────────┴───────────┴─────────────┘   ║
║                                                                       ║
║ 📋 Training Summary:                                                  ║
║ • Cattle: Qualified (01/03/2026)                                     ║
║ • Sheep: Qualified (01/03/2026)                                      ║
║ • Goat: Qualified (01/03/2026)                                       ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
```

**Key:**
Each species requires a separate training record even when trained on the same day by the same trainer. Training summary shows current qualification status per species.

**Acceptance Criteria:**

```gherkin
Scenario: Create separate records for multiple species
  Given I am creating training records for multi-species training
  When I create a record for "Smith, John" trained by "Jones, Sarah" on "01/03/2026" for "Cattle"
  And I create another record for "Smith, John" trained by "Jones, Sarah" on "01/03/2026" for "Sheep"
  Then two separate training records are created
  And each record shows the specific species trained
  And the person's training status reflects qualification for both species

Scenario: Display species-specific qualification status
  Given person "Smith, John" has training records for "Cattle" and "Sheep"
  When I view their training records
  Then I see separate entries for each species
  And the training summary shows qualification status per species
  And each species certification can be tracked independently

Scenario: Allow same-day multi-species training
  Given trainer "Jones, Sarah" is qualified for multiple species
  When I create training records for the same trainee, trainer, and date
  But different species "Cattle", "Sheep", and "Goat"
  Then all three records are accepted as valid
  And no duplicate validation errors occur
  And each species training is recorded separately
```

### US-038: Maintain training data integrity

**Story:** As an APHA Supervisor, I want the system to maintain comprehensive audit trails and data integrity checks for all training operations, so that regulatory compliance is ensured and data quality remains high.

**Priority:** Must

**Wireframes:**

```
╔═══════════════════════════════════════════════════════════════════════╗
║ Training Record Audit Trail                                          ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║ Record: Smith, John - Cattle Training (01/03/2026)                   ║
║                                                                       ║
║ ┌─────────────┬──────────┬──────────────┬─────────────────────────┐   ║
║ │ Timestamp   │ User     │ Action       │ Details                 │   ║
║ ├─────────────┼──────────┼──────────────┼─────────────────────────┤   ║
║ │ 01/03 14:30 │ admin    │ Created      │ Initial record creation │   ║
║ │ 05/03 09:15 │ sup1     │ Modified     │ Updated training date   │   ║
║ │ 10/03 11:45 │ sup1     │ Viewed       │ Record accessed         │   ║
║ └─────────────┴──────────┴──────────────┴─────────────────────────┘   ║
║                                                                       ║
║ Data Integrity Status: ✅ Valid                                       ║
║ • All required fields completed                                      ║
║ • Business rules validated                                           ║
║ • Trainer qualification confirmed                                    ║
║ • No duplicate records detected                                      ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
```

**Key:**
Complete audit trail showing all operations with timestamps and user details. Data integrity checks validate all business rules and constraints.

**Acceptance Criteria:**

```gherkin
Scenario: Comprehensive audit logging
  Given I am performing any training record operation
  When I create, update, view, or delete a training record
  Then an audit log entry is created with timestamp, user identity, and action details
  And the audit trail is immutable and cannot be modified
  And all sensitive operations are logged for compliance review

Scenario: Data integrity validation
  Given a training record exists in the system
  When the system performs integrity checks
  Then all required fields are validated for completeness
  And all business rules are verified as satisfied
  And any integrity violations are flagged for correction
  And data quality metrics are updated

Scenario: Training status flag consistency
  Given person "Smith, John" has training records created or deleted
  When the training records are modified
  Then the person's training status flag is automatically recalculated
  And the flag accurately reflects whether they have current valid training
  And the status update is logged in the audit trail
```

---

## 7. User Flows and Scenarios

### Flow 1: Primary Training Workflow

**Entry point:** APHA staff receives training notification from site personnel (via email or post)

**Step-by-step actions:**
1. Staff accesses BST system and navigates to Training > Add Training
2. Staff searches for trainee in person dropdown - if not found, adds new person record (via Personnel Management)
3. Staff searches for training location/site - if not found, adds new site record (via Site Management)
4. Staff selects qualified trainer from dropdown (filtered list of eligible trainers)
5. Staff selects appropriate training type (Trained for APHA staff trainer, Cascade Trained for site trainer)
6. Staff enters training date using date picker
7. Staff selects species trained (Cattle, Sheep, or Goat)
8. Staff clicks Save - system validates all business rules
9. System creates training record and updates trainee's status flag
10. System generates confirmation message and logs audit trail

**Decision points:**
- If trainee not found → redirect to add person workflow
- If trainer not qualified → show validation error, require different trainer selection
- If training type is Cascade Trained → system validates trainer has appropriate qualifications

**Exit points:**
- Success → training record saved, return to training menu
- Validation errors → remain on form with error messages
- Cancel → return to previous screen without saving

**Error/exception paths:**
- System unavailable → show retry message, allow offline data collection
- Invalid date format → inline validation error, prevent submission
- Self-training attempt → trainer dropdown excludes trainee, error message if attempted
- Duplicate training record → validation error with existing record details

### Flow 2: Cascade Training Workflow

**Entry point:** Site submits cascade training notification indicating site-trained person delivered training to colleagues

**Step-by-step actions:**
1. APHA staff receives cascade training notification
2. Staff accesses Add Training screen and selects trainee (person who received cascade training)
3. Staff selects site trainer from filtered dropdown (only shows previously trained site personnel)
4. System displays trainer qualification information (original training date and species)
5. Training type automatically set to "Cascade Trained"
6. Staff enters training date and selects species (limited to what trainer is qualified for)
7. System validates trainer qualification matches species being taught
8. Staff saves record - system creates link to original trainer qualification
9. System updates audit trail showing cascade training chain

**Decision points:**
- If site trainer not qualified → trainer doesn't appear in dropdown, error message shown
- If species mismatch → species dropdown limited to trainer's qualifications

**Exit points:** Cascade training recorded with link to original qualification chain

**Error/exception paths:**
- Trainer lacks qualification → prevented by filtered dropdown and validation
- Species not covered by trainer → species dropdown restricted, validation prevents invalid selection

### Flow 3: Data Maintenance Workflow (Training Records)

**Entry point:** Data quality review, correction request, or compliance audit identifies training data requiring updates

**Step-by-step actions:**
1. APHA Supervisor accesses View Training screen
2. Supervisor selects person from dropdown to review their training history
3. System displays all training records in chronological order
4. Supervisor identifies record requiring correction or deletion
5. For edits: Supervisor clicks Edit, makes changes, validates business rules, saves with audit log
6. For deletions: Supervisor clicks Delete, confirms action, system removes record and recalculates status flags
7. System updates audit trail with maintenance actions
8. If person's training status changes, related workflows are notified

**Decision points:**
- Edit vs Delete → Edit preserves history, Delete removes entirely
- Training status impact → System recalculates whether person remains trained

**Exit points:**
- Data corrected and audit trail updated
- Compliance reports reflect current accurate data

**Error/exception paths:**
- Concurrent modifications → show conflict message, require refresh
- Referential integrity violations → prevent deletion if other records depend on training

---

## 8. UI/Layout Specifications

### 8.1 Add Training Screen - Core Workflow

**Page context:** Accessed via Training dropdown menu from main navigation. Full-width form within main content area.

**Layout structure:**
- Header: Standard BST system header with APHA branding
- Navigation: Horizontal menu bar with Training item highlighted
- Main content area: Centralised form with clear field grouping
- Footer: Standard system footer

**Main content form:**
- **Form title**: "Add Training Record" in large header font
- **Form container**: Centralised card/panel with subtle border and padding
- **Field layout**: Single column, vertically stacked with consistent spacing

**Field specifications:**
- **Trainee field**:
  - Label: "Trainee (*)" with red asterisk indicating required
  - Control: Searchable dropdown with "Select person..." placeholder
  - Behaviour: Auto-complete search, displays "Last, First" name format
  - Width: Full width of form container
  - Validation: Required field, must be existing person

- **Trainer field**:
  - Label: "Trainer (*)" with red asterisk
  - Control: Filtered dropdown showing only qualified trainers
  - Placeholder: "Select trainer..."
  - Behaviour: Dynamically filtered to exclude selected trainee, shows qualification status
  - Width: Full width of form container
  - Validation: Required field, must be different from trainee

- **Training Type field**:
  - Label: "Training Type (*)" with red asterisk
  - Control: Dropdown with three options: "Trained", "Cascade Trained", "Training Confirmed"
  - Default: "Trained" pre-selected for APHA staff trainers
  - Width: Full width of form container
  - Validation: Required field, must match trainer type

- **Training Date field**:
  - Label: "Training Date (*)" with red asterisk
  - Control: Date picker with DD/MM/YYYY format
  - Placeholder: "DD/MM/YYYY"
  - Behaviour: Calendar popup on click, keyboard entry supported
  - Width: 200px fixed width
  - Validation: Required field, valid date format, not future date

- **Species field**:
  - Label: "Species (*)" with red asterisk
  - Control: Dropdown with options "Cattle", "Sheep", "Goat"
  - Placeholder: "Select species..."
  - Behaviour: For cascade training, limited to trainer's qualifications
  - Width: Full width of form container
  - Validation: Required field, must match trainer capabilities

**Action buttons:**
- **Save Training Record button**:
  - Primary blue button, right-aligned
  - Text: "Save Training Record"
  - State: Disabled until all required fields completed
  - Behaviour: Validates business rules, shows loading spinner during save
- **Cancel button**:
  - Secondary grey button, left of Save button
  - Text: "Cancel"
  - Behaviour: Returns to previous screen, confirms if unsaved changes

**Interaction states:**
- **Loading state**: Form shows loading spinner over Save button, fields disabled during processing
- **Error state**: Red error messages appear below relevant fields, form remains editable
- **Success state**: Green confirmation message appears at top of form, form clears for next entry
- **Validation state**: Real-time validation with inline error messages

### 8.2 View Training Screen - Secondary Workflow

**Screen purpose:** Display and manage existing training records for selected individuals

**Navigation context:** Accessible from Training dropdown menu, separate tab/screen from Add Training

**Layout regions:**
- **Selection panel**: Top section with person selection dropdown
- **Records grid**: Main section displaying training history table
- **Action panel**: Bottom section with add/edit/delete actions

**Person selection section:**
- Search dropdown with auto-complete functionality
- Label: "Select Person:" with clear visual hierarchy
- Dropdown shows "Last, First" format with site affiliation where relevant
- Width: 400px with responsive behaviour

**Training records grid:**
- **Column structure**: Date (100px), Trainer (150px), Type (120px), Species (100px), Actions (120px)
- **Sorting**: Default chronological with most recent first, clickable column headers
- **Row styling**: Alternating row colours, hover highlight
- **Data formatting**: Dates in DD/MM/YY format, trainer names abbreviated if needed
- **Pagination**: If more than 20 records, paginated with standard controls

**Action buttons per row:**
- **Edit button**: Small secondary button, opens edit form in modal or new screen
- **Delete button**: Small red button, shows confirmation dialog before deletion
- **Permissions**: Buttons visible based on user role (Read-Only users see view-only)

**Empty state handling:**
- Message: "No training records found for [Person Name]"
- Suggestion: "Use Add New Training to create their first training record"
- Styling: Centered text in training records area

---

## 9. Business Rules and Validation

| Rule ID | Rule Description                               | Applies To                                         | Validation Behaviour                                                          |
| ------- | ---------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------- |
| BR-001  | A person cannot be assigned as both trainer and trainee for the same training record | Training record creation and editing | Error message "A person cannot train themselves", trainer dropdown excludes trainee |
| BR-002  | A person may have multiple training records for different dates, trainers, or species | Training record validation | Allow multiple records, validate each independently against business rules |
| BR-003  | Training type must be one of "Trained", "Cascade Trained", or "Training Confirmed" | Training type field | Dropdown restricts to valid values, validation error if invalid type submitted |
| BR-004  | Training can be provided for Cattle, Sheep, or Goat species individually or in combination | Species field selection | Dropdown restricts to valid species, each species requires separate record |
| BR-005  | Only previously trained personnel can provide cascade training | Cascade trainer selection | Trainer dropdown filtered to show only qualified trainers for cascade training type |
| BR-013  | All training records must specify trainee, trainer, species, training type, and training date | All training record fields | Required field validation, form submission blocked until all fields completed with appropriate error messages |
| BR-014  | All data modification operations must be logged with user identity, timestamp, and operation details | Training record creation, editing, deletion | Automatic audit log entry creation, immutable audit trail maintained |
| BR-015  | Duplicate training records are not allowed for same trainee, species, and training date | Training record creation | Error message "Person has already trained for Species on Date. Cannot create duplicate record." |
| BR-016  | Training dates must be valid dates and cannot be in the future | Training date field | Date format validation, future date prevention with error message |
| BR-017  | Cascade trainers can only train for species they are qualified in | Cascade training species selection | Species dropdown limited to trainer's qualifications, validation prevents mismatched species |

---

## 10. Data Model and Requirements

### Entities

| Entity | Key Attributes | Description |
|--------|---------------|-------------|
| Training | TraineeId, TrainerId, DateTrained, SpeciesTrained, TrainingType | Central record linking trainee, trainer, species, and certification details for brainstem sampling training |
| Person | PersonId, FirstName, LastName, TrainingStatusFlag | Individual receiving or delivering training, with computed training status |
| TrainingType | TypeCode, TypeDescription | Enumeration of training delivery methods (Trained, Cascade Trained, Training Confirmed) |
| Species | SpeciesCode, SpeciesName | Animal types for which training certification is provided (Cattle, Sheep, Goat) |

### Search Parameters

| Parameter | Type | Behaviour | Required |
|-----------|------|-----------|----------|
| Trainee Name | Text | Partial match on first and last name | No |
| Trainer Name | Text | Partial match on first and last name | No |
| Training Date Range | Date Range | Filter records within specified date range | No |
| Species | Enumeration | Exact match for selected species | No |
| Training Type | Enumeration | Exact match for selected type | No |
| Training Status | Boolean | Filter by persons with/without training | No |

### Data Relationships

- Training → Person (Trainee): Many-to-one relationship, one person can have multiple training records
- Training → Person (Trainer): Many-to-one relationship, one trainer can deliver multiple training sessions
- Training → Species: Many-to-one relationship, multiple training records can exist for same species
- Training → TrainingType: Many-to-one relationship, multiple records can use same training type
- Person → Site: Many-to-one relationship for site affiliation (managed by Site Management feature)
- Cascade training records maintain logical link to original trainer qualification through audit trail

---

## 11. Integration Points and External Dependencies

| System | Integration Type | Direction | Description | Criticality |
|--------|-----------------|-----------|-------------|-------------|
| Personnel Management (FT-002) | Internal API | Bidirectional | Retrieve person records for trainee/trainer selection, update training status flags | Required |
| Site Management (FT-001) | Internal API | Inbound | Access site information for training location context and trainer affiliation | Required |
| User Management (FT-003) | Internal API | Inbound | User authentication and role-based permissions for training record operations | Required |
| Audit System | Database | Outbound | Log all training record operations with user identity and timestamps | Required |
| External Email/Post | Manual Process | Inbound | Training notifications from site personnel submitted outside system | Required |

Training Management relies on Personnel Management for trainer/trainee identity verification and training status updates. Site Management provides context for trainer qualifications and location details. User Management controls access permissions for different training record operations.

---

## 12. Non-Functional Requirements

| NFR ID  | Category                                                                    | Requirement                | Acceptance Threshold                       |
| ------- | --------------------------------------------------------------------------- | -------------------------- | ------------------------------------------ |
| NFR-001 | Usability | Intuitive training record creation workflow | 90% of new users can create training record without assistance within first attempt |
| NFR-002 | Data Volume | Support historical and ongoing training records | Handle minimum 10,000 training records with search results returned within 3 seconds |
| NFR-003 | Accessibility | Screen reader compatibility for training forms | All form fields and validation messages accessible via keyboard navigation and screen readers |
| NFR-004 | Data Integrity | Prevent data corruption from concurrent access | Optimistic locking prevents lost updates, audit trail maintains complete operation history |
| NFR-005 | Compliance | Audit trail completeness | 100% of training record operations logged with immutable timestamps and user identification |

---

## 13. Legacy Pain Points and Proposed Improvements

| # | Legacy Pain Point | Impact | Proposed Improvement | Rationale |
|---|------------------|--------|---------------------|-----------|
| 1 | Training dates stored as text strings rather than proper date fields | Invalid dates can be entered, date arithmetic and sorting are unreliable | Implement proper date validation with date picker controls and database date fields | Ensures data quality and enables proper chronological analysis of training records |
| 2 | No validation prevents trainer and trainee being the same person | Self-training records can be created accidentally, violating business rules | Implement client and server-side validation to prevent self-training assignments | Maintains data integrity and prevents regulatory compliance issues |
| 3 | Multiple training types cannot be assigned to one person, requiring workaround with "Training Confirmed" | Users must create artificial "Training Confirmed" records to indicate refresher training | Allow multiple training records per person while maintaining clear audit trail of training progression | Supports real-world training scenarios without artificial data workarounds |
| 4 | Heavy reliance on dropdown selections without search capabilities | Time-consuming to find people in long lists, prone to selection errors | Implement searchable dropdowns with auto-complete functionality | Improves efficiency and reduces data entry errors |
| 5 | No bulk entry options for group training events | Must create individual records for each trainee when multiple people trained simultaneously | Provide batch entry workflow for group training sessions | Reduces repetitive data entry and improves operational efficiency |
| 6 | Sheep and goat training stored separately despite identical procedures | Duplicate effort maintaining separate records for identical training | Consolidate to single "Sheep and Goat" category while preserving historical distinction in legacy data | Eliminates unnecessary duplication while maintaining regulatory compliance |
| 7 | No trainer qualification validation for cascade training | Unqualified trainers could theoretically deliver cascade training | Implement automatic validation that trainers have appropriate species qualifications before allowing cascade training assignment | Ensures training quality and regulatory compliance |

---

## 14. Internal System Dependencies

| Dependency | Type | Description | Impact if Unavailable |
|------------|------|-------------|----------------------|
| FT-002 Personnel Management | Blocks | Person records for trainee and trainer selection, training status flag updates | Cannot create training records without person data, core functionality blocked |
| FT-001 Site Management | Enhances | Site information for training location context and trainer workplace details | Training records can be created but lack location context for regulatory reporting |
| FT-003 User Management | Blocks | User authentication and role-based permissions for different training operations | Cannot access training functionality without user authentication and authorisation |
| Shared Data Services | Blocks | Audit logging, validation services, and data integrity checks | Training records can be created but lack audit trail and validation |
| Database Connection Pool | Blocks | Persistent storage for training records and related data | Core functionality completely unavailable without database access |

---

## 15. Business Dependencies

| Dependency                                                        | Owner                        | Description              | Status                             |
| ----------------------------------------------------------------- | ---------------------------- | ------------------------ | ---------------------------------- |
| Training business rules clarification | APHA Training Policy Team | Definitive rules for training types, cascade training eligibility, and species consolidation | Pending |
| Historical data migration sign-off | APHA Data Management Team | Approval for training record migration approach including date standardisation and species consolidation | Pending |
| User acceptance testing for training workflows | APHA Operational Staff | Validation that new training workflows match operational needs and improve efficiency | In Progress |
| Training notification process documentation | APHA Process Improvement Team | Updated procedures for how site personnel submit training notifications in new system | Pending |

---

## 16. Key Assumptions

| # | Assumption | Risk if Invalid |
|---|-----------|-----------------|
| 1 | Training notifications will continue to be submitted via email/post rather than direct system entry by site personnel | Would require additional user management, authentication, and workflow capabilities for external users |
| 2 | Sheep and goat training can be consolidated into single category without regulatory compliance issues | May require separate species tracking to be maintained, increasing system complexity |
| 3 | Current three training types (Trained, Cascade Trained, Training Confirmed) adequately cover all business scenarios | Additional training types or workflow states may be needed, requiring data model changes |
| 4 | Training qualification validation can be automated based on existing training records without additional certification tracking | May require additional qualification management system or manual override capabilities |
| 5 | Historical training records can be migrated with acceptable data quality despite text-based date storage | Poor quality historical data may require extensive manual cleanup or data loss acceptance |

---

## 17. Success Metrics and KPIs

| Metric                                        | Baseline (Legacy)                      | Target (New System)           | Measurement Method          |
| --------------------------------------------- | -------------------------------------- | ----------------------------- | --------------------------- |
| Training record creation time | 5-10 minutes per record | 2-3 minutes per record | Time tracking during user acceptance testing |
| Data validation errors | 15% of records require correction | 5% of records require correction | Error rate analysis from audit logs |
| Duplicate training records | 8% of submissions are duplicates | 1% of submissions are duplicates | Automated duplicate detection reporting |
| User satisfaction with training workflow | 3.2/5 (baseline survey) | 4.5/5 | Post-implementation user satisfaction survey |
| Time to find trainee/trainer in selection | 30-60 seconds with scrolling | 5-10 seconds with search | User workflow timing analysis |
| Training compliance reporting accuracy | Manual compilation, 20% error rate | Automated compilation, 2% error rate | Compliance report validation against source records |

---

## 18. Effort Estimate

| Dimension        | Estimate       | Assumptions                                |
| ---------------- | -------------- | ------------------------------------------ |
| **Human Effort** | 25 person-days  | Single full-stack developer, includes frontend forms, backend validation, database schema updates, integration with Personnel/Site Management APIs, comprehensive testing of business rules, and training workflow implementation |

---

## 19. Open Questions

| # | Question | Context | Impact | Raised By | Status |
|---|----------|---------|--------|-----------|--------|
| 1 | What are the exact business rules for when each training type (Trained, Cascade Trained, Training Confirmed) should be used, and should the system support multiple concurrent training types for one individual? | PRD mentions issues with multiple training types per person and creation of "Training Confirmed" as workaround | May require data model changes and additional workflow complexity | Agent | Open |
| 2 | How should existing separate sheep and goat training records be handled during migration, and what is the preferred single category name? | Domain analysis indicates identical procedures but separate storage currently | Affects data migration strategy and user interface design | Agent | Open |
| 3 | Should trainer qualification validation be implemented automatically, and what are the specific qualification requirements for each species? | Currently no validation exists but business rules indicate this is needed | Core business rule implementation that affects cascade training workflow | Agent | Open |
| 4 | How should training date validation and conversion be handled during migration from string-based storage? | Database analysis reveals dates stored as strings rather than date types | Affects data migration complexity and data quality | Agent | Open |

**Update the Open Questions count in the Metadata table whenever questions are added or resolved.**

---

## 20. Definition of Done

This feature is considered done when all of the following are satisfied:

- [ ] All user stories in User Stories and Acceptance Criteria are implemented and pass their acceptance criteria
- [ ] All test scenarios have been met
- [ ] UI implementations match the specifications in UI/Layout Specifications
- [ ] All business rules in Business Rules and Validation are enforced and validated
- [ ] All data model requirements in Data Model and Requirements are implemented
- [ ] All integration points in Integration Points and External Dependencies are connected and functional
- [ ] All non-functional requirements in Non-Functional Requirements meet their acceptance thresholds
- [ ] No open questions in Open Questions remain with status "Open" that block release
- [ ] Feature has been reviewed and accepted by the product owner
- [ ] Feature has been demonstrated to stakeholders

---

## 21. Glossary

| Term | Definition |
|------|-----------|
| Training Status Flag | Boolean field on Person entity automatically updated to TRUE when training records exist, FALSE when no training exists |
| Cascade Training | Training delivered by previously trained site personnel to their colleagues, rather than by APHA staff directly |
| Training Type | Classification system distinguishing training delivery method: Trained (APHA staff), Cascade Trained (site personnel), Training Confirmed (refresher) |
| Species Training | Individual certification requirements for Cattle, Sheep, or Goat brainstem sampling, tracked separately even when trained simultaneously |
| Self-Training Prevention | Business rule preventing assignment of same person as both trainer and trainee for any training record |