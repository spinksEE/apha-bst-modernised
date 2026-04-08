# FT-001: Site Management

## Metadata

| Field                   | Value                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| **Feature ID**          | FT-001                                                                                            |
| **Upstream Features**   | None                                                                                              |
| **Downstream Features** | FT-002, FT-003                                                                                    |
| **Feature Name**        | Site Management                                                                                   |
| **Owner**               | APHA Supervisor                                                                                   |
| **Priority**            | Must                                                                                              |
| **Last Updated**        | 2026-04-07                                                                                        |
| **PRD Reference**       | Bounded Context - Site Management; Key User Interfaces & Screens; Rules BR-006, BR-007, BR-008    |
| **Open Questions**      | 3                                                                                                 |

---

## 1. Problem Statement

The legacy system suffered from poor data integrity owing to a lack of database-level constraints. This resulted in duplicate site names, inconsistent tracking of site mergers, and the risk of orphaned records when deleting sites. APHA administrative staff currently struggle to maintain a clean register of sampling sites, making it difficult to accurately report on personnel coverage and training compliance across facilities.

## 2. Benefit Hypothesis

We believe that implementing strict validation rules and referential integrity for Site Management will result in a highly accurate, deduplicated register of sampling facilities for APHA staff. We will know this is true when zero duplicate plant numbers or site names are entered into the system, and administrative time spent cleaning up orphaned trainee records drops to zero.

## 3. Target Users and Personas

| Persona | Role Description | Relationship to Feature | Usage Frequency |
|---------|-----------------|------------------------|-----------------|
| APHA Supervisor | Senior APHA administrator acting as process owner | Primary | Daily |
| APHA Data Entry User | Administrator responsible for logging new sites | Primary | Daily |
| APHA Read-Only User | Staff member handling enquiries | Secondary | Weekly |

## 4. User Goals and Success Criteria

| #   | User Goal                                    | Success Criterion                                                 |
| --- | -------------------------------------------- | ----------------------------------------------------------------- |
| 1   | Register new sampling facilities accurately  | New sites are saved successfully only when Plant Number and Name are unique. |
| 2   | Identify all trained personnel at a facility | Users can view a complete, accurate list of individuals linked to a specific site. |
| 3   | Preserve historical facility names           | Old facility names remain searchable and visible after a merger or handover. |
| 4   | Prevent accidental data loss                 | Sites with associated personnel records cannot be deleted under any circumstances. |

## 5. Scope and Boundaries

### In Scope

- Creation of new Sampling Site records including all address and contact details.
- Editing of existing Site records, including explicit handling of site name evolution (mergers/handovers).
- Searching and viewing of existing Sites via dropdowns and lists.
- A "Site Trainees View" that aggregates and lists all personnel associated with a specific site.
- A functional constraint preventing the deletion of a site if it is linked to any trainee records.

### Out of Scope

- Creation, editing, or managing the actual Trainee/Personnel records (handled in Downstream Features).
- Complex spatial or geographical mapping of site locations (not required by business processes).
- Direct external portals for Site Personnel to log in and manage their own details.

### Boundaries

The Site Management feature acts as a foundational dictionary for the application. It hands off directly to the Personnel Management and Training domains, serving as the required underlying entity. The boundary stops safely at the edge of the Trainee relationship — this feature displays associated trainees but does not edit their underlying certifications.

## 6. User Stories and Acceptance Criteria

### US-001: Register a new sampling site

**Story:** As an APHA Data Entry User, I want to register a new sampling site, so that it can be selected when processing new training notifications.

**Priority:** Must

**Wireframes:**

