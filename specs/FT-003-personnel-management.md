# FT-003: Personnel Management

## Metadata

| Field                   | Value                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Feature ID**          | FT-003                                                                                                                         |
| **Upstream Features**   | FT-001, FT-002                                                                                                                 |
| **Downstream Features** | FT-004, FT-005                                                                                                                 |
| **Feature Name**        | Personnel Management                                                                                                           |
| **Owner**               | APHA Supervisor                                                                                                                |
| **Priority**            | Must                                                                                                                           |
| **Last Updated**        | 2026-03-31                                                                                                                     |
| **PRD Reference**       | Bounded Context: Personnel Management; Add Person Screen; Site Trainees View; Primary Training Workflow                       |
| **Open Questions**      | 5                                                                                                                              |

---

## 1. Problem Statement

The legacy BST system lacks efficient personnel management capabilities, requiring manual duplicate checking and offering limited search functionality for managing individual person records and their site associations. Users struggle with dropdown-only selections without filter capabilities and face data validation gaps where critical system-generated fields can be inadvertently edited. This creates operational inefficiency and data integrity risks for managing the personnel who participate in brainstem sampling training programmes.

## 2. Benefit Hypothesis

We believe that implementing comprehensive personnel management with automated ID generation, duplicate prevention, and enhanced search capabilities will result in reduced data entry errors and improved operational efficiency for APHA staff managing training participants. We will know this is true when data entry time decreases by 30%, duplicate person records are eliminated, and user satisfaction scores for personnel management tasks improve by at least 25% compared to the legacy system experience.

## 3. Target Users and Personas

| Persona | Role Description | Relationship to Feature | Usage Frequency |
|---------|-----------------|------------------------|-----------------|
| APHA Supervisor | Senior APHA staff with full system access | Primary | Daily |
| APHA Data Entry User | APHA staff with restricted access based on screen-level permissions | Primary | Daily |
| APHA Read-Only User | APHA staff requiring view access for enquiries and reporting | Secondary | Weekly |
| System Administrator | Technical staff maintaining system infrastructure | Occasional | Monthly |

APHA staff users are expected to have domain knowledge of sampling sites and training requirements but may have varying levels of technical expertise. The system should accommodate both frequent power users and occasional users with intuitive interfaces.

## 4. User Goals and Success Criteria

| #   | User Goal                                    | Success Criterion                                                 |
| --- | -------------------------------------------- | ----------------------------------------------------------------- |
| 1   | Create new person records efficiently | Person record created with valid site association in under 2 minutes |
| 2   | Prevent duplicate person entries | System detects and warns of potential duplicates before saving |
| 3   | Find existing personnel quickly | Locate any person record within 30 seconds using search/filter |
| 4   | Maintain accurate person-site relationships | All personnel correctly associated with their primary sites with audit trail |
| 5   | Manage trainer qualifications | Track and validate trainer status with clear qualification indicators |

## 5. Scope and Boundaries

### In Scope

- Person record creation with auto-generated sequential IDs
- Person name management following "Surname, First name" format standards
- Site association management for personnel
- Trainer record creation and management
- Personnel search and filtering capabilities
- Duplicate detection and prevention
- Person record updates with audit trail
- Personnel retention according to business rules
- Integration with training record dependencies

### Out of Scope

- Training record creation or management (covered by FT-004)
- Site creation or management (covered by upstream features)
- User account provisioning (different from personnel records)
- Training workflow orchestration (covered by FT-004)
- Reporting functionality (covered by FT-005)

### Boundaries

This feature provides person and trainer data to the Training Management feature and consumes site data from the Site Management feature. It integrates with the audit logging system and enforces referential integrity with training records to prevent data corruption.

## 6. User Stories and Acceptance Criteria

### US-021: Create new person record

**Story:** As an APHA Data Entry User, I want to create a new person record with site association, so that the individual can be selected for training record creation.

**Priority:** Must

