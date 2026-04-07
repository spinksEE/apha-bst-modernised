# FT-002: Personnel Management

## Metadata

| Field                   | Value                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Feature ID**          | FT-002                                                                                                                         |
| **Upstream Features**   | FT-001                                                                                                                         |
| **Downstream Features** | FT-003                                                                                                                         |
| **Feature Name**        | Personnel Management                                                                                                           |
| **Owner**               | APHA Supervisor                                                                                                                |
| **Priority**            | Must                                                                                                                           |
| **Last Updated**        | 2026-04-07                                                                                                                     |
| **PRD Reference**       | Bounded Context - Personnel Management; Key User Interfaces & Screens - Add Person Screen, Site Trainees View; Business Rules & Processes - BR-009, BR-010, BR-011, BR-012; Entities - Person, Trainer; Workflows - Primary Training Workflow; Computed Fields & Formulas; Known Limitations & Deficiencies - Data Validation Gaps, User Experience Limitations |
| **Open Questions**      | 2                                                                                                                              |

---

## 1. Problem Statement

The legacy system's personnel management relies on inefficient, unfilterable dropdowns and lacks critical data entry safeguards. Users are currently able to edit system-generated Person IDs, format names inconsistently, and inadvertently create duplicate records because the system does not warn them. This introduces significant data quality issues, orphans records due to a lack of referential constraints, and frustrates users who must manually track training statuses and personnel across large sites.

## 2. Benefit Hypothesis

We believe that implementing searchable site selectors, read-only system-generated IDs, separate first and last name fields, and proactive duplicate detection will result in higher data integrity and faster correct data entry for APHA Staff. We will know this is true when duplicate personnel creation drops to zero and the time taken to add a new person to a site decreases measurably, while training status flags accurately reflect underlying records.

## 3. Target Users and Personas

| Persona | Role Description | Relationship to Feature | Usage Frequency |
|---------|-----------------|------------------------|-----------------|
| APHA Supervisor | Senior APHA staff with full system access | Primary | Weekly |
| APHA Data Entry User | APHA staff with restricted access based on screen-level permissions | Primary | Daily |
| APHA Read-Only User | APHA staff requiring view access for enquiries and reporting | Secondary | Weekly |
| Site Personnel | Staff at sampling sites who submit training notifications | Occasional (via APHA Staff) | Monthly |
| System Administrator | Technical staff maintaining system infrastructure | Occasional | Ad-hoc |

## 4. User Goals and Success Criteria

| #   | User Goal                                                             | Success Criterion                                                                                                                       |
| --- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Add a new trainee to the system associated with a specific site       | A new person record is saved with a correctly formatted name, linked to a valid site, and assigned an auto-generated, sequential ID.    |
| 2   | Update a person's name to correct a typo without losing their history | User edits and saves the name field successfully while the underlying person_id remains static, preserving historical training records.  |
| 3   | Prevent accidental deletion of personnel who have completed training  | Attempting to delete a person with associated training records triggers an error and prevents the deletion.                             |
| 4   | Register a qualified trainer                                          | A designated trainer (APHA staff or cascade trained site personnel) is recorded and available for selection in future training records. |

## 5. Scope and Boundaries

### In Scope

- Creation, viewing, and updating of Person (trainee) records.
- Implementation of auto-generated, sequential Person IDs (read-only in UI).
- Separate First Name and Last Name fields for person records, with a computed display name formatted as "Last, First".
- Soft duplicate detection when creating a new person at a mapped site.
- Referential integrity checks preventing deletion of personnel with existing training records.
- Creation and management of Trainer records, including links to Person records for cascade trainers.

### Out of Scope

- Management or creation of the Site (Plant) records themselves (assumed managed via FT-001 or FT-004 depending on overall scope).
- Data entry of actual training certification records (covered by FT-003).
- Bulk import of personnel data from external sources.
- User account creation or authentication (covered by FT-004).
- Display of site-specific personnel lists with computed training status flags (covered by FT-001).

### Boundaries

- This feature reads Site reference data to associate personnel. It exposes Person and Trainer entities for use in Downstream Feature FT-003 (Training Records).
- Notification of training requirements occurs externally (email/post) and acts as the trigger for APHA staff to initiate workflows in this feature.

## 6. User Stories and Acceptance Criteria

### US-011: Add New Person

**Story:** As an APHA Data Entry User, I want to create a new person record associated with a site, so that their details are available in the system for applying training records.

**Priority:** Must

**Wireframes:**