```text
╔═══════════════════════════════════════════════════════╗
║ Register New Sampling Site                            ║
║                                                       ║
║  Plant Number (*)    |                      | [1]     ║
║  Site Name (*)       |                      | [2]     ║
║                                                       ║
║  Address Line 1      |                      |         ║
║  Address Line 2      |                      |         ║
║  Town                |                      |         ║
║  County              |                      |         ║
║  Post Code           |                      |         ║
║                                                       ║
║  Telephone           |                      |         ║
║  Fax                 |                      |         ║
║                                                       ║
║  [ ] Is APHA Site [3]                                 ║
║                                                       ║
║  [ Cancel ]                        [ Save Site ] [4]  ║
╚═══════════════════════════════════════════════════════╝
Key: 
[1] Text input, max 11 alphanumeric characters. Must be unique.
[2] Text input, max 50 characters. Must be unique.
[3] Boolean checkbox to indicate internal agency sites.
[4] Primary action button. Submits form.
```

**Acceptance Criteria:**

```gherkin
Scenario: Successfully adding a completely new site
  Given I am on the Register New Sampling Site screen
  And the plant number "UK12345" does not exist in the system
  And the site name "Test Abattoir Ltd" does not exist in the system
  When I fill in the Plant Number with "UK12345"
  And I fill in the Site Name with "Test Abattoir Ltd"
  And I click "Save Site"
  Then the site is saved successfully
  And the site appears in all site selection dropdowns

Scenario: Attempting to add a site with an existing plant number
  Given a site already exists with the plant number "UK12345"
  When I attempt to create a new site with the plant number "UK12345"
  And I click "Save Site"
  Then the system displays the error "A site with this Plant Number already exists."
  And the site is not saved

Scenario: Attempting to add a site with an existing site name
  Given a site already exists with the name "Test Abattoir Ltd"
  When I attempt to create a new site with the name "Test Abattoir Ltd"
  And I click "Save Site"
  Then the system displays the error "A site with this Name already exists."
  And the site is not saved
```

### US-002: View site details and related trainees

**Story:** As an APHA Read-Only User, I want to view all personnel associated with a specific site, so that I can quickly assess the current training coverage for that facility.

**Priority:** Must

**Wireframes:**

```text
╔═══════════════════════════════════════════════════════════════╗
║ Site Trainees View                                            ║
║                                                               ║
║  Select Site: ▼ Test Abattoir Ltd (UK12345)           [1]     ║
║                                                               ║
║  Site Details:                                                ║
║  Address: 123 Farm Road, Oxton, OX1 2AB                       ║
║  Total Personnel: 3 [2]                                       ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │ Name              Status            Actions             │  ║
║  ├─────────────────────────────────────────────────────────┤  ║
║  │ Smith, John       Trained           [ View ] [ Remove ] │  ║
║  │ Doe, Jane         Training Conf.    [ View ] [ Remove ] │  ║
║  │ Evans, Bob        Cascade Trained   [ View ] [ Remove ] │  ║
║  └─────────────────────────────────────────────────────────┘  ║
╚═══════════════════════════════════════════════════════════════╝
Key: 
[1] Typeahead dropdown to search existing sites by name or plant number.
[2] Computed Field representing the count of uniquely associated personnel.
Empty State: If no site is selected, the grid is hidden. If a site has 0 personnel, the grid shows "No trainees associated with this site."
```

**Acceptance Criteria:**

```gherkin
Scenario: Viewing trainees for a populated site
  Given a site "Test Abattoir Ltd" exists
  And 3 personnel are associated with this site
  When I select "Test Abattoir Ltd" from the Select Site dropdown
  Then the Total Personnel count displays "3"
  And the personnel grid populates with 3 rows of trainee data

Scenario: Viewing a site with no trainees
  Given a site "Empty Facility" exists
  And 0 personnel are associated with this site
  When I select "Empty Facility" from the Select Site dropdown
  Then the Total Personnel count displays "0"
  And the personnel grid displays the message "No trainees associated with this site"
```

### US-003: Evolve site names through mergers

**Story:** As an APHA Supervisor, I want to update a site's name while automatically preserving its old name in brackets, so that historical references remain intact and identifiable after a merger or handover.

**Priority:** Should

**Wireframes:**

