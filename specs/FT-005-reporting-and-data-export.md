# FT-005: Reporting & Data Export

## Metadata

| Field                   | Value                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Feature ID**          | FT-005                                                                                                                         |
| **Upstream Features**   | FT-001, FT-002, FT-003, FT-004                                                                                                |
| **Downstream Features** | None                                                                                                                           |
| **Feature Name**        | Reporting & Data Export                                                                                                        |
| **Owner**               | APHA Supervisor                                                                                                                |
| **Priority**            | Should — Essential for regulatory compliance and data analysis, but not blocking core operational workflows                   |
| **Last Updated**        | 2026-03-31                                                                                                                     |
| **PRD Reference**       | Section 8 — Reports & Analytics, Section 7 — Computed Fields, Reports Screen specification                                     |
| **Open Questions**      | 3                                                                                                                              |

---

## 1. Problem Statement

The current system requires users to manually extract and compile training data from multiple screens for regulatory reporting and compliance verification. Users cannot easily generate comprehensive reports showing the relationships between sites, personnel, trainers, and training records, making it difficult to demonstrate compliance with BSE surveillance requirements and conduct data analysis for regulatory authorities.

## 2. Benefit Hypothesis

We believe that providing comprehensive Excel-based data export capabilities will result in streamlined regulatory reporting and improved data analysis efficiency for APHA staff. We will know this is true when report generation time reduces from manual compilation to under 30 seconds, and users can demonstrate complete training compliance through a single exported file with cross-referenced data relationships.

## 3. Target Users and Personas

| Persona | Role Description | Relationship to Feature | Usage Frequency |
|---------|-----------------|------------------------|-----------------|
| APHA Supervisor | Senior APHA staff with full system access | Primary | Weekly |
| APHA Read-Only User | APHA staff requiring view access for enquiries and reporting | Primary | Monthly |
| APHA Data Entry User | APHA staff with restricted access based on screen-level permissions | Secondary | Monthly |

Users are expected to have intermediate Excel proficiency and understanding of regulatory compliance requirements for BSE surveillance training records.

## 4. User Goals and Success Criteria

| #   | User Goal                                    | Success Criterion                                                 |
| --- | -------------------------------------------- | ----------------------------------------------------------------- |
| 1   | Generate complete system data export for compliance reporting | Excel file containing all current training, personnel, and site data is generated within 30 seconds |
| 2   | Analyse training patterns and personnel distribution across sites | Report provides accurate personnel counts per site and trainer activity summaries |
| 3   | Verify data relationships between trainers, trainees, and sites | Hyperlinks in Excel allow navigation between related records across worksheets |
| 4   | Provide regulatory authorities with comprehensive training evidence | Single file contains all required data elements for BSE surveillance compliance |

## 5. Scope and Boundaries

### In Scope

- Complete system data export to Excel format with filename format "BST_All_YYYY-MM-DD.xlsx"
- Five separate worksheets: Sites, People, Trainers, Training, and APHA locations
- Cross-sheet hyperlinks connecting related data elements
- Personnel count calculations per site
- Trainer activity summaries showing training delivery
- File download to user's local computer
- Real-time data export reflecting current system state

### Out of Scope

- Scheduled or automated report generation — manual generation only
- Custom report filtering or parameterisation — full data export only
- Report caching or persistence — generated fresh each time
- Email distribution of reports — manual download and sharing
- Alternative file formats (PDF, CSV) — Excel only
- Historical reporting or point-in-time snapshots — current data only

### Boundaries

- Receives data from all upstream features (site management, personnel management, trainer management, training records)
- Outputs to user's file system via browser download
- No integration with external reporting systems or data warehouses

## 6. User Stories and Acceptance Criteria

### US-046: Generate Complete System Report

**Story:** As an APHA Supervisor, I want to generate a comprehensive Excel report of all system data, so that I can provide regulatory authorities with complete training compliance evidence.

**Priority:** Must

