# FT-001: Application Shell & Authentication

## Metadata

| Field                   | Value                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Feature ID**          | FT-001                                                                                                                         |
| **Upstream Features**   | None                                                                                                                           |
| **Downstream Features** | FT-002, FT-003, FT-004, FT-005, FT-006                                                                                        |
| **Feature Name**        | Application Shell & Authentication                                                                                             |
| **Owner**               | System Administrator                                                                                                           |
| **Priority**            | Must                                                                                                                           |
| **Last Updated**        | 2026-03-31                                                                                                                     |
| **PRD Reference**       | Section 10 — Roles & Permissions; System Administration bounded context (authentication)  |
| **Open Questions**      | 4                                                                                                                              |

---

## 1. Problem Statement

Users need role-based access to the BST system with a consistent navigation experience. The system maintains role-based permissions that control what functionality each user can access. Without a proper authentication foundation and navigation shell, users cannot access system features or efficiently navigate between different functional areas.

> **POC Note:** This feature uses a naive username/password login form rather than an external identity provider. Authentication is intentionally simplified for proof-of-concept purposes and would be replaced with an appropriate enterprise authentication mechanism (e.g. Azure AD, Windows Authentication) before production.

## 2. Benefit Hypothesis

We believe that providing an authentication system with role-based access control and intuitive navigation will result in streamlined user access for APHA staff. We will know this is true when users can authenticate via a login form, access only the functionality appropriate to their role, and navigate efficiently between system areas without confusion.

## 3. Target Users and Personas

| Persona | Role Description | Relationship to Feature | Usage Frequency |
|---------|-----------------|------------------------|-----------------|
| APHA Supervisor | Senior APHA staff with full system administration rights | Primary | Daily |
| APHA Data Entry User | APHA operational staff with restricted editing capabilities | Primary | Daily |
| APHA Read-Only User | APHA staff requiring view access for enquiries and compliance | Primary | Weekly |
| System Administrator | Technical staff maintaining system infrastructure | Secondary | Ad-hoc |

All users require authentication and navigation capabilities to access any system functionality. Different roles determine the level of access granted after authentication.

## 4. User Goals and Success Criteria

| #   | User Goal                                    | Success Criterion                                                 |
| --- | -------------------------------------------- | ----------------------------------------------------------------- |
| 1   | Access the system using login credentials | User logs in via a simple login form with username and password |
| 2   | Navigate to system functions efficiently | User can reach any permitted function within 3 clicks from home page |
| 3   | Understand their access level and restrictions | User interface clearly indicates their role and available functions |
| 4   | Get help when needed | User can access contextual help and system documentation |
| 5   | Maintain session throughout work | System tracks user activity and maintains session |

## 5. Scope and Boundaries

### In Scope

- Naive login form authentication (username/password)
- Home page serving as central navigation hub
- Role-based access control system (Supervisor, Data Entry, Read-Only)
- User session management and identity tracking
- Help system providing user guidance and documentation
- Application shell framework (header, navigation, content areas)
- Basic audit logging for authentication and access events
- Unauthorised access handling and redirection
- User context display (name, role, location)

### Out of Scope

- News system functionality — marked as unused and redundant in legacy analysis
- Detailed business function implementations — covered by downstream features FT-002 through FT-006
- Complex reporting functionality — covered by separate reporting feature
- Database user management interfaces — handled by System Administrator outside application
- Advanced audit reporting — basic logging only, detailed reporting is separate feature

### Boundaries

- Authentication hands off to downstream features once user session is established
- Role permissions are enforced at the application shell level, with specific business rules enforced by individual features
- Audit trail creation is initiated here but detailed audit analysis is handled by separate features
- Authentication is a naive POC implementation; production would use an enterprise identity provider

## 6. User Stories and Acceptance Criteria

### US-001: User Authentication via Login Form

**Story:** As an APHA staff member, I want to authenticate using a login form, so that I can access the BST system.

**Priority:** Must

**Wireframes:**