**Wireframes:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ BST System - Brainstem Sampling Training Management                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ Home | Sites | Personnel | Training | Reports | Users                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ╔═══════════════════════════════════════════════════════════════════════════╗ │
│ ║                           Add New Person                                  ║ │
│ ╠═══════════════════════════════════════════════════════════════════════════╣ │
│ ║                                                                           ║ │
│ ║ Person Name (*)                                                           ║ │
│ ║ |  Surname, First name                                          |         ║ │
│ ║                                                                           ║ │
│ ║ Associated Site (*)                                                       ║ │
│ ║ |  Select site...                                               | ▼       ║ │
│ ║                                                                           ║ │
│ ║ Person ID                                                                 ║ │
│ ║ |  Auto-generated                                               |         ║ │
│ ║ (Read-only)                                                               ║ │
│ ║                                                                           ║ │
│ ║                                                                           ║ │
│ ║                    [ Save Person ] [1]  [ Cancel ] [2]                   ║ │
│ ║                                                                           ║ │
│ ╚═══════════════════════════════════════════════════════════════════════════╝ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

[1] Save person record and return to previous screen
[2] Cancel creation and return without saving
```

**Acceptance Criteria:**

```gherkin
Scenario: Successfully create new person
  Given I am an authenticated APHA Data Entry User
  And active sites exist in the system
  When I enter person name "Williams, David"
  And I select site "UK12345 - ABC Abattoir"
  And I click Save Person
  Then a new person record is created with the next sequential ID
  And the person is associated with site "UK12345"
  And HasTraining flag is set to FALSE
  And an audit log entry records the person creation
  And I see confirmation "Person created successfully"

Scenario: Validate required fields
  Given I am on the Add New Person screen
  When I attempt to save without entering a person name
  Then I see error message "Person name is required"
  And the record is not saved

Scenario: Validate name format
  Given I am on the Add New Person screen
  When I enter person name "David Williams" (incorrect format)
  And I attempt to save
  Then I see warning "Recommended format: Surname, First name"
  And I can choose to continue or correct the format
```

### US-022: Search and view personnel

**Story:** As an APHA Read-Only User, I want to search for personnel records, so that I can quickly find information about specific individuals or view personnel at a site.

**Priority:** Must

**Wireframes:**

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                           Personnel Search                                ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║ Search by Name: |  Williams                        | [ Search ] [1]      ║
║                                                                           ║
║ Filter by Site: |  All Sites                      | ▼ [ Apply ] [2]      ║
║                                                                           ║
║ ┌─────────────────────────────────────────────────────────────────────────┐ ║
║ │ ID   │ Name              │ Site                    │ Has Training │      │ ║
║ │──────┼───────────────────┼─────────────────────────┼──────────────┤      │ ║
║ │ 0087 │ Williams, David   │ UK12345 - ABC Abattoir  │ Yes          │ [3]  │ ║
║ │ 0156 │ Williams, Sarah   │ UK67890 - XYZ Lab       │ No           │ [3]  │ ║
║ │ 0203 │ Williams, Robert  │ UK12345 - ABC Abattoir  │ Yes          │ [3]  │ ║
║ └─────────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║ Showing 3 of 1,247 personnel records                                     ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝

[1] Execute text search across person names
[2] Apply site filter to results
[3] View detailed person information
```

**Acceptance Criteria:**

```gherkin
Scenario: Search personnel by name
  Given personnel records exist in the system
  When I enter "Williams" in the search field
  And I click Search
  Then I see all personnel records containing "Williams" in the name
  And results show person ID, name, site, and training status
  And results are ordered by name alphabetically

Scenario: Filter personnel by site
  Given personnel records exist across multiple sites
  When I select "UK12345 - ABC Abattoir" from the site filter
  And I click Apply
  Then I see only personnel associated with site UK12345
  And the result count is updated accordingly

Scenario: View empty search results
  Given I search for a name that doesn't exist
  When I enter "Nonexistent" and click Search
  Then I see message "No personnel found matching your search"
  And the results table is empty
```

### US-023: Update person details

**Story:** As an APHA Supervisor, I want to update person details including name and site association, so that personnel records remain accurate when circumstances change.

**Priority:** Must

**Wireframes:**

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                         Edit Person - ID: 0087                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║ Person Name (*)                                                           ║
║ |  Williams, David Anthony                              |                 ║
║                                                                           ║
║ Associated Site (*)                                                       ║
║ |  UK12345 - ABC Abattoir                               | ▼               ║
║                                                                           ║
║ Person ID                                                                 ║
║ |  0087                                                 |                 ║
║ (Read-only)                                                               ║
║                                                                           ║
║ Training Records: 3 records found [4]                                    ║
║                                                                           ║
║                    [ Save Changes ] [1]  [ Cancel ] [2]                  ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝

[1] Save updated person details
[2] Cancel changes and return
[4] View associated training records (read-only)
```

**Acceptance Criteria:**

```gherkin
Scenario: Successfully update person name
  Given person ID 0087 exists with name "Williams, David"
  When I update the name to "Williams, David Anthony"
  And I click Save Changes
  Then the person record is updated successfully
  And an audit log entry records the name change
  And existing training records maintain their association via person ID
  And I see confirmation "Person details updated successfully"

Scenario: Update site association
  Given person ID 0087 is associated with site UK12345
  When I change the site association to UK67890
  And I click Save Changes
  Then the person's site association is updated
  And the change is logged in the audit trail
  And the person appears in the new site's personnel list

Scenario: Prevent person ID modification
  Given I am editing person ID 0087
  When I attempt to modify the person ID field
  Then the field remains read-only
  And no changes are possible to the person ID
```

### US-024: Detect duplicate personnel

**Story:** As an APHA Data Entry User, I want the system to warn me of potential duplicate personnel records, so that I don't create duplicate entries for the same individual.

**Priority:** Should

**Wireframes:**

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                      Potential Duplicate Detected                        ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║ The following existing records may match the person you're adding:        ║
║                                                                           ║
║ ┌─────────────────────────────────────────────────────────────────────────┐ ║
║ │ ID   │ Name              │ Site                    │ Has Training │      │ ║
║ │──────┼───────────────────┼─────────────────────────┼──────────────┤      │ ║
║ │ 0087 │ Williams, David   │ UK12345 - ABC Abattoir  │ Yes          │      │ ║
║ │ 0156 │ Williams, D       │ UK67890 - XYZ Lab       │ No           │      │ ║
║ └─────────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║ You are trying to add: Williams, David at UK12345 - ABC Abattoir         ║
║                                                                           ║
║           [ Use Existing ] [1]  [ Create New ] [2]  [ Cancel ] [3]       ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝

[1] Select an existing record instead of creating new
[2] Continue creating new record despite potential duplicates
[3] Cancel the operation
```

**Acceptance Criteria:**

```gherkin
Scenario: Detect potential duplicate by name match
  Given a person "Williams, David" exists at site UK12345
  When I attempt to create a new person "Williams, David" at any site
  Then I see a duplicate detection warning
  And I see the existing matching records
  And I can choose to use existing or create new

Scenario: Detect potential duplicate by partial name match
  Given a person "Williams, D" exists in the system
  When I attempt to create "Williams, David"
  Then I see a duplicate detection warning listing similar names
  And I can proceed with creation if confirmed

Scenario: No duplicates detected
  Given no similar names exist in the system
  When I create person "Johnson, Michael"
  Then the person is created without warnings
  And no duplicate detection screen appears
```

### US-025: Create trainer record

**Story:** As an APHA Supervisor, I want to create trainer records for qualified personnel, so that they can be assigned to deliver training to others.

**Priority:** Must

**Wireframes:**

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                           Add New Trainer                                 ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║ Trainer Name (*)                                                          ║
║ |  Smith, John                                          |                 ║
║                                                                           ║
║ APHA Location (*)                                                         ║
║ |  Select location...                                   | ▼               ║
║                                                                           ║
║ Link to Existing Person (optional)                                       ║
║ |  Search person...                                     | [ Search ] [4]  ║
║ Currently selected: Williams, David (ID: 0087)                           ║
║                                                                           ║
║ Trainer ID                                                                ║
║ |  Auto-generated                                       |                 ║
║ (Read-only)                                                               ║
║                                                                           ║
║                    [ Save Trainer ] [1]  [ Cancel ] [2]                  ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝

[1] Save new trainer record
[2] Cancel creation
[4] Search for existing person to link
```

**Acceptance Criteria:**

```gherkin
Scenario: Create new trainer successfully
  Given I am an APHA Supervisor
  And APHA locations exist in the system
  When I enter trainer name "Smith, John"
  And I select APHA location "Weybridge"
  And I click Save Trainer
  Then a new trainer record is created with auto-generated ID
  And the trainer is available for selection in training workflows
  And an audit log entry records the trainer creation

