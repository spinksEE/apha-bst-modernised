# FT-006: User & Access Management

## Metadata

| Field                   | Value                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Feature ID**          | FT-006                                                                                                                         |
| **Upstream Features**   | FT-001                                                                                                                         |
| **Downstream Features** | FT-002, FT-003, FT-004, FT-005                                                                                                |
| **Feature Name**        | User & Access Management                                                                                                       |
| **Owner**               | APHA Supervisor                                                                                                                |
| **Priority**            | Must                                                                                                                           |
| **Last Updated**        | 2026-03-31                                                                                                                     |
| **PRD Reference**       | System Administration bounded context, User Access Management workflow, Roles & Permissions                                   |
| **Open Questions**      | 3                                                                                                                              |

---

## 1. Problem Statement

The BST system requires robust user access management to ensure appropriate security controls and role-based permissions for APHA staff accessing brainstem training records. The legacy system lacks granular permission controls and has security weaknesses including no session timeout and reliance solely on application-layer access control. Users need clearly defined roles that restrict functionality based on their responsibilities whilst maintaining comprehensive audit trails for compliance.

## 2. Benefit Hypothesis

We believe that implementing comprehensive user and access management will result in improved security posture and appropriate access controls for APHA staff accessing the brainstem training system. We will know this is true when all users operate within their designated permission levels, administrative overhead for user management is reduced, and audit trails provide complete visibility of system access and changes.

## 3. Target Users and Personas

| Persona | Role Description | Relationship to Feature | Usage Frequency |
|---------|-----------------|------------------------|-----------------|
| APHA Supervisor | Senior APHA staff with full system administration rights | Primary | Daily |
| System Administrator | Technical staff maintaining system infrastructure | Primary | Weekly |
| APHA Data Entry User | APHA staff with restricted access based on screen-level permissions | Secondary | Daily |
| APHA Read-Only User | APHA staff requiring view access for enquiries and reporting | Secondary | Weekly |

Administrative users will use this feature to manage team access, whilst operational users will be subject to the access controls it enforces.

## 4. User Goals and Success Criteria

| #   | User Goal                                    | Success Criterion                                                 |
| --- | -------------------------------------------- | ----------------------------------------------------------------- |
| 1   | Create user accounts for new APHA staff     | New user can log in with appropriate role permissions within 1 working day |
| 2   | Modify user permissions for role changes    | User permission changes take effect immediately upon save |
| 3   | Remove access for departing staff           | Deactivated users cannot access system within 1 hour of deactivation |
| 4   | Monitor system access for compliance        | All user actions are logged with complete audit trail |
| 5   | Ensure appropriate role-based restrictions  | Users can only perform actions permitted by their assigned role |

## 5. Scope and Boundaries

### In Scope

- User account creation, modification, and deactivation
- Role assignment and management (Read Only, Data Entry, Supervisor)
- Location-based user assignment to APHA facilities
- Audit trail recording and viewing for user management actions
- Role-based access enforcement across all system screens
- User listing and search functionality
- Integration with Windows domain authentication

### Out of Scope

- Password management (delegated to Windows domain authentication)
- Multi-factor authentication implementation (platform-level concern)
- User self-service capabilities (administrative function only)
- External user access (system is internal to APHA only)
- Detailed screen-level permission configuration (covered by FT-002 through FT-005)

### Boundaries

- Integrates with Windows Active Directory for authentication
- Provides user context to all other system features for permission enforcement
- Audit trail feeds into broader system monitoring and compliance reporting
- User location assignment links to site and personnel management features

## 6. User Stories and Acceptance Criteria

### US-056: Create new user account

**Story:** As an APHA Supervisor, I want to create user accounts for new team members, so that they can access the BST system with appropriate permissions for their role.

**Priority:** Must

**Wireframes:**