**Wireframes:**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ BSE Training System - APHA                                           [User Menu] │
├─────────────────────────────────────────────────────────────────────────────────┤
│ [Home] [Sites] [People] [Trainers] [Training] [Reports ▼] [Admin]              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│ ╔═══════════════════════════════════════════════════════════════════════════╗   │
│ ║                              Reports                                      ║   │
│ ║                                                                           ║   │
│ ║  Generate comprehensive system report containing:                         ║   │
│ ║  • All training records                                                   ║   │
│ ║  • Personnel and site associations                                        ║   │
│ ║  • Trainer activity summaries                                             ║   │
│ ║  • APHA location directory                                                ║   │
│ ║                                                                           ║   │
│ ║  Report will be generated as Excel file with current date.               ║   │
│ ║                                                                           ║   │
│ ║                    [ Generate Complete Report ] [1]                      ║   │
│ ║                                                                           ║   │
│ ╚═══════════════════════════════════════════════════════════════════════════╝   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Callouts:**
[1] Button generates Excel file with filename "BST_All_YYYY-MM-DD.xlsx"

**Acceptance Criteria:**

```gherkin
Scenario: Generate complete data export
  Given I am logged in as an APHA Supervisor
  And the system contains training records, personnel, and site data
  When I click the "Generate Complete Report" button
  Then an Excel file is created with filename format "BST_All_YYYY-MM-DD.xlsx"
  And the file contains worksheets named "Sites", "People", "Trainers", "Training", and "APHA Locations"
  And the file is automatically downloaded to my computer
  And the generation completes within 30 seconds

Scenario: Report reflects current data state
  Given the system contains current training and personnel data
  When I generate the complete data export
  Then all active training records are included in the Training worksheet
  And personnel counts per site are accurate in the Sites worksheet
  And trainer activity is correctly summarised in the Trainers worksheet
  And the data reflects the current system state at time of generation
```

### US-047: Navigate Cross-Referenced Data in Excel Report

**Story:** As an APHA Read-Only User, I want to navigate between related records using hyperlinks in the Excel report, so that I can efficiently analyse relationships between trainers, trainees, and sites.

**Priority:** Should

**Wireframes:**

```
Excel Workbook: BST_All_2026-03-31.xlsx

╔════════════════════════════════════════════════════════════════════════╗
║ Sites Worksheet                                                        ║
║                                                                        ║
║ Plant No    | Site Name           | Personnel Count | View Personnel    ║
║ 12345      | Acme Abattoir       | 5              | [Link to People] [1] ║
║ 67890      | Beta Processing     | 3              | [Link to People]     ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ People Worksheet                                                       ║
║                                                                        ║
║ Person Name      | Site        | Training Records | View Training       ║
║ Smith, John      | 12345      | 2               | [Link to Training] [2] ║
║ Jones, Mary      | 12345      | 1               | [Link to Training]     ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
```

**Callouts:**
[1] Hyperlink navigates to People worksheet filtered for this site
[2] Hyperlink navigates to Training worksheet showing records for this person

**Acceptance Criteria:**

```gherkin
Scenario: Navigate from site to personnel
  Given I have opened the generated Excel report
  And I am viewing the Sites worksheet
  When I click a "Link to People" hyperlink for a site
  Then I am taken to the People worksheet
  And the view shows personnel associated with that site

Scenario: Navigate from person to training records
  Given I have opened the generated Excel report
  And I am viewing the People worksheet
  When I click a "Link to Training" hyperlink for a person
  Then I am taken to the Training worksheet
  And the view shows training records for that person

Scenario: Trainer cross-reference navigation
  Given I have opened the generated Excel report
  And I am viewing the Trainers worksheet
  When I click a trainer's training activity link
  Then I can navigate to see all personnel trained by that trainer
```

### US-048: Download and Access Generated Report

**Story:** As an APHA Data Entry User, I want to download the generated Excel report to my computer, so that I can share training compliance data with external stakeholders.

**Priority:** Must