Scenario: Link trainer to existing person
  Given person ID 0087 exists for "Williams, David"
  When I create a trainer "Williams, David"
  And I link to existing person ID 0087
  And I save the trainer record
  Then the trainer record includes PersonId 0087
  And the person can function as both trainee and trainer

Scenario: Validate required trainer fields
  Given I am creating a new trainer
  When I attempt to save without entering a trainer name
  Then I see error "Trainer name is required"
  And the record is not saved
```

### US-026: Delete person with constraints

**Story:** As an APHA Supervisor, I want to remove personnel from the system when appropriate, so that the database reflects current personnel accurately while maintaining data integrity.

**Priority:** Should

**Wireframes:**

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                       Delete Person Confirmation                          ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║ You are about to delete: Williams, David (ID: 0087)                      ║
║                                                                           ║
║ ⚠️  This person has 3 training records associated                         ║
║                                                                           ║
║ To delete this person, you must first:                                   ║
║ • Delete or reassign all associated training records                     ║
║ • Confirm the person is no longer employed at the site                   ║
║                                                                           ║
║ Note: Deleted personnel cannot be recovered. Consider marking            ║
║ inactive instead of deleting.                                            ║
║                                                                           ║
║        [ View Training Records ] [1]  [ Cancel ] [2]                     ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝

[1] Navigate to training records for cleanup
[2] Cancel deletion and return
```

**Acceptance Criteria:**

```gherkin
Scenario: Prevent deletion with training records
  Given person ID 0087 has associated training records
  When I attempt to delete the person
  Then I see a warning about associated training records
  And the deletion is prevented
  And I can view the training records to resolve dependencies

Scenario: Successfully delete person without training
  Given person ID 0156 has no training records (HasTraining = FALSE)
  When I confirm deletion of the person
  Then the person record is removed from the system
  And an audit log entry records the deletion
  And the person no longer appears in searches or dropdowns

Scenario: Cancel deletion process
  Given I initiate deletion of person ID 0087
  When I click Cancel on the confirmation dialog
  Then the person record remains unchanged
  And I return to the previous screen
```

## 7. User Flows and Scenarios

### Flow 1: Primary Personnel Creation Flow

Entry point: User navigates to Personnel section and clicks "Add Person" from the main navigation menu.

Step-by-step actions:
1. User clicks "Add Person" button from Personnel management screen
2. System displays Add New Person form with empty name field and site dropdown
3. User enters person name following "Surname, First name" format
4. System validates name format and shows recommendations if needed
5. User selects associated site from populated dropdown list
6. System auto-generates next sequential person ID (read-only field)
7. User reviews entries and clicks "Save Person"
8. System checks for potential duplicates and shows warning if found
9. If no duplicates or user confirms, system creates person record
10. System displays success confirmation and returns to personnel list

Decision points:
- Duplicate detection: User chooses existing record or proceeds with new creation
- Name format validation: User accepts recommendation or continues with current format

Exit points:
- Success: Return to personnel search/list with new person visible
- Cancel: Return to previous screen without saving
- Error: Remain on form with error messages displayed

Error/exception paths:
- Network connectivity issues during save result in retry prompt
- Site dropdown fails to load - show error message and refresh option
- Validation errors prevent save - highlight fields and show specific error messages

### Flow 2: Personnel Search and Update Flow

Entry point: User accesses Personnel section from main navigation.

Step-by-step actions:
1. User enters search terms in name field or selects site filter
2. System queries database and displays matching results in grid format
3. User reviews results and clicks on specific person record
4. System displays person details in edit mode (if user has permissions)
5. User modifies name, site association, or other editable fields
6. System validates changes and shows any warnings
7. User saves changes or cancels modifications
8. System updates record and logs changes in audit trail

Decision points:
- Search results: User selects specific person or refines search
- Edit permissions: Read-only users see view mode, others can edit
- Validation warnings: User can proceed or correct issues

Exit points:
- Successful update: Return to search results with updated information
- Cancel changes: Return to search results without modifications
- Delete person: Navigate to deletion confirmation flow

Error/exception paths:
- Search returns no results - display "no matches found" message
- Update conflicts with concurrent changes - show conflict resolution options
- Permission denied for edit - display read-only view with explanation