```text
╔════════════════════════════════════════════════════════╗
║ Add New Person                                         ║
║                                                        ║
║ Site Selection                                         ║
║ ▼ Search for Site (Plant No)...                    [1] ║
║                                                        ║
║ Person Details                                         ║
║ ID: (Auto-generated on save)                       [2] ║
║ First Name (*):                                        ║
║ | e.g. David                                    |  [3] ║
║ Last Name (*):                                         ║
║ | e.g. Williams                                 |  [4] ║
║                                                        ║
║ [ Cancel ]                                    [ ✓ Save]║
╚════════════════════════════════════════════════════════╝
```
*Key: [1] Searchable dropdown replacing static lists. [2] Read-only indicator showing ID behavior. [3] First name text input. [4] Last name text input. Display name is computed as "Last, First".*

**Acceptance Criteria:**

```gherkin
Scenario: Successfully creating a new person
  Given a site "UK12345" exists in the system
  When I select "UK12345" from the site selection dropdown
  And I enter "David" in the First Name field
  And I enter "Williams" in the Last Name field
  And I save the record
  Then the person is assigned the next available sequential ID
  And the person is associated with the site "UK12345"
  And the person's display name is shown as "Williams, David"
  And the person record is saved successfully
  And the training status flag for the person is set to FALSE
  And the person appears in trainee selection dropdowns
  And an audit log entry records the person creation

Scenario: Displaying potential duplicate warning
  Given a person with first name "David" and last name "Williams" already exists at site "UK12345"
  When I attempt to create a new person with the same first name and last name at site "UK12345"
  Then the system displays a warning message "A person with this name already exists at this site. Do you still want to proceed?"
  And I can choose to either cancel or proceed with saving
```

### US-013: Update Person Details

**Story:** As an APHA Supervisor, I want to update a person's name or site association, so that I can correct data entry errors while preserving their historical training records.

**Priority:** Must

**Wireframes:**

```text
╔════════════════════════════════════════════════════════════════╗
║ Edit Person: Smith, John                                       ║
║                                                                ║
║ Person ID: 1042 (System Generated - Read Only)             [1] ║
║ Training Status: Yes (Cannot be manually changed)          [2] ║
║                                                                ║
║ Associated Site:                                               ║
║ ▼ UK12345 - Northern Abattoir                                  ║
║                                                                ║
║ First Name (*):                                                ║
║ | John                                                  |  [3] ║
║ Last Name (*):                                                 ║
║ | Smith-Jones                                           |  [4] ║
║                                                                ║
║ [ Cancel ]                                            [ ✓ Save]║
╚════════════════════════════════════════════════════════════════╝
```
*Key: [1] ID field explicitly disabled. [2] Status displayed for context. [3] Editable first name field. [4] Editable last name field. Display name computed as "Last, First".*

**Acceptance Criteria:**

```gherkin
Scenario: Updating a person's name
  Given a person with ID "123" exists with first name "John" and last name "Smith"
  When I update the Last Name field to "Smith-Jones"
  And I save the changes
  Then the person's display name is shown as "Smith-Jones, John"
  And historical training records maintain the correct link via person ID "123"
  And an audit log entry records the name change

Scenario: Prevent editing of Person ID
  Given I am editing the person record for "Smith, John" (ID 123)
  When I view the form
  Then the Person ID field is read-only and disabled
  And I cannot modify the value "123"
```

### US-014: Delete Person Record

**Story:** As an APHA Supervisor, I want the system to enforce rules around deleting personnel, so that I cannot accidentally orphan training records while being able to remove untethered duplicate or erroneously entered personnel.

**Priority:** Must

**Wireframes:**

*(Confirmation Modal shown over Site Trainees View)*
```text
╔════════════════════════════════════════════════════════════════╗
║ Delete Person                                                  ║
║                                                                ║
║ ⚠ Are you sure you want to delete "Williams, David"?           ║
║ This action cannot be undone.                                  ║
║                                                                ║
║                            [ Cancel ] [ Confirm Deletion ] [1] ║
╚════════════════════════════════════════════════════════════════╝
```
*(Error Modal shown if training records exist)*
```text
╔════════════════════════════════════════════════════════════════╗
║ Cannot Delete Person                                           ║
║                                                                ║
║ ⛔ "Smith, John" cannot be deleted because they have           ║
║ existing training records associated with their profile.       ║
║                                                                ║
║ Training records must be deleted before the person can         ║
║ be removed.                                                    ║
║                                                                ║
║                                                     [ Close ]  ║
╚════════════════════════════════════════════════════════════════╝
```