**Wireframes:**

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                            Browser Download                               ║
║                                                                           ║
║  BST_All_2026-03-31.xlsx has been downloaded                             ║
║                                                                           ║
║  File size: 145 KB                                                       ║
║  Download location: Downloads folder                                     ║
║                                                                           ║
║  [ Open File ] [1]    [ Show in Folder ] [2]    [ Dismiss ]             ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**Callouts:**
[1] Opens the Excel file in the default application
[2] Shows the file in the operating system's file manager

**Acceptance Criteria:**

```gherkin
Scenario: Successful file download
  Given I have clicked the "Generate Complete Report" button
  And the report generation has completed successfully
  When the Excel file is created
  Then the file is automatically downloaded to my default Downloads folder
  And the filename follows the format "BST_All_YYYY-MM-DD.xlsx"
  And the browser shows a download completion notification
  And I can open the file in Excel or equivalent application

Scenario: File accessibility and format
  Given I have downloaded the Excel report
  When I open the file
  Then it opens successfully in Microsoft Excel or compatible application
  And all worksheets are accessible and properly formatted
  And hyperlinks function correctly within the Excel application
```

### US-049: Handle Report Generation Errors

**Story:** As an APHA Supervisor, I want to receive clear error messages when report generation fails, so that I can understand what went wrong and take appropriate action.

**Priority:** Must

**Wireframes:**

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                              Error Message                                ║
║                                                                           ║
║  ⚠️  Report Generation Failed                                             ║
║                                                                           ║
║  The system encountered an error while generating your report:            ║
║                                                                           ║
║  • Database connection temporarily unavailable                            ║
║                                                                           ║
║  Please try again in a few moments. If the problem persists,             ║
║  contact your system administrator.                                       ║
║                                                                           ║
║                           [ Try Again ] [1]    [ Close ]                 ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**Callouts:**
[1] Attempts to regenerate the report

**Acceptance Criteria:**

```gherkin
Scenario: Database connection error
  Given I am attempting to generate a complete report
  When the database connection fails during generation
  Then I see an error message stating "Database connection temporarily unavailable"
  And I am offered the option to "Try Again"
  And no partial or corrupted file is downloaded

Scenario: System timeout error
  Given I am generating a report with large amounts of data
  When the generation process exceeds the timeout limit
  Then I see an error message indicating the system timed out
  And I am advised to contact the system administrator
  And the system remains responsive for other operations

Scenario: Data integrity error
  Given the system detects inconsistent data during report generation
  When the integrity check fails
  Then I see an error message describing the data issue
  And I am directed to review the source data before retrying
```

### US-050: Verify Report Data Accuracy

**Story:** As an APHA Supervisor, I want to verify that the generated report contains accurate and complete data, so that I can confidently use it for regulatory compliance purposes.

**Priority:** Must

**Wireframes:**

```
Excel Workbook Structure:

╔════════════════════════════════════════════════════════════════════════╗
║ Training Worksheet                                                     ║
║                                                                        ║
║ Trainee Name | Trainer Name | Date Trained | Species | Training Type  ║
║ Smith, John  | Williams, A  | 15/03/2026  | Cattle  | Trained        ║
║ Jones, Mary  | Smith, John  | 20/03/2026  | Sheep   | Cascade Trained ║
║ Brown, Bob   | Williams, A  | 22/03/2026  | Goat    | Training Confirmed ║
║                                                                        ║
║ Total Records: 156                                                     ║
║ Generated: 31/03/2026 14:30                                           ║
╚════════════════════════════════════════════════════════════════════════╝
```

**Acceptance Criteria:**

```gherkin
Scenario: All required training data included
  Given the system contains training records with all required fields
  When I generate the complete data export
  Then every training record includes trainee name, trainer name, training date, species, and training type
  And no records are missing required field values
  And the total record count matches the system count

Scenario: Personnel site associations accurate
  Given personnel are associated with specific sites in the system
  When I review the People worksheet in the generated report
  Then each person is correctly associated with their assigned site
  And the site personnel counts on the Sites worksheet match the individual person listings

Scenario: Trainer activity summary correct
  Given trainers have delivered training to multiple personnel
  When I review the Trainers worksheet
  Then each trainer's training delivery count is accurate
  And the training activity links correctly reference the associated training records
  And cascade training relationships are properly represented

Scenario: Data freshness verification
  Given I have made changes to training records immediately before report generation
  When I generate the report
  Then the changes are reflected in the exported data
  And the report generation timestamp shows the current date and time
```