```
┌─────────────────────────────────────────────────────────────────┐
│ BST - Brainstem Sampling Training System           │ User Menu ▼│
├─────────────────────────────────────────────────────────────────┤
│ Home │ Training │ Personnel │ Sites │ Reports │ Admin         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ╔═══════════════════════════════════════════════════════════════╗ │
│ ║                     Add New User                              ║ │
│ ╠═══════════════════════════════════════════════════════════════╣ │
│ ║                                                               ║ │
│ ║ User Details                                                  ║ │
│ ║                                                               ║ │
│ ║ User ID (*): |  DOMAIN\username          | [1]               ║ │
│ ║                                                               ║ │
│ ║ Display Name (*): |  John Smith           |                   ║ │
│ ║                                                               ║ │
│ ║ Location (*): ┌─────────────────────────┐▼ [2]               ║ │
│ ║               │ Select APHA Location... │                    ║ │
│ ║               └─────────────────────────┘                    ║ │
│ ║                                                               ║ │
│ ║ User Level (*): ( ) Read Only                                 ║ │
│ ║                 ( ) Data Entry        [3]                    ║ │
│ ║                 ( ) Supervisor                               ║ │
│ ║                                                               ║ │
│ ║                                                               ║ │
│ ║               [ Create User ] [ Cancel ]     [4][5]          ║ │
│ ║                                                               ║ │
│ ╚═══════════════════════════════════════════════════════════════╝ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

[1] Windows domain format validation
[2] Dropdown populated from APHALocation table
[3] Radio button selection for role assignment
[4] Primary action button
[5] Secondary action button

**Acceptance Criteria:**

```gherkin
Scenario: Create valid new user
  Given I am logged in as a Supervisor
  And I am on the Add User page
  When I enter valid user details including Windows domain format User ID
  And I select an APHA location from the dropdown
  And I select a user level
  And I click Create User
  Then the user account is created successfully
  And I receive confirmation "User account created successfully"
  And the new user appears in the user management list

Scenario: Validation prevents invalid User ID format
  Given I am on the Add User page
  When I enter a User ID not in DOMAIN\username format
  And I attempt to create the user
  Then I see validation error "User ID must be in format DOMAIN\username"
  And the user account is not created

Scenario: All required fields must be completed
  Given I am on the Add User page
  When I leave any required field empty
  And I attempt to create the user
  Then I see validation error for the missing required field
  And the user account is not created
```

### US-057: Modify existing user permissions

**Story:** As an APHA Supervisor, I want to modify existing user accounts and permissions, so that I can adjust access levels when staff roles change or they move locations.

**Priority:** Must

**Wireframes:**

```
╔═══════════════════════════════════════════════════════════════╗
║                     Edit User Account                        ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║ User Details                                                  ║
║                                                               ║
║ User ID: DOMAIN\jsmith (read-only)                           ║
║                                                               ║
║ Display Name (*): |  John Smith           |                   ║
║                                                               ║
║ Location (*): ┌─────────────────────────┐▼ [1]               ║
║               │ APHA Weybridge          │                    ║
║               └─────────────────────────┘                    ║
║                                                               ║
║ Current Level: Data Entry → New Level (*): [2]               ║
║                ( ) Read Only                                  ║
║                (•) Data Entry                                ║
║                ( ) Supervisor                                ║
║                                                               ║
║ ┌─────────────────────────────────────────────────────────┐   ║
║ │ ⚠️  Permission Change Warning                            │   ║
║ │ Changing user level will affect access permissions       │   ║
║ │ across all system functions. Continue?                   │   ║
║ └─────────────────────────────────────────────────────────┘   ║
║                                                               ║
║               [ Update User ] [ Cancel ]     [3][4]          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

[1] Location dropdown with current selection highlighted
[2] Role selection with current role indicated and warning for changes
[3] Primary update action
[4] Cancel action

**Acceptance Criteria:**