## 8. UI/Layout Specifications

### 8.1 Add New Person Screen — Core Workflow

Page title: "Add New Person" positioned in main content header with breadcrumb navigation showing "Home > Personnel > Add New Person"

Layout structure:
- Header region: Site-wide navigation bar with BST system branding and user account dropdown
- Main content area: Centralised form panel taking 60% screen width, vertically centred
- Footer region: Standard APHA footer with links and copyright

Form panel components:
- Card component with white background, subtle shadow, and rounded corners
- Form title: "Add New Person" in heading 2 style, dark grey text
- Person Name field: Text input, full width, placeholder "Surname, First name", required indicator (*), max 100 characters, with format validation tooltip
- Associated Site field: Dropdown select, full width, placeholder "Select site...", populated with active sites showing format "PlantNo - SiteName", required indicator (*)
- Person ID field: Text input, full width, greyed out background, read-only state, auto-populated with "Auto-generated" placeholder text
- Action buttons: "Save Person" primary button (green background, white text) and "Cancel" secondary button (grey outline), centred below form, with standard spacing

Interaction states:
- Loading state: Form disabled with spinner overlay during save operation
- Validation state: Invalid fields highlighted in red with specific error messages below each field
- Success state: Green checkmark icon with "Person created successfully" message, auto-dismiss after 3 seconds
- Error state: Red warning icon with error message banner at top of form

### 8.2 Personnel Search and List View — Core Workflow

Screen purpose: Primary interface for finding and managing existing personnel records
Navigation context: Accessible via "Personnel" from main navigation menu

Layout structure:
- Search panel: Fixed at top of main content area, light grey background
- Results panel: Scrollable table below search panel, full width
- Action buttons: Contextual buttons appear based on user permissions

Search panel components:
- Search by Name: Text input field, 300px width, placeholder "Enter person name", with search icon button (magnifying glass)
- Filter by Site: Dropdown select, 250px width, options show "All Sites" default plus all active sites in "PlantNo - SiteName" format
- Apply Filters button: Secondary button style, positioned right of filters
- Results count: Dynamic text showing "Showing X of Y personnel records"

Results table components:
- Column headers: Person ID (80px), Name (250px), Site (300px), Has Training (120px), Actions (100px)
- Row data: Person ID as clickable link, Name in standard text, Site showing full name, Has Training as Yes/No indicator with colour coding (green/grey)
- Actions column: Eye icon for view, pencil icon for edit (permission-dependent), delete icon for supervisors only
- Pagination controls: Standard pagination at bottom for results over 50 records
- Empty state: "No personnel found matching your search criteria" with search tips

### 8.3 Edit Person Details — Secondary Workflow

Screen purpose: Update existing person information with full edit capabilities
Navigation context: Accessed from personnel search results

Layout structure:
- Breadcrumb navigation: "Home > Personnel > Edit Person"
- Edit form: Similar layout to Add Person but with populated fields and additional context
- Related records panel: Read-only section showing associated training records

Form modifications from Add Person:
- Form title: "Edit Person - ID: XXXX" format
- Pre-populated fields: All editable fields show current values
- Person ID field: Clearly marked as read-only with grey background
- Training Records section: Below main form, showing count of associated training records with link to view details
- Delete button: Red outlined button for supervisors, positioned separately from save/cancel actions

Interaction enhancements:
- Change tracking: Modified fields highlighted with subtle colour change
- Confirmation dialogs: Site change triggers confirmation about impact on training records
- Audit information: Small text showing "Last updated: date by user" at bottom of form

## 9. Business Rules and Validation

| Rule ID | Rule Description                               | Applies To                                         | Validation Behaviour                                                          |
| ------- | ---------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------- |
| BR-009  | Each person receives a unique auto-generated sequential ID upon creation | Person creation | System assigns next available sequential number, field is read-only to users, validation prevents manual ID changes |
| BR-010  | Person names are stored in single field format as "Surname, First name" | Person name field | System validates format and shows warning if not following standard, allows override with confirmation |
| BR-011  | People are not deleted from the system even after leaving employment | Person deletion operations | System shows warning about retention policy, requires special supervisor confirmation for actual deletion |
| BR-012  | Training records must be deleted before a person can be removed from the system | Person deletion | System prevents deletion if HasTraining flag is TRUE, shows count of training records, provides link to resolve |
| BR-013  | All training records must specify trainee, trainer, species, training type, and training date | Person selection in training workflows | System validates person exists and is available for selection when creating training records |
| BR-014  | All data modification operations are automatically logged with user identity, timestamp, and operation details | All person CRUD operations | System automatically creates audit trail entries, no user action required, cannot be disabled |