---

## 7. User Flows and Scenarios

### Flow 1: Primary Reporting Flow

**Entry point**: User navigates to Reports section from main navigation menu

**Step-by-step actions**:
1. User clicks on "Reports" dropdown menu from main navigation
2. User selects "Complete System Report" option
3. System displays report generation page with description of report contents
4. User clicks "Generate Complete Report" button
5. System processes request and generates Excel file with current date filename
6. Browser automatically downloads the Excel file to user's default Downloads folder
7. User receives download completion notification

**Decision points**:
- If generation fails, user can choose to retry or contact administrator
- User can choose to open file immediately or access later from Downloads folder

**Exit points**:
- Successful download completes the flow
- User can navigate away to other system sections
- User can generate additional reports by repeating the process

**Error/exception paths**:
- Database connection failure displays error message with retry option
- System timeout shows error message directing user to administrator
- Data integrity issues prevent generation and show specific error details

### Flow 2: Report Analysis Flow

**Entry point**: User has downloaded Excel report and wants to analyse the data

**Step-by-step actions**:
1. User opens downloaded Excel file in Microsoft Excel or compatible application
2. User reviews the five worksheets: Sites, People, Trainers, Training, APHA Locations
3. User clicks hyperlinks to navigate between related records across worksheets
4. User analyses personnel distribution, training patterns, and compliance status
5. User may export specific worksheets or create pivot tables for further analysis

**Decision points**:
- User can focus on specific worksheets based on analysis needs
- User can follow hyperlinks to drill down into relationships
- User can create additional analysis tools within Excel

**Exit points**:
- Analysis complete, user saves file with additional notes or formatting
- User shares file with stakeholders via email or file sharing
- User prints specific worksheets for offline review

**Error/exception paths**:
- Hyperlinks not functioning properly in user's Excel version
- File corruption prevents proper opening
- Missing data noticed during analysis requires regeneration

## 8. UI/Layout Specifications

### 8.1 Reports Generation Page — Core Workflow

**Page title and navigation context**: "Reports" - accessible via main navigation menu dropdown

**Layout structure**:
- Standard application header with navigation menu
- Main content area containing report generation panel
- Standard footer

**Report generation panel**:
- **Component type**: Card/panel with bordered content area using double-line borders for new functionality
- **Panel header**: "Reports" with large, clear typography
- **Description section**:
  - Multi-line explanatory text describing report contents
  - Bullet points listing the five data categories included
  - Note about Excel format and current date filename
- **Generation button**:
  - Label: "Generate Complete Report"
  - Position: Centred within panel
  - Primary button styling with prominent appearance
  - Enabled state: Blue background with white text
  - Disabled state: Grey background during generation
  - Loading state: Shows spinner icon with "Generating..." text
- **Success state**: Green success message with download link appears below button
- **Error state**: Red error message panel appears with specific error details and retry option

**Responsive behaviour**: Panel scales to fit various screen sizes while maintaining button prominence and readability

### 8.2 Download Notification — Secondary Workflow

**Screen purpose**: Browser-native download notification confirming successful file generation

**Logical groupings**:
- **Download completion notification**: Browser's standard download bar or popup
- **File information panel**: Shows filename, file size, and download location
- **Action buttons**: Open file, show in folder, dismiss notification

**Key interactions**:
- Clicking "Open File" launches Excel or default application
- "Show in Folder" opens operating system file manager
- Download progress indicator during generation
- Automatic dismissal after user action or timeout

## 9. Business Rules and Validation