```gherkin
Scenario: Successfully update user location
  Given I am logged in as a Supervisor
  And I am editing an existing user account
  When I change the user's APHA location
  And I click Update User
  Then the user's location is updated in the system
  And I receive confirmation "User account updated successfully"
  And the change is recorded in the audit log

Scenario: Update user permission level
  Given I am editing an existing user account
  When I change the user level from Data Entry to Read Only
  And I confirm the permission change warning
  And I click Update User
  Then the user's permission level is changed immediately
  And the user's access is restricted to read-only permissions
  And the permission change is audited with timestamp and my user ID

Scenario: Prevent unauthorized permission elevation
  Given I am logged in as a Data Entry user
  When I attempt to access user management functions
  Then I am redirected to an unauthorized access page
  And the access attempt is logged in the audit trail
```

### US-058: View and search system users

**Story:** As an APHA Supervisor, I want to view a list of all system users and search for specific accounts, so that I can review current access levels and identify accounts that may need updating.

**Priority:** Must

**Wireframes:**

```
╔═══════════════════════════════════════════════════════════════╗
║                   User Management                             ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║ Search: |  search users...     | [🔍] [+ Add New User] [1][2] ║
║                                                               ║
║ Filter by Location: ┌─────────────┐▼  Level: ┌────────────┐▼  ║
║                     │ All Locations│        │ All Levels │   ║
║                     └─────────────┘         └────────────┘   ║
║                                                               ║
║ ┌─────────────────────────────────────────────────────────┐   ║
║ │ User ID          │ Display Name │ Location    │ Level    │   ║
║ ├─────────────────────────────────────────────────────────┤   ║
║ │ DOMAIN\asmith    │ Alice Smith  │ Weybridge   │ Supervisor│   ║
║ │ DOMAIN\bjones    │ Bob Jones    │ York        │ Data Entry│   ║
║ │ DOMAIN\cblack    │ Carol Black  │ Weybridge   │ Read Only │   ║
║ │ DOMAIN\dwhite    │ David White  │ Lasswade    │ Data Entry│   ║
║ │ DOMAIN\egreen    │ Emma Green   │ Penrith     │ Supervisor│   ║
║ └─────────────────────────────────────────────────────────┘   ║
║                                                               ║
║ [ Edit Selected ] [ Deactivate ] [ View Audit Log ]   [3][4][5]║
║                                                               ║
║ Showing 5 of 23 users                                        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

[1] Search functionality across user fields
[2] Add new user action button
[3] Edit selected user account
[4] Deactivate user access
[5] View audit log for user actions

**Acceptance Criteria:**

```gherkin
Scenario: View all system users
  Given I am logged in as a Supervisor
  And I am on the User Management page
  Then I can see a list of all active system users
  And each user shows User ID, Display Name, Location, and Level
  And users are sorted alphabetically by Display Name

Scenario: Search for specific user
  Given I am on the User Management page
  When I enter "smith" in the search box
  And I click the search button
  Then only users with "smith" in their User ID or Display Name are shown
  And the search results update in real-time

Scenario: Filter users by location and level
  Given I am on the User Management page
  When I select "Weybridge" from the location filter
  And I select "Data Entry" from the level filter
  Then only users from Weybridge with Data Entry level are displayed
  And the user count reflects the filtered results
```

### US-059: Deactivate user access

**Story:** As an APHA Supervisor, I want to deactivate user accounts for staff who have left or no longer require system access, so that I can maintain security and prevent unauthorized access.

**Priority:** Must

**Wireframes:**

```
╔═══════════════════════════════════════════════════════════════╗
║                  Deactivate User Account                     ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║ ⚠️  User Deactivation Confirmation                           ║
║                                                               ║
║ You are about to deactivate the following user:              ║
║                                                               ║
║ User ID: DOMAIN\bjones                                       ║
║ Display Name: Bob Jones                                      ║
║ Location: York                                               ║
║ Current Level: Data Entry                                    ║
║                                                               ║
║ ┌─────────────────────────────────────────────────────────┐   ║
║ │ ⚠️  Deactivation Impact                                  │   ║
║ │ • User will lose all system access immediately          │   ║
║ │ • Active sessions will be terminated                    │   ║
║ │ • User cannot be reactivated (new account required)     │   ║
║ │ • Action cannot be undone                               │   ║
║ └─────────────────────────────────────────────────────────┘   ║
║                                                               ║
║ Reason for deactivation:                                     ║
║ ( ) Staff departure                                          ║
║ ( ) Role change (new account required)                       ║
║ ( ) Security concern                                         ║
║ ( ) Other: |                           |                     ║
║                                                               ║
║               [ Deactivate User ] [ Cancel ]      [1][2]     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

