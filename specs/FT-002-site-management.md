# FT-002: Site Management

## Metadata

| Field                   | Value                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Feature ID**          | FT-002                                                                                                                         |
| **Upstream Features**   | FT-001                                                                                                                         |
| **Downstream Features** | FT-003, FT-004, FT-005                                                                                                        |
| **Feature Name**        | Site Management                                                                                                                |
| **Owner**               | APHA Supervisor                                                                                                                |
| **Priority**            | Must                                                                                                                           |
| **Last Updated**        | 2026-03-31                                                                                                                     |
| **PRD Reference**       | Bounded Context: Site Management; Primary Training Workflow; Data Maintenance Workflow                                        |
| **Open Questions**      | 3                                                                                                                              |

---

## 1. Problem Statement

APHA staff need to register and manage sampling sites where brainstem sampling training occurs, but the legacy system lacks proper site editing functionality and duplicate prevention. Currently, site modifications require direct database access, and there are no validation rules to prevent duplicate site names or ensure data consistency. This creates operational inefficiency and data quality risks when managing the hundreds of sampling sites across the UK.

## 2. Benefit Hypothesis

We believe that providing comprehensive site management capabilities with proper validation and user-friendly interfaces will result in improved data quality and operational efficiency for APHA staff managing sampling sites. We will know this is true when site registration time decreases, data validation errors reduce, and staff no longer require database administrator assistance for routine site maintenance.

## 3. Target Users and Personas

| Persona | Role Description | Relationship to Feature | Usage Frequency |
|---------|-----------------|------------------------|-----------------|
| APHA Supervisor | Senior APHA staff with full system access | Primary | Daily |
| APHA Data Entry User | APHA staff with screen-level permissions | Primary | Daily |
| APHA Read-Only User | APHA staff requiring view access | Secondary | Weekly |
| Site Personnel | Staff at sampling sites submitting notifications | Occasional | Monthly |

Site personnel interact indirectly by submitting training notifications that trigger site registration needs. APHA users have varying expertise levels from basic data entry to comprehensive system administration.

## 4. User Goals and Success Criteria

| #   | User Goal                                                          | Success Criterion                                                                    |
| --- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| 1   | Register new sampling sites quickly and accurately                 | Site registration completed in under 5 minutes with validation feedback             |
| 2   | View personnel associated with specific sites                      | Complete personnel list displayed within 3 seconds for any selected site            |
| 3   | Ensure site data integrity and prevent duplicates                  | Zero duplicate plant numbers allowed; duplicate site names flagged to user          |
| 4   | Maintain site-personnel relationships for compliance reporting     | Site deletion blocked when personnel associations exist with clear error messaging   |

## 5. Scope and Boundaries

### In Scope

- Site registration with complete address and contact information
- Plant number uniqueness validation
- Site-personnel relationship viewing
- Site selection interfaces for other system features
- Site deletion validation with personnel association checks
- Audit trail for all site operations
- APHA site designation functionality

### Out of Scope

- Site editing functionality (requires separate investigation of backend requirements)
- Personnel management (covered by FT-003)
- Training record management (covered by downstream features)
- Site merger/handover workflow automation
- Advanced search and filtering for site selection (future enhancement)
- Bulk site import/export functionality

### Boundaries

This feature provides site data to Personnel Management (FT-003) for site assignments and to training features (FT-004, FT-005) for location selection. It receives authentication and authorisation context from FT-001. Site editing capabilities are explicitly excluded pending resolution of backend architecture requirements.

## 6. User Stories and Acceptance Criteria

### US-011: Register New Sampling Site

**Story:** As an APHA Data Entry User, I want to register a new sampling site with complete details, so that training records can be associated with the correct location.

**Priority:** Must

**Wireframes:**

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ APHA BST System                                                     Welcome: J.Smith │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ Home │ Sites ▼ │ Personnel │ Training │ Reports │                              Logout │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ ╔═══════════════════════════════════════════════════════════════════════════════╗   │
│ ║                              Add New Site                                     ║   │
│ ║                                                                               ║   │
│ ║ Plant Number: |____________| (*)  [1]                                        ║   │
│ ║                                                                               ║   │
│ ║ Site Name: |_________________________________| (*)  [2]                     ║   │
│ ║                                                                               ║   │
│ ║ Address:                                                                      ║   │
│ ║   Line 1: |_________________________________|  [3]                          ║   │
│ ║   Line 2: |_________________________________|                               ║   │
│ ║   Town:   |_________________________________|                               ║   │
│ ║   County: |_________________________________|                               ║   │
│ ║   Postcode: |_____________|                                                  ║   │
│ ║                                                                               ║   │
│ ║ Contact Details:                                                              ║   │
│ ║   Telephone: |_________________________|                                     ║   │
│ ║   Fax:       |_________________________|                                     ║   │
│ ║                                                                               ║   │
│ ║ [x] APHA Site  [4]                                                            ║   │
│ ║                                                                               ║   │
│ ║                    [ Save Site ] [ Cancel ]  [5]                            ║   │
│ ╚═══════════════════════════════════════════════════════════════════════════════╝   │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