```text
╔═══════════════════════════════════════════════════════════════╗
║ Edit Sampling Site: UK12345                                   ║
║                                                               ║
║  Plant Number       | UK12345 | (Read-only)               [1] ║
║  Current Name (*)   | Test Abattoir Ltd                   [2] ║
║                                                               ║
║  New Name           | Northern Meats Co                   [3] ║
║                                                               ║
║  [ Cancel ]                             [ Save Changes ]      ║
╚═══════════════════════════════════════════════════════════════╝
Key: 
[1] Plant number cannot be changed once established.
[2] Read-only view of the current formal name.
[3] Input for the new name. Upon saving, the system creates the format "New Name [Current Name]".
```

**Acceptance Criteria:**

```gherkin
Scenario: Evolving a site name
  Given a site exists with the name "Old Abattoir Co"
  When I edit the site and enter "New Meadow Farms" into the New Name field
  And I click "Save Changes"
  Then the site's official name is updated to "New Meadow Farms [Old Abattoir Co]"
  And the new formatted name appears in all dropdowns and reports

Scenario: Evolving a site name that has already been evolved
  Given a site exists with the name "Current Name [Old Name]"
  When I edit the site and enter "Future Name" into the New Name field
  And I click "Save Changes"
  Then the site's official name is updated to "Future Name [Current Name]"
```

### US-004: Prevent deletion of sites with personnel

**Story:** As an APHA Supervisor, I want to be prevented from deleting a site if it has associated personnel records, so that I do not create orphaned records or lose historical data.

**Priority:** Must

**Wireframes:**

```text
╔═══════════════════════════════════════════════════════════════╗
║ Application Error                                             ║
║                                                               ║
║  [!] Cannot Delete Site                                       ║
║                                                               ║
║  There are personnel from Test Abattoir Ltd.                  ║
║  You can only delete a site with no trainees. [1]             ║
║                                                               ║
║                                           [ Return ]          ║
╚═══════════════════════════════════════════════════════════════╝
Key: 
[1] Error modal or panel triggered if the user attempts the delete action on an ineligible site.
```

**Acceptance Criteria:**

```gherkin
Scenario: Attempting to delete a site linked to personnel
  Given a site "UK12345" exists
  And the site has at least 1 associated personnel record
  When I attempt to delete the site "UK12345"
  Then the system displays error "There are personnel from [Site Name]. You can only delete a site with no trainees"
  And the site is not deleted from the database

Scenario: Successfully deleting an empty site
  Given a site "Empty Facility" exists
  And the site has 0 associated personnel records
  When I attempt to delete the site "Empty Facility"
  And I confirm the deletion prompt
  Then the site is permanently removed from the system
```

---

## 7. User Flows and Scenarios

### Flow 1: Add New Site during Primary Training Workflow

1. **Entry point**: An APHA Data Entry User receives a training notification in the post. They search for the specified site in the system but cannot find it.
2. **Step-by-step actions**:
   - The user selects "Add Site".
   - The user inputs the Plant Number, Site Name, Address, and Contact Details.
   - The user clicks "Save Site".
3. **Decision points**:
   - If the business rules strictly validate the uniqueness of Plant Number and Name, the system saves the record.
   - If duplicates are detected, the user must resolve the error by searching for the existing site or correcting a typographical error.
4. **Exit points**: The user is redirected to the "Site Detail" view and can now proceed with creating the requested Training Record.

### Flow 2: Resolving Site Mergers

1. **Entry point**: An APHA Supervisor receives notification that "Old Abattoir Co" has been bought out by "New Meadow Farms".
2. **Step-by-step actions**:
   - The user opens the sites list and selects "Old Abattoir Co".
   - The user selects "Edit".
   - The user inputs "New Meadow Farms" into the New Name field.
   - The user clicks "Save Changes".
3. **Exit points**: The site replaces its previous name, automatically appending `[Old Abattoir Co]` to the end, ensuring historical references still make sense to read-only reporting users.

## 8. UI/Layout Specifications

### 8.1 Register New Site Form — Core Workflow