**Acceptance Criteria:**

```gherkin
Scenario: Successfully deleting a person with no training records
  Given a person "Williams, David" has no training records associated with them
  When I click the Delete action for "Williams, David"
  And I confirm the deletion prompt
  Then the record for "Williams, David" is removed from the system
  And they no longer appear in the Site Trainees list for their associated site

Scenario: Preventing deletion of a person with training records
  Given a person "Smith, John" has one or more training records associated with them
  When I click the Delete action for "Smith, John"
  Then the system blocks the deletion
  And displays an error message stating "Training records must be deleted before a person can be removed"
```

### US-015: Manage Trainers

**Story:** As an APHA Supervisor, I want to add and maintain records for qualified trainers, so that I can accurately record who delivered specific brainstem sampling training.

**Priority:** Should

**Wireframes:**

```text
╔════════════════════════════════════════════════════════════════╗
║ Manage Trainers                                                ║
║ ┌────────────────────────────────────────────────────────────┐ ║
║ │ ID   │ Trainer Name         │ Location       │ Type        │ ║
║ ├──────┼──────────────────────┼────────────────┼─────────────┤ ║
║ │ 501  │ Davies, Dr. Alan     │ Weybridge      │ APHA Staff  │ ║
║ │ 502  │ Evans, Sarah         │ UK12345        │ Cascade [1] │ ║
║ └──────┴──────────────────────┴────────────────┴─────────────┘ ║
║                                                                ║
║ Add New Trainer:                                               ║
║ First Name: |                     |                            ║
║ Last Name:  |                     |                            ║
║ Location: ▼ Select APHA Location / Site                        ║
║ Link to Trainee Record (Cascade only): ▼ Select Person...  [2] ║
║                                                                ║
║                                                 [ Add Trainer] ║
╚════════════════════════════════════════════════════════════════╝
```
*Key: [1] Indicates linked to a person_id. [2] Optional dropdown linking the trainer back to an existing Person profile.*

**Acceptance Criteria:**

```gherkin
Scenario: Creating an APHA staff trainer
  Given I am adding a new trainer
  When I enter "Alan" as the first name and "Davies" as the last name
  And I select "Weybridge" as the Location
  And I leave the Trainee link blank
  And I save
  Then a new Trainer record is created with an auto-generated trainer_id
  And the trainer's display name is shown as "Davies, Alan"
  And they are available for selection when logging training records

Scenario: Creating a Cascade trainer linked to a person
  Given a person "Evans, Sarah" exists at site "UK12345"
  When I am adding a new trainer
  And I enter "Sarah" as the first name and "Evans" as the last name
  And I select "UK12345" as the Location
  And I select the person record for "Evans, Sarah" from the Trainee Link dropdown
  And I save
  Then a new Trainer record is created with an auto-generated trainer_id
  And the Trainer record maintains a link to the person_id for "Evans, Sarah"
```

---

## 7. User Flows and Scenarios

### Flow 1: Primary Training Workflow - Add Person via Site Request

- **Entry point:** APHA Data Entry User receives an email indicating a site has a new trainee requiring certification. User logs in and opens the "Add Person" screen.
- **Step-by-step actions:**
  1. User selects the site from the searchable dropdown.
  2. User inputs the trainee's first name and last name in the respective fields.
  3. User clicks Save.
- **Decision points:**
  - If a person with the same name already exists at that site, a warning modal appears. The user reviews and clicks "Proceed anyway" knowing it's a duplicate, or "Cancel" realising it's a duplicate request.
- **Exit points:** Success notification shown; user remains on screen to add another person, or proceeds to the training feature to log the certification.
- **Error/exception paths:** If the user leaves either the First Name or Last Name field empty, the system highlights the empty field in red and prevents save.

### Flow 2: Data Maintenance Workflow - Site Review

- **Entry point:** APHA Read-Only User opens the "Site Trainees" screen to respond to a query from a Site Manager asking who is currently registered.
- **Step-by-step actions:**
  1. User searches by typing the site name or Plant Number in the dropdown.
  2. Grid populates with the roster.
  3. User reviews the "Trained?" status column to relay compliance information back to the Site Manager.
- **Exit points:** User completes the review and exits the system.
- **Error/exception paths:** If the site has no personnel, the grid shows an empty state. User confirms to the site manager that no one is registered.

## 8. UI/Layout Specifications

### 8.1 Add Person Screen