**Callout Key:**
- [1] Plant number field - unique identifier, max 11 characters
- [2] Site name field - required, max 50 characters
- [3] Address fields - optional, max 50 characters each
- [4] APHA site checkbox - indicates APHA-operated facility
- [5] Action buttons - save creates site, cancel returns to previous screen

**Empty state:** Form displays with all fields blank and focus on plant number field.
**Loading state:** Save button shows "Saving..." and is disabled during processing.
**Error state:** Validation errors appear above relevant fields in red text.

**Acceptance Criteria:**

```gherkin
Scenario: Successfully register new site with complete details
  Given I am logged in as an APHA Data Entry User
  And I navigate to the Add Site screen
  When I enter plant number "UK12345", site name "Test Abattoir Ltd", address "123 Test Road, Testville, Testshire, TS1 2AB", telephone "01234567890", and check APHA site
  And I click Save Site
  Then the site is created successfully
  And I see confirmation message "Site UK12345 - Test Abattoir Ltd created successfully"
  And the site appears in all site selection dropdowns
  And an audit log entry records the site creation with my user ID and timestamp

Scenario: Prevent duplicate plant number registration
  Given site with plant number "UK12345" already exists
  When I attempt to create a new site with plant number "UK12345"
  And I click Save Site
  Then I see error message "Plant number UK12345 already exists"
  And the site is not created
  And the form remains populated with my entered data

Scenario: Require mandatory fields
  Given I am on the Add Site screen
  When I leave plant number and site name blank
  And I click Save Site
  Then I see error messages "Plant number is required" and "Site name is required"
  And the site is not created
```

### US-012: View Site Personnel Associations

**Story:** As an APHA Supervisor, I want to view all personnel associated with a specific site, so that I can understand training coverage and compliance status.

**Priority:** Must

**Wireframes:**

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                             Site Trainees                                    ║
║                                                                               ║
║ Select Site: │Test Abattoir Ltd (UK12345)        ▼│ [1]                      ║
║                                                                               ║
║ Personnel at this site:                                                       ║
║ ┌─────────────────────────────────────────────────────────────────────────┐   ║
║ │ Name             │ Species    │ Last Training │ Status    │ Actions     │   ║
║ ├─────────────────────────────────────────────────────────────────────────┤   ║
║ │ John Smith       │ Cattle     │ 15/03/2026   │ Current   │ [ View ] [2]│   ║
║ │ Sarah Jones      │ Sheep      │ 10/01/2025   │ Expired   │ [ View ]    │   ║
║ │ Mike Wilson      │ Cattle,Goat│ 20/03/2026   │ Current   │ [ View ]    │   ║
║ └─────────────────────────────────────────────────────────────────────────┘   ║
║                                                                               ║
║ Total Personnel: 3                                                            ║
║                                                                               ║
║                           [ Export List ] [3]                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

**Callout Key:**
- [1] Site selection dropdown - shows all registered sites
- [2] View action - opens personnel details (handled by Personnel Management feature)
- [3] Export button - generates personnel list for compliance reporting

**Empty state:** "No personnel found for this site" message when site has no associated trainees.
**Loading state:** "Loading personnel..." message while retrieving data.

**Acceptance Criteria:**

```gherkin
Scenario: View personnel for site with trainees
  Given site "UK12345" has 3 associated personnel
  When I select "Test Abattoir Ltd (UK12345)" from the site dropdown
  Then I see a table with 3 personnel records
  And each record shows name, species, last training date, and current status
  And the total personnel count shows "3"

Scenario: Handle site with no personnel
  Given site "UK67890" has no associated personnel
  When I select "Empty Site Ltd (UK67890)" from the site dropdown
  Then I see message "No personnel found for this site"
  And the total personnel count shows "0"
```