```
┌─────────────────────────────────────────────────────────────────┐
│ BST System - Login                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ╔════════════════════════════════════════════════════════════╗ │
│  ║                    Log In                                  ║ │
│  ║                                                            ║ │
│  ║  Username: |                          | [1]                ║ │
│  ║  Password: |                          | [2]                ║ │
│  ║                                                            ║ │
│  ║                     [ Log In ]  [3]                        ║ │
│  ║                                                            ║ │
│  ║  (Invalid username or password) [4]                        ║ │
│  ║                                                            ║ │
│  ╚════════════════════════════════════════════════════════════╝ │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ APHA BST System © 2026                                          │
└─────────────────────────────────────────────────────────────────┘
```

[1] Username text input
[2] Password text input
[3] Log In button - submits credentials
[4] Error message - shown only after a failed login attempt

**Alternative state - Unauthorised Access:**
When authentication succeeds but user lacks system permissions, display unauthorised access message with contact information for system administrator.

**Acceptance Criteria:**

```gherkin
Scenario: Successful login
  Given I have valid BST system credentials
  When I submit my username and password on the login form
  Then I am authenticated and redirected to the home page
  And my user identity is established in the system session

Scenario: Failed login
  Given I enter an invalid username or password
  When I submit the login form
  Then I see an error message indicating invalid credentials
  And system access is denied until authentication succeeds

Scenario: Unauthorised User Access
  Given I am authenticated
  But I do not have BST system permissions configured
  When I attempt to access the system
  Then I am redirected to an unauthorised access page
  And I am provided with contact information for access requests
```

### US-002: Home Page Navigation Hub

**Story:** As an authenticated user, I want to access system functions from a central home page, so that I can efficiently navigate to the features I need for my work.

**Priority:** Must

**Wireframes:**

```
┌─────────────────────────────────────────────────────────────────┐
│ BST System - Home                                      [Help ▼] │
├─────────────────────────────────────────────────────────────────┤
│ ╔═════════════════════════════════════════════════════════════╗ │
│ ║ Welcome: John Smith (Supervisor) - Preston Laboratory       ║ │
│ ╚═════════════════════════════════════════════════════════════╝ │
│                                                                 │
│ ┌─────────────────────┐  ┌─────────────────────┐                │
│ │ Training Records ▼  │  │ Site Management ▼   │                │
│ │ [1]                 │  │ [2]                 │                │
│ └─────────────────────┘  └─────────────────────┘                │
│                                                                 │
│ ┌─────────────────────┐  ┌─────────────────────┐                │
│ │ Personnel Mgmt ▼    │  │ Reports ▼           │                │
│ │ [3]                 │  │ [4]                 │                │
│ └─────────────────────┘  └─────────────────────┘                │
│                                                                 │
│ ┌─────────────────────┐                                         │
│ │ User Management ▼   │  (Supervisor access only)               │
│ │ [5]                 │                                         │
│ └─────────────────────┘                                         │
│                                                                 │
│ ╔═════════════════════════════════════════════════════════════╗ │
│ ║ System Announcements                                        ║ │
│ ║ • System maintenance scheduled for Sunday 2nd April         ║ │
│ ║ • New training guidance available in Help section           ║ │
│ ╚═════════════════════════════════════════════════════════════╝ │
├─────────────────────────────────────────────────────────────────┤
│ APHA BST System © 2026                                          │
└─────────────────────────────────────────────────────────────────┘
```

[1] Training Records dropdown - access training management functions
[2] Site Management dropdown - access site and location functions
[3] Personnel Management dropdown - access trainee/trainer functions
[4] Reports dropdown - access reporting functions
[5] User Management dropdown - admin functions (Supervisor only)

**Data Entry User view:** User Management dropdown is hidden. All other dropdowns present but contain only permitted functions.

**Read-Only User view:** All dropdowns present but functions are view-only with no editing capabilities indicated.

**Acceptance Criteria:**