| Rule ID | Rule Description                               | Applies To                                         | Validation Behaviour                                                          |
| ------- | ---------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------- |
| BR-015  | Excel filename must include current date in YYYY-MM-DD format | Report file generation | System automatically generates filename "BST_All_YYYY-MM-DD.xlsx" using current date |
| BR-016  | All training records must include required fields as per BR-013 | Training worksheet data export | System validates each training record has trainee, trainer, species, training type, and date before including in export |
| BR-017  | Personnel count per site must accurately reflect active associations | Sites worksheet personnel count calculation | System counts distinct persons associated with each site and displays accurate totals |
| BR-018  | Hyperlinks must reference valid row numbers in target worksheets | Cross-sheet hyperlink generation | System generates sequential row references for hyperlink targets and validates existence |
| BR-019  | Report generation must complete within performance threshold | Report generation process | System fails generation with timeout error if process exceeds 30 seconds |
| BR-020  | Only users with appropriate permissions can generate reports | Report access control | System checks user role permissions before allowing report generation |

## 10. Data Model and Requirements

### Entities

| Entity | Key Attributes | Description |
|--------|---------------|-------------|
| Site | PlantNo, Name, Address fields, Contact details, Personnel count | Sampling facilities requiring training compliance reporting |
| Person | PersonId, PersonName, SiteId, HasTraining flag | Personnel requiring or having brainstem sampling training |
| Trainer | TrainerId, TrainerName, LocationId, Training delivery count | Qualified individuals delivering training to others |
| Training | TraineeId, TrainerId, DateTrained, SpeciesTrained, TrainingType | Individual training certification records |
| APHALocation | LocationId, LocationName, IsAHVLA flag | APHA facility directory for trainer assignments |

### Search Parameters

Not applicable - this feature performs full data export without filtering or search capabilities.

### Data Relationships

- Site → Person: One-to-many relationship via PlantNo to SiteId
- Trainer → Training: One-to-many relationship via TrainerId
- Person → Training: One-to-many relationship via PersonId to TraineeId
- APHALocation → Trainer: One-to-many relationship via LocationId
- Training records enforce referential integrity to both Trainer and Person entities

## 11. Integration Points and External Dependencies

| System | Integration Type | Direction | Description | Criticality |
|--------|-----------------|-----------|-------------|-------------|
| Database | Direct database query | Inbound | Reads all training, personnel, site, and trainer data for export | Required |
| File System | Local file creation | Outbound | Generates Excel file with formatted worksheets and hyperlinks | Required |
| Browser Download API | File download | Outbound | Triggers automatic download of generated Excel file to user's computer | Required |
| Microsoft Excel | File format compatibility | Outbound | Ensures generated file opens correctly in Excel and compatible applications | Required |

## 12. Non-Functional Requirements

| NFR ID  | Category                                                                    | Requirement                | Acceptance Threshold                       |
| ------- | --------------------------------------------------------------------------- | -------------------------- | ------------------------------------------ |
| NFR-005 | Performance | Report generation response time | Complete full data export within 30 seconds |
| NFR-006 | Usability | Excel file compatibility | File opens successfully in Microsoft Excel 2016 and later versions |
| NFR-007 | Data Volume | Report size handling | Support export of up to 10,000 training records without performance degradation |
| NFR-008 | Availability | Report generation reliability | 99% successful generation rate during normal system operation |

## 13. Legacy Pain Points and Proposed Improvements

| # | Legacy Pain Point | Impact | Proposed Improvement | Rationale |
|---|------------------|--------|---------------------|-----------|
| 1 | Limited reporting capabilities beyond basic Excel data dump | Users must manually analyse and cross-reference data from multiple screens | Implement hyperlinked Excel worksheets with cross-references between related data | Enables efficient data analysis and relationship discovery within single file |
| 2 | No caching implemented, causing performance issues with repeated data loads | Users experience slow response times when generating multiple reports | Optimise database queries and implement efficient data retrieval for report generation | Improves user experience and system responsiveness |
| 3 | Manual compilation required for regulatory compliance reporting | Time-consuming process to gather all necessary data for regulatory submissions | Single comprehensive report containing all required compliance data elements | Reduces manual effort and ensures completeness of regulatory submissions |

## 14. Internal System Dependencies