### US-013: Validate Plant Number Uniqueness

**Story:** As an APHA Data Entry User, I want the system to prevent duplicate plant numbers, so that site identification remains reliable and unique.

**Priority:** Must

**Wireframes:**

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                              Add New Site                                     ║
║                                                                               ║
║ Plant Number: |UK12345    | (*)  ⚠️ Plant number UK12345 already exists [1] ║
║                                                                               ║
║ Site Name: |New Test Site Ltd                  | (*)                        ║
║                                                                               ║
║ [Additional form fields...]                                                   ║
║                                                                               ║
║                    [ Save Site ] [ Cancel ]                                  ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

**Callout Key:**
- [1] Real-time validation error for duplicate plant number

**Acceptance Criteria:**

```gherkin
Scenario: Real-time validation of plant number uniqueness
  Given site with plant number "UK12345" already exists
  When I enter "UK12345" in the plant number field
  And I move to the next field
  Then I see error message "Plant number UK12345 already exists"
  And the Save Site button is disabled

Scenario: Allow unique plant numbers
  Given no site with plant number "UK99999" exists
  When I enter "UK99999" in the plant number field
  And I move to the next field
  Then no error message appears
  And the Save Site button remains enabled
```

### US-014: Prevent Site Deletion with Personnel

**Story:** As an APHA Supervisor, I want the system to prevent deletion of sites that have associated personnel, so that referential integrity is maintained and historical training records remain valid.

**Priority:** Should

**Wireframes:**

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                            Delete Site Warning                                ║
║                                                                               ║
║ ⚠️  Cannot Delete Site                                                       ║
║                                                                               ║
║ There are personnel from Test Abattoir Ltd                                    ║
║ You can only delete a site with no trainees                                   ║
║                                                                               ║
║ Personnel count: 3 active records                                             ║
║                                                                               ║
║                              [ OK ]                                           ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

**Acceptance Criteria:**

```gherkin
Scenario: Prevent deletion of site with personnel
  Given site "UK12345" has 3 associated personnel records
  When I attempt to delete site "UK12345"
  Then I see error message "There are personnel from Test Abattoir Ltd You can only delete a site with no trainees"
  And the site is not deleted
  And the personnel associations remain intact

Scenario: Allow deletion of site without personnel
  Given site "UK99999" has no associated personnel records
  When I attempt to delete site "UK99999"
  Then I see confirmation dialog "Are you sure you want to delete Empty Site Ltd?"
  And when I confirm deletion
  Then the site is removed from the system
  And an audit log entry records the deletion
```

### US-015: Site Selection for Training Workflows

**Story:** As an APHA Data Entry User, I want to select sites from a dropdown when recording training, so that training records are associated with the correct location.

**Priority:** Must

**Wireframes:**

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                           Record Training                                     ║
║                                                                               ║
║ Site: │Test Abattoir Ltd (UK12345)           ▼│ [1]                          ║
║                                                                               ║
║ [Other training form fields...]                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

**Callout Key:**
- [1] Site dropdown showing site name and plant number for identification

**Acceptance Criteria:**

```gherkin
Scenario: Display all active sites in dropdown
  Given there are 10 active sites in the system
  When I open the site selection dropdown
  Then I see all 10 sites listed as "Site Name (Plant Number)"
  And sites are sorted alphabetically by site name

Scenario: Handle sites with duplicate names
  Given two sites both named "Test Abattoir Ltd" with plant numbers "UK12345" and "UK67890"
  When I open the site selection dropdown
  Then I see "Test Abattoir Ltd (UK12345)" and "Test Abattoir Ltd (UK67890)" as separate options
  And I can distinguish between them by plant number
```

### US-016: Handle Duplicate Site Names

**Story:** As an APHA Data Entry User, I want to be warned when entering duplicate site names, so that I can verify this is intentional and maintain data quality.

**Priority:** Should

**Wireframes:**

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                              Add New Site                                     ║
║                                                                               ║
║ Plant Number: |UK99999    | (*)                                              ║
║                                                                               ║
║ Site Name: |Test Abattoir Ltd              | (*) ⚠️ Similar site name      ║
║                                                    exists (UK12345) [1]      ║
║                                                                               ║
║ [Additional form fields...]                                                   ║
║                                                                               ║
║                    [ Save Site ] [ Cancel ]                                  ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

**Callout Key:**
- [1] Warning about similar/duplicate site name with reference to existing site

