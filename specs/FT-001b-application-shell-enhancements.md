# FT-001b: Application Shell Enhancements

## Metadata

| Field                   | Value                                                                                    |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| **Feature ID**          | FT-001b                                                                                  |
| **Upstream Features**   | FT-001a                                                                                  |
| **Downstream Features** | FT-002, FT-003, FT-004, FT-005, FT-006                                                   |
| **Feature Name**        | Application Shell Enhancements                                                           |
| **Owner**               | System Administrator                                                                     |
| **Priority**            | Should                                                                                   |
| **Last Updated**        | 2026-04-03                                                                               |
| **PRD Reference**       | Section 10 — Roles & Permissions; System Administration bounded context                  |

---

## 1. Problem Statement

With the core authentication and navigation shell established in FT-001a, additional enhancements are needed to provide a complete user experience. These include a help system for user guidance, system announcements for administrative communications, screen-level permissions for fine-grained access control, an audit log viewer for administrators, and session timeout handling.

> **Note:** This feature depends on FT-001a being implemented first. Several items (screen-level permissions, context-sensitive help) also benefit from downstream features (FT-002 through FT-006) being in place.

## 2. Scope

### In Scope

- Help system with role-filtered topics and context-sensitive navigation
- System announcements panel on home page
- Screen-level permissions for Data Entry users (data_entry table)
- Audit log viewer UI for Supervisors
- Session timeout modal with warning and extension option

### Out of Scope

- Everything already delivered by FT-001a
- Business function implementations — covered by FT-002 through FT-006

## 3. User Stories and Acceptance Criteria

### US-001: Help System Access

**Story:** As a system user, I want to access help documentation and guidance, so that I can understand how to use system features effectively and resolve issues independently.

**Priority:** Should

**Wireframes:**

```
┌─────────────────────────────────────────────────────────────────┐
│ BST System - Help                                    [Home]     │
├─────────────────────────────────────────────────────────────────┤
│ ╔═════════════════════════════════════════════════════════════╗ │
│ ║ Help Topics                                                 ║ │
│ ║                                                             ║ │
│ ║ • Getting Started [1]                                       ║ │
│ ║ • Training Records Management [2]                           ║ │
│ ║ • Site Management [3]                                       ║ │
│ ║ • Personnel Management [4]                                  ║ │
│ ║ • Generating Reports [5]                                    ║ │
│ ║ • User Management (Admin) [6]                               ║ │
│ ║ • Troubleshooting [7]                                       ║ │
│ ║ • Contact Information [8]                                   ║ │
│ ║                                                             ║ │
│ ╚═════════════════════════════════════════════════════════════╝ │
│                                                                 │
│ ╔═════════════════════════════════════════════════════════════╗ │
│ ║ Getting Started                                             ║ │
│ ║                                                             ║ │
│ ║ Welcome to the Brainstem Training System (BST). This        ║ │
│ ║ system helps APHA staff manage training records for         ║ │
│ ║ brainstem sampling procedures.                              ║ │
│ ║                                                             ║ │
│ ║ Your Access Level: Supervisor                               ║ │
│ ║ You have full access to all system functions including      ║ │
│ ║ data entry, reporting, and user management.                 ║ │
│ ║                                                             ║ │
│ ║ [Image: Home Page Navigation]                               ║ │
│ ║                                                             ║ │
│ ║ To navigate the system:                                     ║ │
│ ║ 1. Start from the Home page                                 ║ │
│ ║ 2. Use dropdown menus to access functions                   ║ │
│ ║ 3. Use breadcrumbs to track your location                   ║ │
│ ║                                                             ║ │
│ ╚═════════════════════════════════════════════════════════════╝ │
├─────────────────────────────────────────────────────────────────┤
│ APHA BST System © 2026                                          │
└─────────────────────────────────────────────────────────────────┘
```

[1] Getting Started - basic system introduction and navigation
[2] Training Records Management - help for training record functions
[3] Site Management - help for site and location functions
[4] Personnel Management - help for trainee/trainer functions
[5] Generating Reports - help for reporting functions
[6] User Management - admin help (Supervisor only)
[7] Troubleshooting - common issues and solutions
[8] Contact Information - technical support details

**Context-sensitive help:** When accessed from specific screens via Help dropdown, the help system opens to the relevant topic section.

**Shell modifications required:**
- Add "[Help ▼]" dropdown button to application shell header (right-aligned)
- Help dropdown opens menu with "System Help" and "Contact Support" options
- "Contact Support" links to an in-app page displaying the BST support team email address and phone number

**Acceptance Criteria:**