```gherkin
Scenario: Home page displays user context
  Given I am authenticated as "John Smith" with "Supervisor" role
  And my assigned location is "Preston Laboratory"
  When I access the home page
  Then I see my name displayed as "John Smith (Supervisor)"
  And I see my location displayed as "Preston Laboratory"
  And the page title shows "BST System - Home"

Scenario: Navigation dropdowns show role-appropriate functions
  Given I am authenticated with "Supervisor" role
  When I view the home page
  Then I see Training Records, Site Management, Personnel Management, Reports, and User Management dropdown menus
  And each dropdown contains functions appropriate to Supervisor permissions

Scenario: System announcements display
  Given I am on the home page
  When system announcements are configured
  Then I see the announcements in a dedicated panel
  And announcements display in chronological order with most recent first
```

### US-003: Role-Based Access Control Enforcement

**Story:** As a system user, I want the system to enforce my role permissions consistently, so that I can only access and modify data appropriate to my responsibility level.

**Priority:** Must

**Wireframes:**

```
╔═══════════════════════════════════════════════════════════════════╗
║ Training Records - Read Only Access                               ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║ ┌─────────────────────────────────────────────────────────────┐   ║
║ │ Training Record Details                                     │   ║
║ │                                                             │   ║
║ │ Trainee: |     Jane Wilson      | (disabled) [1]            │   ║
║ │ Trainer: |     Bob Smith        | (disabled) [2]            │   ║
║ │ Species: |     Cattle      ▼    | (disabled) [3]            │   ║
║ │ Date:    |   15/03/2026         | (disabled) [4]            │   ║
║ │                                                             │   ║
║ │ Training Type: ( • ) Trained                                │   ║
║ │                ( o ) Cascade Trained (disabled)             │   ║
║ │                ( o ) Training Confirmed (disabled)          │   ║
║ │                                                             │   ║
║ │ Comments: |  Initial cattle training completed at site      │   ║
║ │           |  (disabled)                              [5]    │   ║
║ │                                                             │   ║
║ └─────────────────────────────────────────────────────────────┘   ║
║                                                                   ║
║ Note: You have read-only access to this record                    ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

[1] Trainee field - disabled for read-only access
[2] Trainer field - disabled for read-only access
[3] Species dropdown - disabled for read-only access
[4] Date field - disabled for read-only access
[5] Comments field - disabled for read-only access

**Data Entry view:** Fields would be enabled based on screen-level permissions configured in tblDataEntry table.

**Supervisor view:** All fields enabled for full editing capabilities.

**Acceptance Criteria:**

```gherkin
Scenario: Read-Only user access enforcement
  Given I am authenticated with "Read-Only" role
  When I access any system screen with data entry capabilities
  Then all input controls are disabled
  And I can view existing data but cannot modify any records
  And save/edit buttons are not displayed or are disabled
  And I see a message indicating my access level

Scenario: Data Entry user screen-level permissions
  Given I am authenticated with "Data Entry" role
  And a screen has "CanWrite" permission set to "S" (restricted) for my user
  When I access that specific screen
  Then all controls are disabled similar to read-only access
  And I cannot modify data on this particular screen
  And other screens with appropriate permissions remain editable

Scenario: Supervisor full access
  Given I am authenticated with "Supervisor" role
  When I access any system screen
  Then all functions are available and enabled
  And I can create, read, update, and delete records
  And administrative functions are accessible
```

### US-004: Help System Access

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
│ ║ [Screenshot: Home Page Navigation]                          ║ │
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

**Acceptance Criteria:**

```gherkin
Scenario: General help access from home page
  Given I am on the home page
  When I click the Help dropdown menu
  Then I see options to access different help topics
  And I can select "System Help" to view the main help page
  And the help page displays topics relevant to my role

Scenario: Context-sensitive help access
  Given I am on the Training Records screen
  When I access help from the Help dropdown
  Then the help system opens to the Training Records Management section
  And I see guidance specific to the current screen functionality

Scenario: Role-appropriate help content
  Given I am authenticated with "Data Entry" role
  When I access the help system
  Then I see help topics for functions available to my role
  And User Management help topics are not displayed
  And my access level is clearly indicated in the help content