**Acceptance Criteria:**

```gherkin
Scenario: Warn about duplicate site names
  Given site "Test Abattoir Ltd" with plant number "UK12345" exists
  When I enter "Test Abattoir Ltd" as the site name for a new site
  And I move to the next field
  Then I see warning "Similar site name exists (UK12345)"
  And I can still proceed with saving if intended

Scenario: Allow duplicate names with confirmation
  Given I see a duplicate name warning
  When I click Save Site
  Then I see confirmation "Site name already exists. Are you sure you want to continue?"
  And when I confirm, the site is saved successfully
```

---

## 7. User Flows and Scenarios

### Flow 1: New Site Registration Flow

**Entry point:** APHA staff receives training notification from a site not in the system, accessed via Sites dropdown menu → Add Site.

**Step-by-step actions:**
1. Navigate to Add Site screen
2. Enter plant number (system validates uniqueness in real-time)
3. Enter site name (system checks for duplicates and warns)
4. Complete address fields (all optional but recommended)
5. Enter contact details (telephone and fax, both optional)
6. Check APHA site checkbox if applicable
7. Click Save Site

**Decision points:**
- If plant number exists: show error, prevent save
- If site name duplicates: show warning, allow save with confirmation
- If required fields missing: show validation errors

**Exit points:**
- Successful save returns to previous screen with confirmation
- Cancel returns to previous screen without saving
- System errors show message and keep user on form

**Error/exception paths:**
- Database connectivity issues: show "Unable to save site. Please try again."
- Server validation failures: display specific field errors
- Session timeout: redirect to login with message "Session expired. Please log in again."

### Flow 2: Site Personnel Review Flow

**Entry point:** APHA staff needs to review training coverage for a site, accessed via Sites dropdown menu → Site Trainees.

**Step-by-step actions:**
1. Navigate to Site Trainees screen
2. Select site from dropdown
3. System loads and displays personnel table
4. Review personnel training status
5. Optionally export list for compliance reporting
6. Optionally click View to see personnel details (handled by Personnel Management feature)

**Decision points:**
- If site has no personnel: display "No personnel found" message
- If site has personnel: display table with current/expired status indicators

**Exit points:**
- Navigate to other sections via main navigation
- Click View to open personnel details in separate screen

**Error/exception paths:**
- Site data load failure: "Unable to load site personnel. Please try again."
- Export failure: "Unable to generate export. Please contact support."

---

## 8. UI/Layout Specifications

### 8.1 Add Site Screen — Core Workflow

**Page title and navigation context:** "Add New Site" accessible from Sites dropdown menu in main navigation bar.

**Layout structure:**
- Standard application header with user welcome message and logout option
- Main navigation bar with Home, Sites dropdown, Personnel, Training, Reports
- Centered main content area with form panel
- Standard application footer

**Main content form panel:**
- **Form container**: Double-line bordered panel with "Add New Site" header
- **Plant Number field**: Text input, maximum 11 characters, required indicator (*), real-time validation
- **Site Name field**: Text input, maximum 50 characters, required indicator (*), duplicate name warning
- **Address section**: Logical grouping with "Address:" label
  - Line 1: Text input, maximum 50 characters, placeholder "Building name/number and street"
  - Line 2: Text input, maximum 50 characters, placeholder "Additional address line"
  - Town: Text input, maximum 50 characters
  - County: Text input, maximum 50 characters
  - Postcode: Text input, maximum 50 characters, placeholder "AA1 1AA"
- **Contact Details section**: Logical grouping with "Contact Details:" label
  - Telephone: Text input, maximum 50 characters
  - Fax: Text input, maximum 50 characters
- **APHA Site checkbox**: Single checkbox with label "APHA Site"
- **Action buttons**: "Save Site" (primary blue button), "Cancel" (secondary grey button)

**Interaction states:**
- **Loading**: Save button shows "Saving..." text and spinner icon, disabled state
- **Validation errors**: Red text above relevant fields, red border on invalid inputs
- **Success**: Green confirmation banner appears at top: "Site [Plant Number] - [Site Name] created successfully"
- **Empty state**: All fields blank, focus on plant number field
- **Responsive behaviour**: Form maintains single column layout, minimum width 400px

### 8.2 Site Trainees View — Secondary Workflow

**Screen purpose:** Display all personnel associated with a selected sampling site for compliance monitoring.

**Navigation context:** Accessible via Sites dropdown menu → Site Trainees.