## 10. Data Model and Requirements

### Entities

| Entity | Key Attributes | Description |
|--------|---------------|-------------|
| Person | PersonId (auto-increment), PersonName (string), SiteId (FK), HasTraining (boolean) | Individual who can receive brainstem sampling training, with site association |
| Trainer | TrainerId (auto-increment), TrainerName (string), LocationId (FK), PersonId (optional FK) | Qualified individual authorised to deliver training, may be linked to Person record |

### Search Parameters

| Parameter | Type | Behaviour | Required |
|-----------|------|-----------|----------|
| PersonName | string | Partial text match, case-insensitive | No |
| SiteId | string | Exact match against Site.PlantNo | No |
| PersonId | integer | Exact match | No |
| HasTraining | boolean | Exact match for filtering trained/untrained | No |

### Data Relationships

- Person → Site: Many-to-one relationship via SiteId foreign key, referential integrity enforced, cannot create person without valid site
- Trainer → APHALocation: Many-to-one relationship via LocationId foreign key, trainer must be associated with APHA location
- Trainer → Person: Optional one-to-one relationship via PersonId foreign key, allows same individual to be both trainee and trainer
- Person → Training Records: One-to-many relationship, cascade rules prevent person deletion when training records exist

## 11. Integration Points and External Dependencies

| System | Integration Type | Direction | Description | Criticality |
|--------|-----------------|-----------|-------------|-------------|
| Site Management | Database FK | Inbound | Validates site associations using Site.PlantNo for person records | Required |
| Training Management | Database FK | Outbound | Provides person and trainer data for training record creation | Required |
| Audit Logging | Event/API | Outbound | Sends all CRUD operations for audit trail maintenance | Required |
| User Management | API | Inbound | Validates user permissions for person management operations | Required |
| APHA Location Service | Database FK | Inbound | Validates trainer location assignments | Required |

## 12. Non-Functional Requirements

| NFR ID  | Category                                                                    | Requirement                | Acceptance Threshold                       |
| ------- | --------------------------------------------------------------------------- | -------------------------- | ------------------------------------------ |
| NFR-001 | Usability | Personnel search response time | Search results returned within 2 seconds for queries across 5000+ records |
| NFR-002 | Data Volume | Personnel record capacity | Support minimum 10,000 person records with consistent performance |
| NFR-003 | Accessibility | WCAG 2.1 AA compliance | All personnel management screens meet accessibility standards |
| NFR-004 | Data Integrity | Referential constraint enforcement | Foreign key violations prevented with user-friendly error messages |

## 13. Legacy Pain Points and Proposed Improvements

| # | Legacy Pain Point | Impact | Proposed Improvement | Rationale |
|---|------------------|--------|---------------------|-----------|
| 1 | Person ID field allows editing when it should be read-only system-generated value | Risk of data corruption and integrity issues | Make Person ID completely read-only in UI with clear system-generated labelling | Prevents accidental data corruption while maintaining data integrity |
| 2 | Heavy reliance on dropdown selections without search/filter capabilities | Inefficient for users managing large numbers of personnel across multiple sites | Implement searchable dropdowns and comprehensive filtering options | Improves user efficiency and reduces errors when locating specific records |
| 3 | Manual duplicate checking required as system does not prevent or warn of duplicates | Increased risk of duplicate personnel records and data inconsistency | Automated duplicate detection with intelligent matching and user warnings | Maintains data quality while allowing legitimate cases where names may be similar |
| 4 | Limited search functionality makes finding existing personnel difficult | Users waste time scrolling through long lists instead of targeted searches | Full-text search across name fields with advanced filtering by site and status | Enables rapid location of personnel records, improving operational efficiency |

## 14. Internal System Dependencies