- **Context**: Rendered as a clean, single-column form pane.
- **Layout structure**: Main content area below the global header.
- **Form Fields**:
  - `Plant Number`: Text input. Required. Maximum 11 characters. Alphanumeric.
  - `Site Name`: Text input. Required. Maximum 50 characters.
  - `Address Line 1`: Text input. Optional. Maximum 50 characters.
  - `Address Line 2`: Text input. Optional. Maximum 50 characters.
  - `Town`: Text input. Optional. Maximum 50 characters.
  - `County`: Text input. Optional. Maximum 50 characters.
  - `Post Code`: Text input. Optional. Maximum 50 characters.
  - `Telephone`: Text input. Optional. Maximum 50 characters. Format agnostic.
  - `Fax`: Text input. Optional. Maximum 50 characters.
  - `Is APHA Site`: Checkbox. Optional. Defaults to false (unchecked).
- **Controls**:
  - `Cancel` button: Secondary styling, aligns left. Returns user to previous screen.
  - `Save Site` button: Primary styling, aligns right.
- **Interaction states**: Upon clicking save, a loading spinner appears on the button while backend validation runs. Inline validation errors highlight fields in red on failure.

### 8.2 Site Trainees View — Secondary Workflow

- **Context**: Serves as the primary viewing dashboard for existing sites.
- **Logical groupings**: Includes a filter bar at the top, a site summary card, and a tabular datagrid.
- **Fields and Controls**:
  - `Select Site` dropdown: Searchable typeahead dropdown. Format standardisation: `Site Name (Plant Number)`.
  - `Site Details` card: Displays physical address and the `Site Personnel Count` calculated field.
  - `Personnel Grid`: Columns for Name, Status, and Actions.
  - `Actions`: `View` button (redirects to personnel record) and `Remove` button. *(Note: pending Open Question #2 regarding the behavioural logic of "Remove").*

## 9. Business Rules and Validation

| Rule ID | Rule Description                           | Applies To                            | Validation Behaviour                                                                           |
| ------- | ------------------------------------------ | ------------------------------------- | ---------------------------------------------------------------------------------------------- |
| BR-006  | Each site must have a unique plant number  | `site.plant_no` field on Add/Edit form | Display error: "A site with this Plant Number already exists." Prevent save.                   |
| BR-007  | Preserved names via brackets on evolution  | `site.name` field when updated        | Auto-format the underlying string to combine the new and old names.                            |
| BR-008  | Prevent deletion if personnel linked       | Delete Action on a Site record        | Display error: "There are personnel from [Site]. You can only delete a site with no trainees." |
| BR-015  | Duplicate site names should not be allowed | `site.name` field on Add/Edit form    | Display error: "A site with this Name already exists." Prevent save.                           |

## 10. Data Model and Requirements

### Entities

| Entity | Key Attributes                                                                                                                                                                                                                                        | Description                                                     |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Site   | plant_no (varchar 11, PK), name (varchar 50), address_line_1 (varchar 50), address_line_2 (varchar 50), address_town (varchar 50), address_county (varchar 50), address_post_code (varchar 50), telephone (varchar 50), fax (varchar 50), is_apha_site (boolean) | Primary dictionary entity for sampling facility representation. |

### Search Parameters

| Parameter | Type | Behaviour | Required |
|-----------|------|-----------|----------|
| Plant Number | String | Exact match | No |
| Site Name | String | Partial match (contains) | No |

### Data Relationships

- Site → Trainee (Personnel): One-to-Many. A single site acts as the host location for many administrative personnel/trainee records. Referential integrity must be strictly enforced, blocking cascading deletes.

## 11. Integration Points and External Dependencies

| System | Integration Type | Direction | Description | Criticality |
|--------|-----------------|-----------|-------------|-------------|
| None | — | — | This feature has no external integration points. | — |

## 12. Non-Functional Requirements

| NFR ID  | Category                                                                    | Requirement                | Acceptance Threshold                       |
| ------- | --------------------------------------------------------------------------- | -------------------------- | ------------------------------------------ |
| NFR-001 | Data Volume  | System must efficiently load lists containing historical legacy site numbers. | Up to 10,000 site records must populate dropdowns with virtually zero latency. |

## 13. Legacy Pain Points and Proposed Improvements

| # | Legacy Pain Point | Impact | Proposed Improvement | Rationale |
|---|------------------|--------|---------------------|-----------|
| 1 | Lack of unique constraints on Plant/Name | Duplicate sites confused data entry users and split training statuses across duplicated hubs. | Strict application of BR-006 and BR-015 in the UI and database schema. | Ensures a cleanly maintained single source of truth for site operations. |
| 2 | Missing referential integrity constraints | Legacy allowed orphaned records or unmanaged relationships. | Implementing strict foreign key constraints and the BR-008 soft-lock on deletion. | Prevents silent data corruption and orphaned trainee histories. |

## 14. Internal System Dependencies

| Dependency | Type | Description | Impact if Unavailable |
|------------|------|-------------|----------------------|
| Personnel Datastore | Blocks | The Site Trainees view must query personnel based on the Site's foreign key. | The entire Site Trainees View fails to function and will show an error state. |

## 15. Business Dependencies

| Dependency                                                        | Owner                        | Description              | Status                             |
| ----------------------------------------------------------------- | ---------------------------- | ------------------------ | ---------------------------------- |
| Legacy Site Data Migration | Data Platform Team | Pre-cleansing of historical duplicate sites prior to ingestion into the new unified schema (since constraints will now strictly reject duplicates). | Pending |

## 16. Key Assumptions

| # | Assumption | Risk if Invalid |
|---|-----------|-----------------|
| 1 | The arbitrary maximum length of 11 characters for a Plant Number remains correct for all future governmental formatting. | If Plant Numbers expand past 11 chars, data truncation will occur, requiring a schema alteration. |
| 2 | Address details do not demand rigorous postal address validation routines (e.g. PAF lookup), simply unstructured textual capture. | A poor user experience if external lookup validators are actually expected by business stakeholders. |

## 17. Success Metrics and KPIs

| Metric                                         | Baseline (Legacy)                | Target (New System) | Measurement Method           |
| ---------------------------------------------- | -------------------------------- | ------------------- | ---------------------------- |
| Duplicate sites created per month              | High frequency                   | 0                   | Database integrity queries   |
| Orphaned personnel queries resolved internally | ~10 per week depending on season | 0                   | Service desk ticket tracking |

## 18. Effort Estimate

| Dimension        | Estimate       | Assumptions                                |
| ---------------- | -------------- | ------------------------------------------ |
| **Human Effort** | 8 person-days  | Core schema creation is straightforward. The complex logic resides in the name evolution tracking and Excel report generation. |

## 19. Open Questions

| #   | Question                                                                                                                                                                                   | Context                                                       | Impact                                                                                                               | Raised By        | Status                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------- | -------------------------------------------- |
| 1   | Does updating a site name permanently replace the field via bracket-concatenation, or should the new system implement a more robust relational "Previous Names" schema entity underneath?  | Refers to BR-007 (Name Evolution).                            | May require expanding the data model if bracket text replacement is deemed insufficient for future auditing.         | Technical Writer | Resolved: permanently replace                |
| 2   | In the Site Trainees View, does clicking "Remove" simply sever the relational link between the personnel and this site, or does it attempt to hard-delete the underlying personnel entity? | Legacy UI behaviours described via "Delete person from site". | Could cause unintended data loss of Trainee entities if hard-deletion is inferred rather than relational detachment. | Technical Writer | Resolved: do not delete underlying personnel |
| 3   | Are Plant Numbers strictly immutable once saved, preventing any future typographical corrections by an administrative Supervisor?                                                          | Relates to US-003 and system rigidness.                       | Typos on initial capture might require complete record deletion and recreation instead of simple editing.            | Technical Writer | Resolved: plant numbers must be immutable    |

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
| **Plant Number** | The unique identifier assigned to each sampling site or facility across the regulatory ecosystem. |
| **Sampling Site** | A physical facility (typically an abattoir, laboratory, or veterinary facility) where brainstem sampling is performed. |
| **APHA** | Animal and Plant Health Agency - the regulatory UK government agency overseeing site authorisations. |
| **Brainstem Training** | Manual techniques trained for extracting brain tissue samples from animals for TSE/BSE laboratory testing. |