```gherkin
Scenario: General help access from home page
  Given I am on the home page
  When I click the Help dropdown menu
  Then I see options to access different help topics
  And I can select "System Help" to view the main help page
  And the help page displays topics relevant to my role

Scenario: Context-sensitive help access
  Given I am on a downstream feature screen
  When I access help from the Help dropdown
  Then the help system opens to the relevant section
  And I see guidance specific to the current screen functionality

Scenario: Role-appropriate help content
  Given I am authenticated with "Data Entry" role
  When I access the help system
  Then I see help topics for functions available to my role
  And User Management help topics are not displayed
  And my access level is clearly indicated in the help content
```

### US-002: System Announcements

**Story:** As an authenticated user, I want to see system announcements on the home page, so that I am aware of important administrative messages.

**Priority:** Should

**Shell modifications required:**
- Add system announcements panel to home page below navigation panels

**Acceptance Criteria:**

```gherkin
Scenario: System announcements display
  Given I am on the home page
  When system announcements are configured
  Then I see the announcements in a dedicated panel
  And announcements display in chronological order with most recent first
  And a maximum of 5 announcements are displayed

Scenario: No announcements
  Given I am on the home page
  When no system announcements are configured
  Then the announcements panel shows "No current system announcements"
```

### US-003: Screen-Level Permissions for Data Entry Users

**Story:** As a Data Entry user, I want the system to enforce screen-level permissions, so that I can only edit data on screens where I have been granted write access.

**Priority:** Should

**Acceptance Criteria:**

```gherkin
Scenario: Data Entry user screen-level permissions
  Given I am authenticated with "Data Entry" role
  And a screen has "can_write" permission set to "S" (restricted) for my user
  When I access that specific screen
  Then all controls are disabled similar to read-only access
  And I cannot modify data on this particular screen
  And other screens with appropriate permissions remain editable
```

### US-004: Audit Log Viewer

**Story:** As a Supervisor, I want to view and filter audit log entries, so that I can monitor system security and user activity.

**Priority:** Should

**Wireframes:**

```
╔═══════════════════════════════════════════════════════════════════╗
║ System Administration - Audit Log Viewer (Supervisor Only)        ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║ ┌─────────────────────────────────────────────────────────────┐   ║
║ │ Filter: [Authentication Events ▼] [1]  [ Apply Filter ]     │   ║
║ │ Date Range: |01/03/2026| to |31/03/2026| [2]                │   ║
║ └─────────────────────────────────────────────────────────────┘   ║
║                                                                   ║
║ ┌─────────────────────────────────────────────────────────────┐   ║
║ │ Timestamp     │ User ID      │ Event        │ Details       │   ║
║ ├─────────────────────────────────────────────────────────────┤   ║
║ │ 31/03 14:23   │ jsmith      │ Login        │ Successful     │   ║
║ │ 31/03 14:22   │ bwilson     │ Access Denied│ No permissions │   ║
║ │ 31/03 14:20   │ jdoe        │ Login        │ Successful     │   ║
║ │ 31/03 14:15   │ mchen       │ Logout       │ Session ended  │   ║
║ │ 31/03 14:10   │ jsmith      │ Screen Access│ Training Recs  │   ║
║ └─────────────────────────────────────────────────────────────┘   ║
║                                                                   ║
║ [ Export to Excel ] [3]                   Records: 1,247          ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

[1] Event type filter - Authentication Events, Data Access, Data Modifications
[2] Date range selector for audit log filtering
[3] Export function for audit analysis

**Acceptance Criteria:**

```gherkin
Scenario: Audit log viewer access
  Given I am authenticated with "Supervisor" role
  When I access the audit log viewer
  Then I see a filterable list of audit log entries
  And I can filter by event type and date range

Scenario: Audit log export
  Given I am viewing audit log entries
  When I click "Export to Excel"
  Then the filtered audit log data is exported as a spreadsheet
```

### US-005: Session Timeout Handling

**Story:** As an authenticated user, I want to be warned before my session expires, so that I can extend it and avoid losing unsaved work.

**Priority:** Should

**Shell modifications required:**
- Add session status indicator to the application shell showing active session time and last activity (e.g. "Session Status: Active (2 hours 15 minutes) | Last Activity: 14:23")

**Acceptance Criteria:**

```gherkin
Scenario: Session timeout warning
  Given I have an active session
  And the session is approaching its expiry time
  When there are 10 minutes remaining
  Then a modal dialog appears warning me of the impending timeout
  And I am given the option to extend my session

Scenario: Session timeout
  Given I have been warned about session expiry
  And I do not extend my session
  When the session expires
  Then I am redirected to the login page
  And a message indicates my session has expired