- **Page/screen title:** Add New Person
- **Navigation context:** Accessible from the personnel section.
- **Layout structure:** Single column form presented in a central card layout on the main content area.
- **Fields:**
  - **Site Selection:** Auto-complete searchable dropdown. Label: "Site Selection". Placeholder: "Search for Site (Plant No)...". Required.
  - **Person ID:** Text element styled as read-only/disabled text. Value defaults to "(Auto-generated on save)".
  - **First Name:** Text input. Label: "First Name (*)". Required. Max length 50 characters.
  - **Last Name:** Text input. Label: "Last Name (*)". Required. Max length 50 characters.
- **Action buttons:**
  - "Cancel": Secondary button (grey outline), positioned bottom left. Returns user to previous screen.
  - "Save": Primary button (green fill with checkmark icon), positioned bottom right. Disabled if required fields are empty or invalid.
- **Interaction states:**
  - Save click: Triggers brief loading spinner on button.
  - Success state: Toast notification top-right "Person [Last, First] successfully added with ID: [System ID]".
  - Duplicate warning state: Modal overlay interrupting save, presenting "Proceed" (primary) and "Cancel" (secondary) actions.

## 9. Business Rules and Validation

| Rule ID | Rule Description                               | Applies To                                         | Validation Behaviour                                                          |
| ------- | ---------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------- |
| BR-009  | Person Identification                          | Person Entity (person_id)                           | Field is read-only in UI. DB generates sequential integer on insert.          |
| BR-010  | Separate Name Fields                           | Person Entity (first_name, last_name)                 | Both First Name and Last Name are required. Display name is computed as "Last, First". |
| BR-011  | Personnel Retention                            | Person Entity (Delete action)                      | Conceptual rule; if personnel leave employment, records are retained (not actively managed in this feature unless expanding scope to "Inactive" flags). |
| BR-012  | Training Dependency                            | Person Entity (Delete action)                      | System checks relationship. Prevents API delete call if `has_training` is true. |
| BR-DUP  | Duplicate Checking                             | Add Person Form                                    | Checks if `first_name` + `last_name` + `site_id` combination already exists. Returns soft warning allowing override. |

## 10. Data Model and Requirements

### Entities

| Entity | Key Attributes | Description |
|--------|---------------|-------------|
| **Person** | `person_id` (int, PK, sequence), `first_name` (string, max 50), `last_name` (string, max 50), `display_name` (string, computed: "Last, First"), `site_id` (string, FK), `has_training` (boolean, computed) | Individual associated with a site who can receive training. |
| **Trainer** | `trainer_id` (int, PK, sequence), `first_name` (string, max 50), `last_name` (string, max 50), `display_name` (string, computed: "Last, First"), `location_id` (string, FK), `person_id` (int, FK, nullable) | Qualified individual delivering training. `person_id` populated if they are cascade trainers. |

### Search Parameters

| Parameter | Type | Behaviour | Required |
|-----------|------|-----------|----------|
| `site_id` | string | Exact match filtering for Site Trainees View grid. | Yes (for Site Trainees View) |
| `person_name` | string | Partial match against computed display name ("Last, First") for Trainee/Trainer linking dropdowns. | No |

### Data Relationships

- **Person → Site:** Many-to-One. A person belongs to one site represented by `site_id` linking to `site.plant_no`.
- **Trainer → APHALocation/Site:** Many-to-One. Trainer is linked to their home location via `location_id`.
- **Trainer → Person:** Zero-to-One. A trainer *may* be a previously trained person (cascade).
- **Training Record → Person:** (Downstream relation) Many-to-One. Checked by BR-012.

## 11. Integration Points and External Dependencies

| System | Integration Type | Direction | Description | Criticality |
|--------|-----------------|-----------|-------------|-------------|
| PostgreSQL Database | Database | Bidirectional | Direct read/write to core tables (Person, Trainer) handling the schema. | Required |

## 12. Non-Functional Requirements

| NFR ID  | Category                                                                    | Requirement                | Acceptance Threshold                       |
| ------- | --------------------------------------------------------------------------- | -------------------------- | ------------------------------------------ |
| NFR-001 | Usability | Dropdowns containing sites or personnel must be searchable to mitigate the scrolling pain point. | Searchable dropdown component utilized. Response/filtering < 500ms. |
| NFR-002 | Data Integrity | Enforce missing referential integrity at application level if DB cannot be altered. | API must explicitly check for related training records before executing a delete command. |

## 13. Legacy Pain Points and Proposed Improvements