[1] Confirmation action with warning styling
[2] Cancel action

**Acceptance Criteria:**

```gherkin
Scenario: Successfully deactivate user account
  Given I am logged in as a Supervisor
  And I select a user to deactivate
  When I confirm the deactivation with a valid reason
  And I click Deactivate User
  Then the user account is immediately deactivated
  And the user loses all system access
  And I receive confirmation "User account deactivated successfully"
  And the deactivation is recorded in the audit log with reason

Scenario: Require reason for deactivation
  Given I am on the deactivate user confirmation dialog
  When I attempt to deactivate without selecting a reason
  Then I see validation error "Please select a reason for deactivation"
  And the user account is not deactivated

Scenario: Prevent self-deactivation
  Given I am logged in as a Supervisor
  When I attempt to deactivate my own user account
  Then I see error message "Cannot deactivate your own account"
  And the deactivation is not permitted
```

### US-060: View audit log for user actions

**Story:** As an APHA Supervisor, I want to view audit logs of user management actions, so that I can monitor system access changes for compliance and security purposes.

**Priority:** Should

**Wireframes:**

```
╔═══════════════════════════════════════════════════════════════╗
║                     User Management Audit Log                ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║ Filter by:                                                    ║
║ Date Range: |2026-03-01| to |2026-03-31| [📅] [📅]          ║
║ Action: ┌──────────────┐▼  User: |search user...   | [🔍]    ║
║         │ All Actions  │                                      ║
║         └──────────────┘                                      ║
║                                                               ║
║ ┌─────────────────────────────────────────────────────────┐   ║
║ │Timestamp         │Action│Target User  │Performed By│Details│ ║
║ ├─────────────────────────────────────────────────────────┤   ║
║ │2026-03-31 14:30  │Create│DOMAIN\jdoe  │DOMAIN\asmith│New...│ ║
║ │2026-03-31 10:15  │Modify│DOMAIN\bjones│DOMAIN\asmith│Role..│ ║
║ │2026-03-30 16:45  │Deact │DOMAIN\cblack│DOMAIN\egreen│Staff.│ ║
║ │2026-03-30 09:20  │Login │DOMAIN\dwhite│N/A          │Succ..│ ║
║ │2026-03-29 15:30  │Failed│DOMAIN\xuser │N/A          │Auth..│ ║
║ └─────────────────────────────────────────────────────────┘   ║
║                                                               ║
║ [ Export to CSV ] [ View Details ] [ Refresh ]      [1][2][3] ║
║                                                               ║
║ Showing 50 of 156 audit entries                              ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

[1] Export audit log data
[2] View detailed information for selected entry
[3] Refresh audit log display

**Acceptance Criteria:**

```gherkin
Scenario: View recent audit log entries
  Given I am logged in as a Supervisor
  And I am on the Audit Log page
  Then I can see the most recent user management actions
  And each entry shows timestamp, action type, target user, performing user, and summary details
  And entries are sorted by timestamp descending

Scenario: Filter audit log by date range
  Given I am on the Audit Log page
  When I set a date range filter for the last 7 days
  And I apply the filter
  Then only audit entries within that date range are displayed
  And the entry count updates to reflect the filtered results

Scenario: Search audit log by user
  Given I am on the Audit Log page
  When I search for a specific user ID in the user filter
  Then I see all audit entries related to that user
  Including entries where they were the target or performer of actions