```

---

## 4. User Flows and Scenarios

### Flow 1: Help Access and Support Flow

**Entry point:** User clicks Help dropdown from any system screen

**Step-by-step actions:**
1. User accesses Help dropdown menu
2. System presents help options including general system help and context-sensitive help
3. User selects appropriate help option
4. System opens help screen with relevant content
5. Help content is filtered based on user's role and permissions
6. User navigates through help topics using menu or search
7. User can return to previous screen or navigate to different system area

**Decision points:**
- Current screen context determines which help topics are most relevant
- User role determines which help content is displayed

**Exit points:**
- User returns to previous screen after finding needed information
- User navigates to different system function from help guidance
- User contacts support using provided contact information

**Error/exception paths:**
- Help content unavailable: display message with alternative support options
- Navigation error: provide breadcrumb trail back to previous location

### Flow 2: Role-Based Feature Access Flow (Modifications)

> **Note:** FT-001a defines the base Flow 2 using role-level access only. When screen-level permissions (US-003) are implemented, the following modifications apply:

**Additional step:**
- Step 2 (FT-001a): "System queries user's role" becomes "System queries user's role **and screen-level permissions**"
- Step 7 (FT-001a): "Screen loads with role-appropriate interface (read-only or full edit)" becomes "Screen loads with role-appropriate interface (**read-only, restricted edit, or full edit**)"

**Additional decision point:**
- Screen-level permissions determine whether Data Entry users can access specific functions in editable or restricted mode

## 5. Data Model Additions

### Entities

| Entity     | Key Attributes                    | Description                                            |
|------------|-----------------------------------|--------------------------------------------------------|
| data_entry | screen_name, user_id, can_write   | Screen-level permissions for Data Entry users          |

### Data Relationships

- **user → data_entry:** One-to-many relationship where each Data Entry user has multiple screen-level permissions configured

## 6. Business Rules

| Rule ID | Rule Description                                                    | Applies To               | Validation Behaviour                                                                            |
| ------- | ------------------------------------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------- |
| BR-001  | Screen-level permissions control data modification capabilities     | Individual screen access | Query data_entry for screen permissions; disable controls if can_write is "S" (restricted)      |
| BR-002  | Role-specific help content must be displayed                        | Help system access       | Filter help topics and content based on user role permissions                                   |
| BR-003  | System announcements are displayed to all authenticated users       | Home page display        | Show current announcements to all users regardless of role                                      |

## 7. UI/Layout Modifications

### Home Page Additions
- Add "[Help ▼]" dropdown to header region (right-aligned)
- Add system announcements panel below navigation panels

### Help System Page

- **Purpose:** Comprehensive help documentation and user guidance
- **Navigation context:** Accessible via Help dropdown from any screen
- **Layout:** Two-panel layout with topic menu on left, content on right
- **Components:**
  - **Topic menu panel:** List of help topics appropriate to user role
  - **Content panel:** Detailed help content with screenshots and step-by-step instructions
  - **Breadcrumb navigation:** Shows current help topic location
  - **Search functionality:** Text input for searching help content
  - **"Return to [Previous Page]" button:** Context-aware return navigation

**Context-sensitive help:**
- Opens to specific help topic based on current screen
- Highlights relevant sections for current user role
- Provides direct links to related functions

### Other New Pages
- Contact Support page (BST support team email and phone number)
- Audit Log Viewer page (Supervisor only)

## 8. Business Dependencies

| Dependency                    | Owner              | Description                                                                          | Status  |
|-------------------------------|--------------------|--------------------------------------------------------------------------------------|---------|
| data_entry table setup        | Database Administrator | Screen-level permission records must be configured in data_entry table            | Pending |
| Help content creation         | Business Analyst       | System help documentation must be written and reviewed                            | Pending |

## 9. Key Assumptions

| # | Assumption                                                                                                              | Risk if Invalid                                                              |
|---|-------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------|
| 1 | Help content can be maintained by business users rather than technical staff                                            | Would require ongoing technical resources for help system updates             |
| 2 | Downstream feature screens are available for screen-level permissions and context-sensitive help to be meaningful       | These enhancements would have limited value without downstream features       |

## 10. Effort Estimate

| Dimension        | Estimate      | Assumptions                                                                                                  |
| ---------------- | ------------- | ------------------------------------------------------------------------------------------------------------ |
| **Human Effort** | 5 person-days | Assumes FT-001a shell is in place; help content provided by business analyst; standard UI components reused  |

## 11. Definition of Done

This feature is considered done when all of the following are satisfied:

- [ ] All user stories are implemented and pass their acceptance criteria
- [ ] All test scenarios have been met
- [ ] Shell modifications integrate cleanly with FT-001a
- [ ] All business rules are enforced and validated
- [ ] Data model additions are implemented
- [ ] Feature has been reviewed and accepted by the product owner
- [ ] Feature has been demonstrated to stakeholders

## 12. Glossary

| Term                          | Definition                                                                                                                |
|-------------------------------|---------------------------------------------------------------------------------------------------------------------------|
| **Screen-level permissions**  | Fine-grained access controls that determine whether specific screens or functions are editable by Data Entry users        |
| **Context-sensitive help**    | Help content that automatically opens to the relevant topic based on the screen the user is currently viewing             |
| **System announcements**      | Administrative messages displayed to all authenticated users on the home page                                            |