| Dependency | Type | Description | Impact if Unavailable |
|------------|------|-------------|----------------------|
| Site Management (FT-001) | Blocks | Personnel records require valid site associations from Site entity | Cannot create or update personnel without site data |
| User Management (FT-002) | Blocks | Personnel management screens require user authentication and role-based permissions | Cannot access personnel functionality without proper authentication |
| Audit Logging Service | Enhances | All personnel changes logged for compliance and tracking | Can function but loses audit trail capability |
| Training Management (FT-004) | Shared data | Personnel and trainer records feed into training workflows | Training functionality degraded without personnel data |

## 15. Business Dependencies

| Dependency                                                        | Owner                        | Description              | Status                             |
| ----------------------------------------------------------------- | ---------------------------- | ------------------------ | ---------------------------------- |
| Data migration from legacy BST database | APHA Data Migration Team | Historical personnel records must be cleansed and migrated with proper ID sequencing | In Progress |
| Site data availability | Site Management Team | Active sites must be available before personnel can be associated | Pending |
| User role definitions | APHA Security Team | Personnel management permission levels must be defined and implemented | Pending |

## 16. Key Assumptions

| # | Assumption | Risk if Invalid |
|---|-----------|-----------------|
| 1 | Legacy personnel data can be migrated while maintaining sequential ID integrity | Would require redesign of ID generation strategy and data relationships |
| 2 | "Surname, First name" format remains the standard for person names | UI and validation logic would need modification to support alternative formats |
| 3 | Site assignments are generally stable and don't require complex change management workflows | Would need additional approval workflows and change tracking mechanisms |
| 4 | Duplicate detection based on name similarity is sufficient for this domain | May need additional matching criteria like site location or employee numbers |

## 17. Success Metrics and KPIs

| Metric                                        | Baseline (Legacy)                      | Target (New System)           | Measurement Method          |
| --------------------------------------------- | -------------------------------------- | ----------------------------- | --------------------------- |
| Time to create new person record | 5+ minutes with manual duplicate checking | Under 2 minutes with automated assistance | User timing studies during UAT |
| Duplicate person records created per month | 2-3 duplicates requiring manual cleanup | Zero duplicates through prevention | Monthly data quality reports |
| Personnel search completion time | 3+ minutes scrolling through lists | Under 30 seconds with targeted search | System response time logging |
| User satisfaction with personnel management | Baseline survey required | 25% improvement in satisfaction scores | Post-implementation user surveys |

## 18. Effort Estimate

| Dimension        | Estimate       | Assumptions                                |
| ---------------- | -------------- | ------------------------------------------ |
| **Human Effort** | 12 person-days | Includes UI development, database schema changes, duplicate detection logic, comprehensive testing, and integration with existing audit logging system |

## 19. Open Questions

| # | Question | Context | Impact | Raised By | Status |
|---|----------|---------|--------|-----------|--------|
| 1 | Should person ID field editing capability be completely removed or restricted to specific admin roles? | PRD indicates IDs can be edited when they should be read-only | Affects data integrity controls and admin workflows | Agent | Open |
| 2 | What specific criteria should be used for automated duplicate detection beyond name matching? | Duplicate prevention strategy not clearly defined in PRD | Impacts effectiveness of duplicate prevention system | Agent | Open |
| 3 | Should the new system support bulk import/export of personnel records? | Not mentioned in PRD but common requirement for data migration | Could significantly affect development scope and timeline | Agent | Open |
| 4 | What is the process for validating trainer qualifications beyond location assignment? | Trainer qualification validation process not detailed in PRD | Affects trainer management workflow completeness | Agent | Open |
| 5 | How should site assignment changes be handled when personnel have existing training records? | Site assignment change process not specified in PRD | Impacts data integrity and user workflow design | Agent | Open |

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

## 21. Glossary

| Term | Definition |
|------|-----------|
| HasTraining Flag | Boolean indicator showing whether a person has any associated training records in the system |
| Person ID | Auto-generated sequential identifier assigned to each person record, used as primary key and for referential integrity |
| Sequential ID Generation | System process that assigns the next available number in sequence to new person records |
| Site Association | The relationship between a person record and their primary sampling site, stored as foreign key reference |
| Trainer Qualification | The authorization status of an individual to deliver brainstem sampling training to others |