**Logical groupings:**
- **Site Selection Panel**: Dropdown showing "Site Name (Plant Number)" format, sorted alphabetically
- **Personnel Table Panel**: Data grid with columns for Name, Species, Last Training, Status, Actions
- **Summary Panel**: Total personnel count and export functionality

**Key interactions:**
- Site dropdown selection triggers personnel data load
- View buttons open personnel details (integration with Personnel Management feature)
- Export button generates CSV download
- Table sorting by clicking column headers

**State changes:**
- Empty state: "No personnel found for this site" when no associations exist
- Loading state: "Loading personnel..." with spinner during data fetch
- Error state: "Unable to load personnel data" with retry option

---

## 9. Business Rules and Validation

| Rule ID | Rule Description | Applies To | Validation Behaviour |
|---------|-----------------|------------|---------------------|
| BR-006 | Each site must have a unique plant number identifier | Plant number field | Real-time validation on field blur, error message "Plant number [value] already exists", prevents form submission |
| BR-007 | When sites change names due to mergers, old names should be preserved in brackets | Site name field | Advisory guidance in help text, no system enforcement in initial implementation |
| BR-008 | A site cannot be deleted if it has associated personnel records | Site deletion action | Pre-deletion check displays error "There are personnel from [Site Name] You can only delete a site with no trainees" |
| BR-015 | Duplicate site names should generate warnings to maintain data quality | Site name field | Warning message "Similar site name exists ([Plant Number])" on field blur, allows save with confirmation |
| BR-002 | Plant numbers must be unique alphanumeric identifiers up to 11 characters | Plant number field | Format validation: alphanumeric only, maximum 11 characters, required field |
| BR-003 | Site names must not be empty and should be limited to 50 characters | Site name field | Required field validation, maximum length 50 characters |

---

## 10. Data Model and Requirements

### Entities

| Entity | Key Attributes | Description |
|--------|---------------|-------------|
| Site | PlantNo, Name, AddressLine1, AddressLine2, AddressTown, AddressCounty, AddressPostCode, Telephone, Fax, IsAPHASite | Sampling facility where brainstem sampling training is performed |

### Search Parameters

| Parameter | Type | Behaviour | Required |
|-----------|------|-----------|----------|
| Site Selection | String | Partial match on site name or plant number | No |
| APHA Site Filter | Boolean | Exact match on IsAPHASite flag | No |

### Data Relationships

- **Site → Personnel**: One-to-many relationship via PlantNo foreign key. Cascade rules prevent site deletion when personnel associations exist.
- **Site → Training Records**: One-to-many relationship where training events reference the site location. Sites provide location context for training validation.

---

## 11. Integration Points and External Dependencies

| System | Integration Type | Direction | Description | Criticality |
|--------|-----------------|-----------|-------------|-------------|
| Personnel Management (FT-003) | Internal API | Bidirectional | Sites provide location data for personnel assignment; Personnel system provides association counts for deletion validation | Required |
| Training Management (FT-004, FT-005) | Internal API | Outbound | Sites appear in training record forms for location selection | Required |
| Audit System | Database | Outbound | All site operations logged with user ID, timestamp, and operation details | Required |
| Authentication System (FT-001) | Internal API | Inbound | User authentication and authorization for screen-level access control | Required |

---

## 12. Non-Functional Requirements

| NFR ID | Category | Requirement | Acceptance Threshold |
|--------|----------|-------------|---------------------|
| NFR-001 | Usability | Site registration completion time | Under 5 minutes for complete site entry |
| NFR-002 | Data Integrity | Plant number uniqueness validation | 100% prevention of duplicate plant numbers |
| NFR-003 | Performance | Site selection dropdown load time | Under 3 seconds for up to 1000 sites |
| NFR-004 | Accessibility | WCAG 2.1 AA compliance | All form fields accessible via keyboard and screen reader |
| NFR-005 | Data Volume | Site storage capacity | Support for 2000+ sites with room for growth |

---

## 13. Legacy Pain Points and Proposed Improvements