```

### US-061: Enforce role-based access control

**Story:** As the BST system, I want to enforce role-based access restrictions automatically, so that users can only perform actions permitted by their assigned role and unauthorized access is prevented.

**Priority:** Must

**Wireframes:**

```
╔═══════════════════════════════════════════════════════════════╗
║                    Unauthorized Access                       ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║                         🚫                                   ║
║                                                               ║
║                 Access Denied                                ║
║                                                               ║
║ You do not have permission to access this function.          ║
║                                                               ║
║ Your current access level: Read Only                         ║
║ Required access level: Data Entry or Supervisor              ║
║                                                               ║
║ If you believe you should have access to this function,      ║
║ please contact your supervisor.                              ║
║                                                               ║
║                                                               ║
║                    [ Return to Home ]              [1]       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

[1] Navigation back to authorized area

**Acceptance Criteria:**

```gherkin
Scenario: Read Only user cannot modify data
  Given I am logged in as a Read Only user
  When I navigate to any data entry screen
  Then all input controls are disabled
  And save/edit buttons are non-functional
  And I can view data but cannot modify any records

Scenario: Data Entry user restricted by screen permissions
  Given I am logged in as a Data Entry user
  And a screen has CanWrite permission set to restricted
  When I access that screen
  Then all controls are disabled similar to read-only access
  And I cannot modify data on that specific screen

Scenario: Unauthorized function access blocked
  Given I am logged in with insufficient permissions
  When I attempt to access a restricted function
  Then I am redirected to an unauthorized access page
  And the access attempt is logged in the audit trail
  And I see my current access level and required level
```

---

## 7. User Flows and Scenarios

### Flow 1: New User Onboarding

**Entry point**: APHA Supervisor receives request for new staff member system access

**Step-by-step actions**:
1. Supervisor logs into BST system with administrative privileges
2. Navigates to User Management from Admin menu
3. Clicks "Add New User" button
4. Enters Windows domain User ID, display name, and selects APHA location from dropdown
5. Assigns appropriate user level based on staff role (Read Only, Data Entry, or Supervisor)
6. Clicks "Create User" to submit the form
7. System validates input format and required fields
8. User account is created and confirmation message displayed
9. New user receives notification of account creation (manual process)
10. Supervisor verifies user can log in and access appropriate functions

**Decision points**:
- Which user level to assign based on job responsibilities
- Which APHA location to associate with the user
- Whether to create account immediately or defer pending additional approvals

**Exit points**:
- Successful account creation with user able to access system
- Validation failure requiring data correction
- Cancellation returning to user management list

**Error/exception paths**:
- Invalid User ID format prevents account creation
- Missing required fields block submission
- Duplicate User ID results in error message
- System connectivity issues prevent account creation

### Flow 2: Permission Change Management

**Entry point**: Staff role change, location transfer, or access review requirement

**Step-by-step actions**:
1. Supervisor accesses User Management page
2. Searches for or selects target user from the list
3. Clicks "Edit" to modify user account
4. Reviews current user details (location, permission level)
5. Updates location or user level as required
6. Confirms permission change warning if role is being modified
7. Clicks "Update User" to save changes
8. System immediately applies new permissions
9. Change is recorded in audit log with timestamp and supervisor identity
10. Affected user's active sessions are updated with new permissions

**Decision points**:
- Whether to change location, permission level, or both
- Confirmation of permission reduction warnings
- Timing of when changes should take effect

**Exit points**:
- Successful update with immediate permission changes
- Cancellation leaving existing permissions unchanged
- Validation error requiring correction

**Error/exception paths**:
- Insufficient permissions to modify the target user
- System error preventing update from being saved
- Network connectivity issues during update process

### Flow 3: Access Audit and Compliance

**Entry point**: Regular compliance review or security incident investigation

**Step-by-step actions**:
1. Supervisor accesses Audit Log from User Management
2. Sets appropriate date range filter for the review period
3. Applies additional filters by action type or specific user if needed
4. Reviews audit entries for unusual patterns or unauthorized access attempts
5. Exports audit data to CSV for external compliance reporting if required
6. Investigates any suspicious activities by viewing detailed information
7. Takes corrective action such as password reset or account deactivation if needed
8. Documents findings for compliance or security team

**Decision points**:
- What date range and filters to apply for the audit scope
- Whether specific entries require further investigation
- Whether to export data for external reporting
- What corrective actions are needed based on audit findings