```

### US-005: Session Management and User Context

**Story:** As an authenticated user, I want the system to maintain my session and user context consistently, so that I don't lose my work or have to re-authenticate frequently during normal system use.

**Priority:** Must

**Wireframes:**

```
┌─────────────────────────────────────────────────────────────────┐
│ BST System - Training Records             Welcome: John Smith   │
├─────────────────────────────────────────────────────────────────┤
│ Home > Training Records > Add New Record                        │
│                                                                 │
│ ╔═════════════════════════════════════════════════════════════╗ │
│ ║ Session Status: Active (2 hours 15 minutes)           [1]   ║ │
│ ║ Last Activity: 14:23                                        ║ │
│ ╚═════════════════════════════════════════════════════════════╝ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ New Training Record                                         │ │
│ │                                                             │ │
│ │ Trainee: |                    | [2]                         │ │
│ │ Trainer: |    John Smith      | (auto-populated) [3]        │ │
│ │ Species: |          ▼         | [4]                         │ │
│ │ Date:    |   31/03/2026       | (today) [5]                 │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ User: John Smith | Role: Supervisor | Location: Preston Lab     │
└─────────────────────────────────────────────────────────────────┘
```

[1] Session indicator - shows active session time and last activity
[2] Trainee field - normal data entry
[3] Trainer field - auto-populated with current user context
[4] Species dropdown - available options
[5] Date field - defaults to current date

**Session timeout warning:** Modal dialog appears 10 minutes before session expiry warning user and providing option to extend session.

**Acceptance Criteria:**

```gherkin
Scenario: User context maintained across screens
  Given I am authenticated as "John Smith" with "Supervisor" role at "Preston Laboratory"
  When I navigate between different system screens
  Then my user context (name, role, location) is consistently displayed
  And system functions remain appropriate to my role
  And my identity is tracked for audit logging purposes

Scenario: Session activity tracking
  Given I have an active system session
  When I interact with system forms and screens
  Then my last activity time is updated automatically
  And my session remains active without re-authentication
  And audit logs capture my activities with proper user identification

Scenario: Auto-population of user context in forms
  Given I am creating a new training record
  And I am configured as a qualified trainer
  When I access the new training record form
  Then the Trainer field is automatically populated with my name
  And the training date defaults to today's date
  And my location context is available for site selection
```

### US-006: Audit Logging for Authentication Events

**Story:** As a system administrator, I want authentication and access events to be automatically logged, so that I can monitor system security and track user activity for compliance purposes.

**Priority:** Must

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

**Note:** This wireframe shows the administrative view for reviewing audit logs. The actual logging happens automatically in the background.

**Acceptance Criteria:**

```gherkin
Scenario: Authentication event logging
  Given a user attempts to authenticate to the system
  When the authentication attempt occurs
  Then an audit log entry is created with user ID, timestamp, and result (success/failure)
  And for failed attempts, the reason for failure is logged
  And the log entry includes the user's IP address and session identifier

Scenario: Access event logging
  Given an authenticated user accesses a system screen or function
  When the access occurs
  Then an audit log entry is created with user ID, timestamp, accessed resource, and user's role
  And unauthorised access attempts are logged with appropriate severity
  And the log entry includes relevant context about the access attempt

Scenario: Session lifecycle logging
  Given a user session is established or terminated
  When login, logout, or session timeout occurs
  Then audit log entries capture the session lifecycle events
  And session duration and activity summary are recorded
  And abnormal session terminations are flagged appropriately