| # | Legacy Pain Point | Impact | Proposed Improvement | Rationale |
|---|------------------|--------|---------------------|-----------|
| 1 | Site editing requires backend database access rather than UI functionality | Requires technical expertise and delays for routine updates | Implement comprehensive site editing UI with proper validation | Reduces dependency on database administrators and improves operational efficiency |
| 2 | No validation prevents duplicate site names from being entered | Data quality issues and confusion when selecting sites | Add duplicate name warning with confirmation option | Maintains data quality while allowing legitimate duplicates (different locations with same business name) |
| 3 | Heavy reliance on dropdown selections without search/filter capabilities | Time-consuming site selection with large numbers of sites | Enhanced dropdown with type-ahead search and filtering | Improves user efficiency when system scales beyond current site count |
| 4 | Manual duplicate checking required as system does not prevent duplicates | Risk of data inconsistency and wasted effort | Implement real-time validation for plant numbers and warnings for site names | Prevents data integrity issues and reduces manual verification work |

---

## 14. Internal System Dependencies

| Dependency | Type | Description | Impact if Unavailable |
|------------|------|-------------|----------------------|
| Authentication System (FT-001) | Blocks | User authentication and screen-level permission validation | Site management features completely unavailable |
| Personnel Management (FT-003) | Enhances | Personnel association counts for deletion validation | Site deletion validation degraded, referential integrity at risk |
| Audit System | Shared data | Logging of all site operations with user context | Compliance and traceability reduced, but core functionality remains |
| Training Features (FT-004, FT-005) | Enhances | Site selection for training record location assignment | Training records cannot specify location, compliance reporting impacted |

---

## 15. Business Dependencies

| Dependency | Owner | Description | Status |
|------------|-------|-------------|--------|
| Site data migration strategy | APHA Data Migration Team | Approach for migrating existing site records and handling potential duplicates | Pending |
| Site editing business rules clarification | APHA Business Analysis Team | Determine requirements for site modification workflows | Pending |
| Legacy database schema analysis | System Administrator | Understanding current site deletion constraints and referential integrity | In Progress |

---

## 16. Key Assumptions

| # | Assumption | Risk if Invalid |
|---|-----------|-----------------|
| 1 | Current site dropdown selection approach is acceptable for up to 1000 sites | Would need to implement search/filtering capabilities earlier than planned |
| 2 | APHA site designation is a simple boolean flag without complex business rules | Site classification logic would need to be more sophisticated |
| 3 | Site address standardisation is not required in initial implementation | Address validation and standardisation features would need to be added |
| 4 | Duplicate site names are occasionally legitimate (same business name, different locations) | Would need to implement stricter unique name enforcement if assumption is wrong |

---

## 17. Success Metrics and KPIs

| Metric | Baseline (Legacy) | Target (New System) | Measurement Method |
|--------|-------------------|--------------------|--------------------|
| Site registration completion time | N/A (manual database entry) | Under 5 minutes | User journey timing during testing |
| Site data validation errors | Unknown (manual validation) | Reduce by 90% | Error tracking in application logs |
| Time to resolve site data issues | Hours (requires DBA) | Under 15 minutes | Support ticket resolution time |
| User satisfaction with site selection | N/A | 8/10 or higher | Post-implementation user survey |

---

## 18. Effort Estimate

| Dimension | Estimate | Assumptions |
|-----------|----------|-------------|
| **Human Effort** | 15 person-days | Includes UI development, validation logic, integration with Personnel Management, comprehensive testing, and data migration support. Excludes site editing functionality pending business requirements clarification. |

---

## 19. Open Questions

| # | Question | Context | Impact | Raised By | Status |
|---|----------|---------|--------|-----------|--------|
| 1 | Should site editing be implemented in the UI or continue to require database access? | Application analysis shows current site editing requires backend database access rather than UI functionality | Core feature functionality - editing is fundamental to site management | Agent | Open |
| 2 | Should duplicate site names be prevented entirely or allowed with warnings? | Domain analysis identifies duplicate site name prevention as missing validation rule, but businesses may legitimately have same names in different locations | Data quality vs operational flexibility trade-off | Agent | Open |
| 3 | What is the expected maximum number of sites the system should support? | Performance and UI design considerations for site selection dropdowns | UI approach and performance requirements may need adjustment | Agent | Open |

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
| **Plant number** | Unique alphanumeric identifier assigned to each sampling site, maximum 11 characters, used across APHA systems for site identification |
| **Site registration** | Process of adding a new sampling site to the system with complete location and contact information |
| **Site-personnel association** | Database relationship linking training personnel to their primary sampling site location |
| **APHA site** | Sampling facility directly operated by APHA, as opposed to external commercial sites |
| **Cascade training location** | Site where previously trained personnel deliver training to colleagues, requiring site registration for record-keeping |