**Exit points**:
- Successful audit review with no issues identified
- Completion of corrective actions for identified issues
- Escalation to security team for serious incidents

**Error/exception paths**:
- Audit log data unavailable due to system issues
- Export functionality fails due to data volume or system constraints
- Unable to take corrective action due to insufficient permissions

## 8. UI/Layout Specifications

### 8.1 User Management List Screen — Core Workflow

**Page title**: "User Management" with breadcrumb navigation: Home > Admin > User Management

**Layout structure**: Single-page application layout with header navigation, sidebar menu collapsed, main content area taking full width

**Main content area**:
- **Search and filter panel**: Horizontal layout at top with search textbox (placeholder: "Search users..."), location dropdown filter (all APHA locations plus "All Locations" option), user level dropdown filter (Read Only/Data Entry/Supervisor plus "All Levels" option), and "Add New User" primary action button aligned right
- **User list table**: Full-width sortable data table with columns for User ID (Windows domain format), Display Name, Location (APHA facility name), User Level (role badge with color coding), and Actions (Edit/Deactivate icon buttons)
- **Action buttons**: Below table with "Edit Selected", "Deactivate", and "View Audit Log" buttons, enabled only when user is selected
- **Pagination/results summary**: "Showing X of Y users" text at bottom left

**Interactive elements**:
- Search textbox with real-time filtering as user types
- Dropdown filters with instant application on selection change
- Table rows selectable with checkbox or click, highlighted when selected
- Sort indicators on column headers (ascending/descending arrows)
- Icon buttons for quick actions with tooltips on hover

**Responsive behaviour**: Table switches to card layout on mobile devices, filters stack vertically on tablet and below

### 8.2 Add/Edit User Form — Core Workflow

**Form structure**: Modal dialog or dedicated page with form sections grouped logically

**User Details section**:
- **User ID field**: Text input with format hint "DOMAIN\username", validation on blur, required field indicator (*)
- **Display Name field**: Text input, max 100 characters, required field indicator (*)
- **Location field**: Dropdown populated from APHALocation table, searchable, required field indicator (*)
- **User Level section**: Radio button group with three options (Read Only, Data Entry, Supervisor), required selection

**Form validation**:
- Real-time validation messages appear below each field on blur
- Submit button disabled until all required fields valid
- Error styling (red border) on invalid fields
- Success styling (green border) on valid fields

**Action buttons**:
- **Primary button**: "Create User" (add mode) or "Update User" (edit mode), full-width button style
- **Secondary button**: "Cancel", returns to user list without saving

**Permission change warning** (edit mode only):
- Warning panel displays when user level is changed from current value
- Orange/amber styling with warning icon
- Clear description of permission impact
- Requires acknowledgement before form submission

### 8.3 Audit Log Screen — Secondary Workflow

**Layout**: Full-width data table with filtering panel above

**Filter panel**:
- Date range selectors with calendar pickers
- Action type dropdown (Create, Modify, Deactivate, Login, Failed Login, etc.)
- User search textbox for target or performing user
- Apply/Clear filter buttons

**Audit table**:
- Columns: Timestamp (sortable), Action (icon + text), Target User, Performed By, Details (truncated with expand option)
- Row selection for bulk export operations
- Expandable rows show full audit entry details

**Actions**: Export to CSV button, View Details modal for selected entry, Refresh button to reload current data

## 9. Business Rules and Validation