```

### US-007: Unauthorised Access Handling

**Story:** As a system administrator, I want unauthorised access attempts to be properly handled and logged, so that system security is maintained and potential security issues are identified promptly.

**Priority:** Should

**Wireframes:**

```
┌─────────────────────────────────────────────────────────────────┐
│ BST System - Access Denied                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ╔════════════════════════════════════════════════════════════╗ │
│  ║                    Access Denied                           ║ │
│  ║                                                            ║ │
│  ║  You do not have permission to access the Brainstem        ║ │
│  ║  Training System.                                          ║ │
│  ║                                                            ║ │
│  ║  Your access attempt has been logged and the system        ║ │
│  ║  administrator has been notified.                          ║ │
│  ║                                                            ║ │
│  ║  If you believe you should have access to this system,     ║ │
│  ║  please contact:                                           ║ │
│  ║                                                            ║ │
│  ║  Technical Support: bst-support@apha.gov.uk                ║ │
│  ║  Phone: 01234 567890                                       ║ │
│  ║                                                            ║ │
│  ║  Reference ID: UA-20260331-1423-001 [1]                    ║ │
│  ║                                                            ║ │
│  ║                     [ Return ]  [2]                        ║ │
│  ║                                                            ║ │
│  ╚════════════════════════════════════════════════════════════╝ │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ APHA BST System © 2026                                          │
└─────────────────────────────────────────────────────────────────┘
```

[1] Reference ID - unique identifier for this access attempt (for support tracking)
[2] Return button - redirects to organisation homepage or logout

**Background process:** Automatic email notification sent to technical support team with user details and access attempt information.

**Acceptance Criteria:**

```gherkin
Scenario: Unauthorised user redirection
  Given I am authenticated
  But I do not have BST system permissions configured in the database
  When I attempt to access any system page
  Then I am immediately redirected to the access denied page
  And I see a clear message explaining the access restriction
  And I am provided with contact information for requesting access

Scenario: Administrator notification of unauthorised access
  Given an unauthorised access attempt occurs
  When the system processes the access denial
  Then an automatic email notification is sent to the technical support team
  And the notification includes user identity, timestamp, attempted resource, and session details
  And a unique reference ID is generated for tracking purposes

Scenario: Unauthorised access audit logging
  Given an unauthorised access attempt is made
  When the access is denied
  Then a high-priority audit log entry is created
  And the log entry includes all relevant security context
  And the attempt is flagged for security monitoring and review