| Dependency | Type | Description | Impact if Unavailable |
|------------|------|-------------|----------------------|
| FT-001: Site Management | Shared data | Site information and plant numbers for Sites worksheet | Sites worksheet would be empty, breaking cross-references |
| FT-002: Personnel Management | Shared data | Person records and site associations for People worksheet | People worksheet would be empty, personnel counts invalid |
| FT-003: Trainer Management | Shared data | Trainer information and APHA location assignments | Trainers worksheet would be empty, training records incomplete |
| FT-004: Training Records Management | Shared data | All training certification data for Training worksheet | Core training data missing, compliance reporting impossible |
| Database connectivity | Blocks | Live database access for current data retrieval | Report generation completely blocked until database available |

## 15. Business Dependencies

| Dependency                                                        | Owner                        | Description              | Status                             |
| ----------------------------------------------------------------- | ---------------------------- | ------------------------ | ---------------------------------- |
| Excel format standardisation approval | APHA Data Management Team | Confirmation that Excel format meets organisational standards | Pending |
| Regulatory compliance validation | APHA Compliance Team | Verification that report contents satisfy BSE surveillance requirements | In Progress |
| File download security clearance | IT Security Team | Approval for automated file download functionality | Resolved |

## 16. Key Assumptions

| # | Assumption | Risk if Invalid |
|---|-----------|-----------------|
| 1 | Users have Microsoft Excel or compatible application installed on their computers | Generated files cannot be opened, reducing feature utility and requiring alternative formats |
| 2 | Current data volume (estimated <10,000 training records) will not cause performance issues | Report generation may exceed 30-second threshold, requiring performance optimisation or pagination |
| 3 | Browser download functionality is available and not blocked by corporate policies | Users cannot receive generated files, requiring alternative delivery mechanisms |
| 4 | Hyperlink functionality works consistently across different Excel versions | Cross-referencing capabilities may be limited, reducing analytical value of reports |

## 17. Success Metrics and KPIs

| Metric                                        | Baseline (Legacy)                      | Target (New System)           | Measurement Method          |
| --------------------------------------------- | -------------------------------------- | ----------------------------- | --------------------------- |
| Report generation time | Manual compilation: 2-4 hours | Automated generation: <30 seconds | System performance monitoring |
| Regulatory compliance reporting efficiency | Multiple screen exports required | Single comprehensive file | User feedback and time studies |
| Data accuracy in reports | Manual compilation errors common | 100% data accuracy | Automated validation checks |
| User satisfaction with reporting capabilities | Limited legacy reporting functionality | 80% user satisfaction rating | User survey post-implementation |

## 18. Effort Estimate

| Dimension        | Estimate       | Assumptions                                |
| ---------------- | -------------- | ------------------------------------------ |
| **Human Effort** | 8 person-days  | Excel generation library available, database queries optimised, standard web download implementation |

## 19. Open Questions

| # | Question | Context | Impact | Raised By | Status |
|---|----------|---------|--------|-----------|--------|
| 1 | Should report generation be logged in the audit trail as per BR-014? | Business rule requires logging of data modification operations, but unclear if report generation qualifies | May require additional audit logging implementation | Agent | Open |
| 2 | Are there specific access controls for who can generate reports beyond general user permissions? | PRD mentions different user roles but no specific reporting permissions | May need additional permission checks before allowing report generation | Agent | Open |
| 3 | Should the system support filtering reports by date range, site, or other criteria? | PRD only mentions complete data export but users may need filtered reports | Could significantly expand scope and complexity if filtering is required | Agent | Open |

**Update the Open Questions count in the Metadata table whenever questions are added or resolved.**

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
| Cross-sheet hyperlink | Excel hyperlink that navigates from one worksheet to a specific row in another worksheet within the same workbook |
| Personnel count | Calculated field showing the total number of distinct persons associated with each site |
| Report generation | Automated process of querying database and creating formatted Excel file with multiple worksheets |
| Trainer activity summary | Calculated summary showing the number of training events delivered by each trainer |