| Rule ID | Rule Description                               | Applies To                                         | Validation Behaviour                                                          |
| ------- | ---------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------- |
| BR-015  | User ID must follow Windows domain format     | User creation and modification                     | Client-side validation with error message "User ID must be in format DOMAIN\username" |
| BR-016  | Display Name is required and limited to 100 characters | User creation and modification          | Required field validation and character count limiting with warning at 90 chars |
| BR-017  | User must be assigned to valid APHA location  | User creation and modification                     | Dropdown restricted to active APHALocation entries only |
| BR-018  | User Level must be one of three defined roles | User creation and modification                     | Radio button validation ensuring selection is made |
| BR-019  | Supervisors cannot deactivate their own account | User deactivation workflow                       | Server-side check with error "Cannot deactivate your own account" |
| BR-020  | Deactivation requires a documented reason     | User deactivation workflow                         | Required selection from predefined reasons or free text for "Other" |
| BR-021  | Only Supervisors can manage user accounts     | All user management functions                      | Permission check on page access with redirect to unauthorized page |
| BR-022  | All user management actions must be audited   | User creation, modification, deactivation         | Automatic audit log entry with timestamp, performing user, target user, and action details |
| BR-023  | Role-based screen access must be enforced     | All system screen access                           | Application-level permission checks with disabled controls for insufficient access |

## 10. Data Model and Requirements

### Entities

| Entity | Key Attributes | Description |
|--------|---------------|-------------|
| User | UserId (string), UserName (string), UserLocation (string), UserLevel (enum) | System user account with role-based permissions |
| APHALocation | LocationId (string), LocationName (string), IsAHVLA (boolean) | APHA facility or organisational unit for user assignment |
| AuditLog | LogId (int), Timestamp (datetime), Action (string), UserId (string), TargetUserId (string), Details (string) | Comprehensive audit trail for user management actions |

### Search Parameters

| Parameter | Type | Behaviour | Required |
|-----------|------|-----------|----------|
| Display Name | string | Partial match (contains) | No |
| User ID | string | Partial match (contains) | No |
| Location | string | Exact match from dropdown | No |
| User Level | enum | Exact match from dropdown | No |
| Date Range | datetime | Between start and end dates (audit log) | No |
| Action Type | string | Exact match from predefined list (audit log) | No |

### Data Relationships

- User → APHALocation: Many-to-one relationship where each user is assigned to exactly one APHA location
- AuditLog → User: Many-to-one relationship where each audit entry records the performing user (optional for system actions)
- AuditLog → User (Target): Many-to-one relationship where each audit entry may reference a target user for user management actions

## 11. Integration Points and External Dependencies

| System | Integration Type | Direction | Description | Criticality |
|--------|-----------------|-----------|-------------|-------------|
| Windows Active Directory | Authentication API | Inbound | Validates user credentials and domain membership for login | Required |
| Database Audit Trail | Database triggers | Bidirectional | Automatic logging of all data modification operations | Required |
| Session Management | Application service | Bidirectional | Manages user sessions and permission context across application | Required |

The system maintains compatibility with Windows domain authentication while providing application-level permission management and audit capabilities.

## 12. Non-Functional Requirements

| NFR ID  | Category                                                                    | Requirement                | Acceptance Threshold                       |
| ------- | --------------------------------------------------------------------------- | -------------------------- | ------------------------------------------ |
| NFR-006 | Security | User permission changes take effect immediately | Permission updates applied within 30 seconds |
| NFR-007 | Usability | User management interface supports efficient bulk operations | Bulk user updates complete within 2 minutes for up to 50 users |
| NFR-008 | Audit | All user management actions logged with complete context | 100% of user management operations recorded in audit trail |
| NFR-009 | Availability | User authentication must remain available during system maintenance | 99.5% availability for authentication functions |

## 13. Legacy Pain Points and Proposed Improvements

| # | Legacy Pain Point | Impact | Proposed Improvement | Rationale |
|---|------------------|--------|---------------------|-----------|
| 1 | No row-level security implementation | Security risk with reliance on application-layer controls only | Implement database-level security policies with row-level permissions | Provides defence-in-depth security approach reducing risk of data exposure |
| 2 | No session timeout controls for idle users | Security vulnerability allowing unauthorized access to unattended systems | Implement configurable session timeout with warning before auto-logout | Reduces risk of unauthorized access whilst maintaining user productivity |
| 3 | Limited granular permission control | All-or-nothing access leading to over-privileged users | Implement fine-grained permissions with role templates and customization | Provides principle of least privilege while maintaining operational efficiency |
| 4 | Manual user account management process | Administrative overhead and delays in providing system access | Streamlined user management interface with bulk operations capability | Reduces administrative burden and improves staff onboarding time |