| # | Legacy Pain Point | Impact | Proposed Improvement | Rationale |
|---|------------------|--------|---------------------|-----------|
| 1 | Person ID field allows editing | Risk of sequence breaking and data corruption | Field made strictly read-only; value handled entirely backend. | Preserves primary key integrity. |
| 2 | Heavy reliance on static dropdowns without filtering | Frustrating and slow UX when finding sites (often thousands exist) | Implement searchable, auto-complete dropdowns for Site and Person selection. | Massively reduces TTF (Time to find) and standardises modern UX. |
| 3 | No duplicate prevention | Cluttered database, reporting anomalies, split training histories | Implement a soft client/server warning when same name + site is entered. | Prevents accidental double entry while allowing legitimate edge cases (e.g., father/son with same name at same site). |
| 4 | Name format variations | Inconsistent sorting and poor data formatting | Replace single name field with separate First Name and Last Name fields; compute display name as "Last, First". | Eliminates formatting inconsistencies structurally rather than relying on validation patterns. |

## 14. Internal System Dependencies

| Dependency | Type | Description | Impact if Unavailable |
|------------|------|-------------|----------------------|
| None | — | This feature has no internal system dependencies. | — |

## 15. Business Dependencies

| Dependency                                                        | Owner                        | Description              | Status                             |
| ----------------------------------------------------------------- | ---------------------------- | ------------------------ | ---------------------------------- |
| Data cleansing (Name field)                                       | APHA Supervisor              | Legacy "person_name" data stored as a single field must be split into First Name and Last Name during migration. Records lacking clear comma separation will require manual review. | Pending |
| Database schema update review                                     | System Administrator         | If referential integrity (Foreign Keys) is formalized in the DB layer, a DB script needs testing. | Pending |

## 16. Key Assumptions

| # | Assumption | Risk if Invalid |
|---|-----------|-----------------|
| 1 | A Person is associated with exactly one Site at any given time. | If a Person can belong to multiple Sites simultaneously, the Person-Site relationship shifts to Many-to-Many, requiring a linking table and completely changing UI flow. |
| 2 | "De-activating" personnel is not a required workflow based on BR-011. | Unfiltered dropdowns may eventually become bloated with historical staff. If active filtering is required, an "IsActive" flag needs adding to the entity and stories. |

## 17. Success Metrics and KPIs

| Metric                                        | Baseline (Legacy)                      | Target (New System)           | Measurement Method          |
| --------------------------------------------- | -------------------------------------- | ----------------------------- | --------------------------- |
| Duplicate person records created              | High (Anecdotal pain point)            | ~0 per month                  | DB Query for matching first_name + last_name + Site created post-launch |
| Time to add a person to a site                | Unknown (Slow due to dropdowns)        | < 30 seconds                  | User analytics / Session tracking |

## 18. Effort Estimate

| Dimension        | Estimate       | Assumptions                                |
| ---------------- | -------------- | ------------------------------------------ |
| **Human Effort** | 7 person-days  | Includes building new searchable dropdown UI components, implementing server-side referential checks for deletion, and basic CRUD API routes. |

## 19. Open Questions

| # | Question | Context | Impact | Raised By | Status |
|---|----------|---------|--------|-----------|--------|
| 1 | What happens when a person moves employment from one site to another? Do they get a new person_id or do we update the site_id on the existing record? | A person's historical training records are tied to their person_id. Updating the site_id might alter historical context if the reporting doesn't snapshot the site at the time of training. | Risk of altering historical compliance reporting logic. | AI Agent | Resolved: SiteID will be updated on existing record. |
| 2 | For Trainer location_id, does this link to the same site.plant_no list, or a distinct list of APHA offices? | The data context specifies `APHALocation`, which implies it might be reference data different from Sampling Sites. | Determines if a second reference data endpoint is required for the Trainer management screen. | AI Agent | Resolved: The same site.plant_no list |

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

| Term | Definition |
|------|-----------|
| **Cascade training** | Training delivered by a previously trained site person to colleagues, rather than by APHA staff directly. This is supported by linking a Trainer record back to a Person record. |
| **Searchable Dropdown** | A UI component that allows the user to type text to filter available options, rather than merely scrolling a long static list. |
| **Soft Duplicate Detection** | A validation method that warns the user of a potential issue but allows them to bypass it if they confirm it is intentional. |
| **Trainee** | An individual associated with a sampling site who is registered in the system to receive brainstem sampling training and certification. Represented by the Person entity. |
| **Trainer** | A qualified individual authorised to deliver brainstem sampling training. May be APHA staff or a cascade trainer linked to an existing Person record. |