```

---

## 7. User Flows and Scenarios

### Flow 1: Primary Authentication and Home Access Flow

**Entry point:** User navigates to BST system URL from web browser

**Step-by-step actions:**
1. Browser requests BST system homepage
2. Unauthenticated user is redirected to login page
3. User enters username and password on login form
4. System validates credentials against User table in database
5. System checks user permissions in BST database (user table)
6. If authorised, system creates user session and redirects to home page
7. Home page displays with user context (name, role, location) and role-appropriate navigation options

**Decision points:**
- Authentication success/failure determines whether user proceeds or sees error on login form
- User permission check determines whether user reaches home page or access denied page
- User role determines which navigation options are displayed on home page

**Exit points:**
- Successful authentication leads to home page with full system access
- Failed authentication returns to login form with error message
- Unauthorised users are redirected to access denied page with support contact information

**Error/exception paths:**
- Database connectivity issues: show system maintenance page
- Invalid user permissions: redirect to access denied page and notify administrators

### Flow 2: Role-Based Feature Access Flow

**Entry point:** User clicks on navigation dropdown from home page

**Step-by-step actions:**
1. User selects dropdown menu (e.g., Training Records, Site Management)
2. System queries user's role and screen-level permissions
3. Dropdown displays only permitted functions for user's role
4. User selects specific function from dropdown
5. System validates access permissions for selected function
6. If permitted, user is directed to requested screen
7. Screen loads with role-appropriate interface (read-only, restricted edit, or full edit)

**Decision points:**
- User role determines which functions appear in dropdown menus
- Screen-level permissions determine whether user can access specific functions
- User permissions determine interface mode (read-only vs. editable)

**Exit points:**
- Permitted access leads to functional screen with appropriate interface mode
- Restricted access may show read-only version of screen
- Denied access redirects to unauthorised page

**Error/exception paths:**
- Permission check failure: redirect to unauthorised access page
- Screen loading error: display error message with option to return to home page

### Flow 3: Help Access and Support Flow

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

## 8. UI/Layout Specifications

### 8.1 Home Page — Core Navigation Workflow

**Page title and navigation context:** BST System - Home (primary landing page after authentication)

**Layout structure:**
- **Header region:** System title on left, user context and help dropdown on right
- **Main content area:** Welcome message with user details, navigation dropdown panels, system announcements
- **Footer region:** Copyright notice and system version information

**Header region components:**
- **System title:** "BST System" text, left-aligned, Arial 16pt bold
- **User context display:** "Welcome: [FirstName LastName] ([Role]) - [Location]" text, right-aligned
- **Help dropdown:** "[Help ▼]" button, right-aligned, opens help menu with "System Help" and "Contact Support" options

**Main content area components:**
- **Welcome panel:** Double-line border panel containing user greeting with full context
  - Content format: "Welcome: [FirstName LastName] ([Role]) - [Location]"
  - Background: light blue (#F0F8FF)
  - Text: Arial 12pt
- **Navigation panels:** Grid of dropdown panels arranged in 2x3 layout
  - **Training Records panel:** Button with "Training Records ▼" label, opens dropdown with training management functions
  - **Site Management panel:** Button with "Site Management ▼" label, opens dropdown with site functions
  - **Personnel Management panel:** Button with "Personnel Mgmt ▼" label, opens dropdown with personnel functions
  - **Reports panel:** Button with "Reports ▼" label, opens dropdown with reporting functions
  - **User Management panel:** Button with "User Management ▼" label (Supervisor only), opens admin functions
  - **Panel styling:** Raised button appearance, Arial 11pt, minimum 150px width, 40px height
- **System announcements panel:** Double-line border panel for administrative messages
  - Header: "System Announcements" in bold
  - Content: Bulleted list of current announcements
  - Maximum 5 announcements displayed
  - Background: light yellow (#FFFACD) for visibility

**Footer region:**
- Copyright text: "APHA BST System © 2026" centred, Arial 10pt grey text

**Interaction states:**
- **Dropdown hover:** Panel background changes to light blue, cursor changes to pointer
- **Dropdown active:** Panel depressed appearance, dropdown menu appears below
- **Loading state:** "Loading..." text appears in main content area
- **Empty announcements:** Announcements panel shows "No current system announcements"
- **Error state:** Replace content with error message and "Try Again" button

**Responsive behaviour:** Layout adapts to browser width, navigation panels stack vertically on narrow screens

### 8.2 Authentication Pages — Secondary Workflow

**Login page:**
- **Purpose:** Displayed to unauthenticated users
- **Navigation context:** Pre-authentication state, no system navigation available
- **Layout:** Centred login form on plain background
- **Components:**
  - Username and password input fields
  - "Log In" submit button
  - Error message area for failed login attempts
  - Corporate branding (APHA logo if available)

**Access Denied page:**
- **Purpose:** Displayed when authenticated user lacks system permissions
- **Navigation context:** Post-authentication but pre-authorisation
- **Components:**
  - Clear access denied message with explanation
  - Contact information for access requests (email and phone)
  - Unique reference ID for support tracking
  - "Return" button to exit system gracefully

### 8.3 Help System — Secondary Workflow

**Main Help page:**
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

## 9. Business Rules and Validation

| Rule ID | Rule Description                               | Applies To                                         | Validation Behaviour                                                          |
| ------- | ---------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------- |
| BR-001  | Login authentication is mandatory for all system access | All system entry points | If not authenticated, redirect to login page; if credentials invalid, show error message |
| BR-002  | Users must have valid BST permissions configured in database | User access validation | Check User table for valid record; if not found, redirect to access denied page |
| BR-003  | User role determines available navigation functions | Home page navigation dropdowns | Filter dropdown menu items based on user role; hide restricted functions |
| BR-004  | Screen-level permissions control data modification capabilities | Individual screen access | Query tblDataEntry for screen permissions; disable controls if CanWrite is "S" (restricted) |
| BR-005  | All authentication and access events must be logged | Authentication and authorisation processes | Create audit log entry for every login, logout, access grant, and access denial |
| BR-006  | Unauthorised access attempts trigger administrator notification | Access denial processing | Send automatic email to technical support team with user details and attempt context |
| BR-007  | User context must be maintained consistently across all screens | Session management | Display user name, role, and location consistently; track identity for audit logging |
| BR-008  | Session activity must be tracked for audit compliance | All user interactions | Update last activity timestamp and log significant user actions |
| BR-009  | Role-specific help content must be displayed | Help system access | Filter help topics and content based on user role permissions |
| BR-010  | System announcements are displayed to all authenticated users | Home page display | Show current announcements to all users regardless of role |

## 10. Data Model and Requirements

### Entities

| Entity | Key Attributes | Description |
|--------|---------------|-------------|
| User | UserId, UserName, UserLocation, UserLevel | System user with role-based access permissions |
| APHALocation | LocationId, LocationName, IsAHVLA | APHA facility or organisational unit |
| AuditLog | LogId, UserId, Timestamp, EventType, Details, IPAddress | System audit trail for security and compliance |
| DataEntry | ScreenName, UserId, CanWrite | Screen-level permissions for Data Entry users |

### Search Parameters

No search functionality is implemented within the authentication and navigation features. Search capabilities are delegated to individual functional features.

### Data Relationships

- **User → APHALocation:** Many-to-one relationship where each user is assigned to one APHA location
- **User → AuditLog:** One-to-many relationship where each user can have multiple audit log entries
- **User → DataEntry:** One-to-many relationship where each Data Entry user has multiple screen-level permissions configured
- **APHALocation:** Referenced by multiple entities across the system for location-based filtering and reporting

## 11. Integration Points and External Dependencies

| System | Integration Type | Direction | Description | Criticality |
|--------|-----------------|-----------|-------------|-------------|
| SMTP Mail Server | Email protocol | Outbound | Automatic notification emails for unauthorised access attempts and system errors | Required |
| SQL Server Database | Database connection | Bidirectional | User credential validation, permission validation, audit logging, and session management data storage | Required |

**SMTP Integration Details:**
- Configured for outbound notifications only
- Sends structured email alerts for security events
- Includes user identity, timestamp, and event context in notifications
- Critical for security monitoring and incident response

## 12. Non-Functional Requirements

| NFR ID  | Category                                                                    | Requirement                | Acceptance Threshold                       |
| ------- | --------------------------------------------------------------------------- | -------------------------- | ------------------------------------------ |
| NFR-001 | Usability | Login form should be simple and responsive | User can log in with username and password in a single step |
| NFR-002 | Performance | Home page load time | Page loads within 3 seconds for typical user scenarios |
| NFR-003 | Security | Session management | User sessions maintain security context and track activity |
| NFR-004 | Audit | Authentication event logging | All login/logout events logged with complete user context |
| NFR-005 | Availability | Authentication service uptime | 99% availability during business hours (8 AM - 6 PM weekdays) |
| NFR-006 | Accessibility | Screen reader compatibility | Navigation structure accessible via keyboard and screen readers |
| NFR-007 | Compliance | Audit trail retention | Authentication and access logs retained for minimum 7 years |
| NFR-008 | Security | Unauthorised access response | Access denials processed and logged within 2 seconds |

## 13. Legacy Pain Points and Proposed Improvements

| # | Legacy Pain Point | Impact | Proposed Improvement | Rationale |
|---|------------------|--------|---------------------|-----------|
| 1 | News system functionality present but completely unused and considered redundant | System maintenance overhead and unnecessary complexity | Remove news functionality entirely from new system | Eliminates unused code and simplifies interface |
| 2 | Some navigation elements (back to home buttons) do not function properly | User frustration and navigation confusion | Implement consistent navigation patterns with working breadcrumbs and return buttons | Improves user experience and reduces support calls |
| 3 | Database passwords stored in plain text configuration files | Security vulnerability exposing credentials | Use encrypted connection strings and environment-based configuration | Eliminates credential exposure risk |
| 4 | No session timeout controls implemented for idle users | Security risk from unattended sessions | Implement configurable session timeout with warning notifications | Reduces security risk while maintaining usability |
| 5 | Error notifications contain sensitive system information sent via unencrypted email | Information disclosure in error reports | Sanitise error notifications and use secure notification channels | Protects system information while maintaining monitoring capability |
| 6 | No row-level security implemented, relying entirely on application-layer access control | Potential for data access bypass | Maintain application-layer security with additional database-level validation | Provides defence-in-depth security approach |

## 14. Internal System Dependencies

| Dependency | Type | Description | Impact if Unavailable |
|------------|------|-------------|----------------------|
| SQL Server Database | Blocks | User credential validation, permission validation, audit logging, and session data storage | Complete system failure - no user access possible |
| Session State Management | Enhances | User context tracking across requests | Degraded experience - user context may be lost between screens |

## 15. Business Dependencies

| Dependency                                                        | Owner                        | Description              | Status                             |
| ----------------------------------------------------------------- | ---------------------------- | ------------------------ | ---------------------------------- |
| Database user credentials and permissions setup | Database Administrator | User credential and permission records must be configured in BST database User and DataEntry tables | Pending |
| SMTP server configuration | IT Infrastructure Team | Email server must be configured for automated notifications | Pending |
| Help content creation | Business Analyst | System help documentation must be written and reviewed | Pending |

## 16. Key Assumptions

| # | Assumption | Risk if Invalid |
|---|-----------|-----------------|
| 1 | User credentials are stored in the BST database for POC purposes | Production deployment would require migration to an enterprise identity provider |
| 2 | SMTP server is available and configured for automated notifications | Unauthorised access attempts would not trigger automatic alerts |
| 3 | User permission data can be migrated accurately from legacy system database | Would require manual reconfiguration of all user access rights |
| 4 | Business requirements for role-based access remain consistent with legacy system | Would require redesign of permission model and user interface |
| 5 | Help content can be maintained by business users rather than technical staff | Would require ongoing technical resources for help system updates |

## 17. Success Metrics and KPIs

| Metric                                        | Baseline (Legacy)                      | Target (New System)           | Measurement Method          |
| --------------------------------------------- | -------------------------------------- | ----------------------------- | --------------------------- |
| Authentication time | N/A (manual assessment) | Under 2 seconds for login submission | Page load time measurement |
| Home page load time | N/A (not measured) | Under 3 seconds | Browser performance monitoring |
| Unauthorised access incidents | Unknown (not tracked) | 100% logged and alerted | Audit log analysis |
| User navigation efficiency | Unknown (not measured) | Maximum 3 clicks to reach any function | User interaction tracking |
| Authentication-related support calls | Unknown baseline | Reduce through simple login flow | Support ticket analysis |
| Security incident response time | Manual notification only | Automated alerts within 2 minutes | Email delivery monitoring |

## 18. Effort Estimate

| Dimension        | Estimate       | Assumptions                                |
| ---------------- | -------------- | ------------------------------------------ |
| **Human Effort** | 15 person-days | Assumes straightforward database integration, standard web development patterns, and minimal custom security components required (POC uses naive login) |

## 19. Open Questions

| # | Question | Context | Impact | Raised By | Status |
|---|----------|---------|--------|-----------|--------|
| 1 | Should the unused news system functionality be completely removed or maintained for potential future use? | Legacy analysis shows news functionality is present but deprecated | Interface complexity and maintenance overhead | Agent | Open |
| 2 | What are the specific screen-level permission values in tblDataEntry table and how do they map to user interface behaviour? | BR-004 references CanWrite values but PRD doesn't specify the complete permission model | Cannot fully define Data Entry user interface restrictions | Agent | Open |
| 3 | What is the desired session timeout duration and warning period for idle users? | Legacy system has no timeout controls which creates security risk | Security policy compliance and user experience balance | Agent | Open |
| 4 | Are there specific corporate branding or visual design standards that must be applied to authentication and navigation interfaces? | PRD content focuses on functional requirements without visual design guidance | User interface consistency and corporate compliance | Agent | Open |

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
| **Naive login** | POC authentication mechanism using a simple username/password form validated against the database; would be replaced with an enterprise identity provider for production |
| **Role-based access control** | Security model where system access and functionality is determined by predefined user roles (Supervisor, Data Entry, Read-Only) |
| **Application shell** | The foundational user interface framework that provides consistent navigation, layout, and user context across all system screens |
| **Session management** | System capability to maintain user identity and context across multiple page requests during a single usage session |
| **Audit logging** | Automatic recording of user actions, system events, and security-relevant activities for compliance and security monitoring |
| **Screen-level permissions** | Fine-grained access controls that determine whether specific screens or functions are editable by Data Entry users |