## 14. Internal System Dependencies

| Dependency | Type | Description | Impact if Unavailable |
|------------|------|-------------|----------------------|
| FT-001 System Foundation | Blocks | Core system infrastructure including database schema and authentication framework | Cannot implement user management without foundational system components |
| Application Security Framework | Shared | Role-based access control enforcement across all system features | User permissions cannot be enforced without integrated security framework |
| Audit Logging Service | Shared | Centralized audit trail functionality for compliance and monitoring | User management actions cannot be properly tracked for compliance requirements |

## 15. Business Dependencies

| Dependency                                                        | Owner                        | Description              | Status                             |
| ----------------------------------------------------------------- | ---------------------------- | ------------------------ | ---------------------------------- |
| APHA organizational structure mapping | APHA HR Department | Current list of APHA locations and reporting structure | Pending |
| Windows domain integration approval | APHA IT Security Team | Authentication mechanism and domain trust configuration | In Progress |
| User role definitions and permissions matrix | APHA Business Users | Detailed specification of what each role can access | Pending |

## 16. Key Assumptions

| # | Assumption | Risk if Invalid |
|---|-----------|-----------------|
| 1 | Windows Active Directory integration will remain the primary authentication method | Would require alternative authentication mechanism implementation |
| 2 | Current three-tier role model (Read Only, Data Entry, Supervisor) is sufficient | May need to redesign permission model with additional granularity |
| 3 | APHA location list is relatively stable with infrequent changes | Frequent location changes would require dynamic location management features |
| 4 | User management will remain a Supervisor-only function | Would need to implement delegated administration capabilities |

## 17. Success Metrics and KPIs

| Metric                                        | Baseline (Legacy)                      | Target (New System)           | Measurement Method          |
| --------------------------------------------- | -------------------------------------- | ----------------------------- | --------------------------- |
| Time to create new user account | Manual process, 2-4 working days | Under 5 minutes | System timestamp tracking |
| User permission change implementation time | Manual intervention required, hours to days | Immediate (under 1 minute) | System audit log analysis |
| Security audit compliance | Manual audit process, quarterly | Automated audit trail, real-time | Audit log completeness monitoring |
| User management administrative effort | Estimated 2-4 hours per week | Under 30 minutes per week | Time tracking by administrators |

## 18. Effort Estimate

| Dimension        | Estimate       | Assumptions                                |
| ---------------- | -------------- | ------------------------------------------ |
| **Human Effort** | 15 person-days  | Assumes Windows AD integration libraries available, database schema design complete, UI framework established |

## 19. Open Questions

| # | Question | Context | Impact | Raised By | Status |
|---|----------|---------|--------|-----------|--------|
| 1 | Which specific screens should have restricted access for Data Entry users via tblDataEntry configuration? | PRD Open Question 7 - screen-level permissions data not available | Cannot implement granular Data Entry permissions without this specification | Agent | Open |
| 2 | What is the required audit log retention period for compliance purposes? | Business rule BR-014 mentions audit trail maintenance but not retention policy | Storage planning and compliance requirements cannot be determined | Agent | Open |
| 3 | Should user accounts support temporary deactivation (suspension) or only permanent deactivation? | User management workflow shows deactivation but not reactivation capability | Affects whether accounts can be restored or must be recreated after deactivation | Agent | Open |

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
| **User Level** | The role-based permission tier assigned to a system user (Read Only, Data Entry, or Supervisor) determining their access capabilities |
| **APHA Location** | A physical or organizational unit within APHA where users are assigned, such as Weybridge, York, or Lasswade |
| **Audit Trail** | Comprehensive log of all system actions including user management operations, data modifications, and access attempts for compliance and security monitoring |
| **Windows Domain Format** | The standard format for Windows user identification in the form DOMAIN\username, required for integration with Active Directory authentication |
| **Screen-level Permissions** | Granular access control mechanism that restricts Data Entry users from modifying data on specific system screens based on tblDataEntry configuration |