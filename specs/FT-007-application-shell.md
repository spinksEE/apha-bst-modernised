# FT-007: Application Shell

## Metadata

| Field                   | Value                                            |
| ----------------------- | ------------------------------------------------ |
| **Feature ID**          | FT-007                                           |
| **Upstream Features**   | FT-001, FT-002, FT-003, FT-005                   |
| **Downstream Features** | FT-004, FT-006                                   |
| **Feature Name**        | Application Shell                                |
| **Owner**               | System Administrator                             |
| **Priority**            | Must                                             |
| **Last Updated**        | 2026-04-08                                       |
| **PRD Reference**       | Key User Interfaces & Screens, Known Limitations |
| **Open Questions**      | 1                                                |

---

## 1. Problem Statement

The legacy Brainstem Training (BST) Database System suffers from significant user experience deficiencies in its core application shell. Users encounter a redundant news system, broken navigation elements (including non-functional home and back buttons), and an outdated Web Forms architecture causing ViewState bloat and degraded page load times. When unexpected errors occur, they are presented raw to the user, leaking sensitive technical details. These issues result in user confusion, navigational dead ends, and an unnecessarily slow interface.

## 2. Benefit Hypothesis

We believe that implementing a modern, lightweight application shell with streamlined navigation, a clear dashboard landing page, and graceful error presentation will result in a stable, performant, and intuitive working environment for APHA staff. We will know this is true when page load times consistently fall below 3 seconds, users report zero broken navigation paths, and unexpected errors display only safe, user-friendly messaging.

## 3. Target Users and Personas

| Persona              | Role Description                                             | Relationship to Feature | Usage Frequency |
| -------------------- | ------------------------------------------------------------ | ----------------------- | --------------- |
| APHA Supervisor      | Senior APHA staff with full system access                    | Primary                 | Daily           |
| APHA Data Entry User | APHA staff with restricted access based on permissions       | Primary                 | Daily           |
| APHA Read-Only User  | APHA staff requiring view access for enquiries and reporting | Primary                 | Daily           |

## 4. User Goals and Success Criteria

| #   | User Goal                                         | Success Criterion                                                                       |
| --- | ------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1   | Reach the system landing page                     | Navigate to global shell and home dashboard by default                                  |
| 2   | Navigate between core system functions            | All primary navigation links resolve to valid routes with no dead ends.                 |
| 3   | Understand unexpected errors without data leakage | Fatal errors present a clear, non-technical message with only a sanitised reference ID. |

## 5. Scope and Boundaries

### In Scope

- Global application wrapper including persistent header, horizontal navigation bar, and footer.
- Home Page Dashboard with a system announcements banner and quick-action navigation links.
- Hardcoded user context displaying a Supervisor identity in the header (authentication deferred to FT-006).
- User-facing generic error page with a unique error reference ID.
- Standard application routing ensuring no broken navigation paths.

### Out of Scope

- Windows Active Directory authentication and session management (deferred to FT-006).
- Role-Based Access Control enforcement and unauthorised access redirection (deferred to FT-006).
- Session inactivity timeout and warning modal (deferred to FT-006).
- Help documentation system (deferred to FT-006).
- SMTP error notification dispatch and sensitive data sanitisation logic (deferred to FT-006).
- Secure configuration management for connection strings (deferred to FT-006).
- All data entry and management screens (handled in FT-001 through FT-005).

### Boundaries

The Application Shell provides the visual frame and routing structure into which all other features inject their content. For the POC, user identity is hardcoded rather than derived from Active Directory. Navigation renders all menu items unconditionally (RBAC filtering deferred to FT-006).

## 6. User Stories and Acceptance Criteria

### US-071: Application Shell and Dashboard

**Story:** As an APHA staff member, I want to land on a clear home dashboard when I open the application, so that I can immediately orient myself and navigate to the function I need.

**Priority:** Must

**Wireframes:**

```text
+------------------------------------------------------------------+
|  [1] BST Database System            [2] Hello, Smith, J (Supv)   |
+------------------------------------------------------------------+
|  [3] Home | [4] Brainstem v | [5] Sites v                        |
+------------------------------------------------------------------+
|                                                                  |
|  +------------------------------------------------------------ + |
|  | [7] System Announcements                                    | |
|  | ----------------------------------------------------------- | |
|  | Welcome to the modernised Brainstem Training system.        | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  +-------------------------------------------------------------+ |
|  | [8] Quick Navigation                                        | |
|  | [ Go to Training Options ]    [ Go to Sites ]               | |
|  +-------------------------------------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
|  [9] APHA BST System v2.0 POC | Crown Copyright 2026             |
+------------------------------------------------------------------+
```
*Key:*
[1] Application title in the persistent global header.
[2] Hardcoded user identity display: first initial, surname, and role abbreviation.
[3] Home link — always returns the user to this dashboard.
[4] Brainstem dropdown — links to Training Management screens (FT-003).
[5] Sites dropdown — links to Site Management (FT-001) and Personnel Management (FT-002).
[7] Static system announcements banner replacing the redundant legacy News module.
[8] Quick-action cards linking to the primary workflows.
[9] Persistent footer with version and copyright.

**Acceptance Criteria:**

```gherkin
Scenario: Dashboard renders on application launch
  Given the application is running
  When a user navigates to the base application URL
  Then the Home Page dashboard is displayed
  And the header shows "Hello, Smith, J (Supv)" as the hardcoded user context
  And the navigation bar displays links for Home, Training and Sites
  And the system announcements banner is visible with a welcome message
  And the quick navigation section provides links to Training and Sites

Scenario: Navigation links resolve to valid routes
  Given I am on the Home Page dashboard
  When I click any primary navigation link or quick-action button
  Then I am routed to the corresponding feature screen
  And no navigation dead ends or broken back button behaviour occurs

Scenario: Footer is visible on all pages
  Given I am on any page within the application
  Then the footer region is visible at the bottom of the page
  And it displays the application version and copyright notice
```

### US-072: Global Navigation Structure

**Story:** As an APHA staff member, I want a consistent horizontal navigation bar across all screens, so that I can move between system functions without losing my orientation.

**Priority:** Must

**Wireframes:**

```text
+------------------------------------------------------------------+
|  BST Database System                     Hello, Smith, J (Supv)  |
+------------------------------------------------------------------+
|  Home | Brainstem v          | Sites v                            |
|        +-------------------+ +------------------+                |
|        | Add Training       | | View All Sites  |                |
|        | View Training      | | Add New Site    |                |
|        +--------------------+ +-----------------+                |
+------------------------------------------------------------------+
```

**Acceptance Criteria:**

```gherkin
Scenario: Navigation bar persists across pages
  Given I have navigated away from the Home Page
  When I am on any screen within the application
  Then the global header and navigation bar remain visible and functional

Scenario: Dropdown menus expand on interaction
  Given I am viewing the navigation bar
  When I hover over or click a dropdown menu item (e.g., "Training")
  Then a submenu expands showing the available child links
  And clicking a child link navigates me to that screen

Scenario: Home link returns to dashboard
  Given I am on any screen within the application
  When I click the "Home" link in the navigation bar
  Then I am returned to the Home Page dashboard
```

### US-073: Generic Application Error Page

**Story:** As an APHA staff member, I want the system to display a friendly error message when something goes wrong, so that I am not confused by technical details and can safely return to my work.

**Priority:** Must

**Wireframes:**

```text
+------------------------------------------------------------------+
|  BST Database System                     Hello, Smith, J (Supv)  |
+------------------------------------------------------------------+
|  Home | Brainstem v | Sites v                                    |
+------------------------------------------------------------------+
|                                                                  |
|  +-------------------------------------------------------------+ |
|  | An Error Occurred                                           | |
|  | ----------------------------------------------------------- | |
|  | The system encountered an unexpected error whilst           | |
|  | processing your request.                                    | |
|  |                                                             | |
|  | Error Reference: ERR-20260407-1A2B3C                        | |
|  |                                                             | |
|  | Technical support can be notified.                          | |
|  |                                                             | |
|  |                     [ Return to Home Dashboard ]            | |
|  +-------------------------------------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
```
*Key:*
Error Reference is a unique, sanitised reference string generated at error time. No stack traces, SQL queries, or connection strings are exposed to the user.

**Acceptance Criteria:**

```gherkin
Scenario: Handling a fatal system exception
  Given the system encounters an unhandled exception during an operation
  When the error interceptor catches the fault
  Then the system displays the generic "An Error Occurred" screen
  And the screen includes a unique error reference ID in the format ERR-YYYYMMDD-XXXXXX
  And no sensitive technical details (stack traces, SQL, connection strings) are visible
  And a "Return to Home Dashboard" button navigates the user safely back to the dashboard

Scenario: Error page preserves application shell
  Given a fatal error has occurred
  When the error page is displayed
  Then the global header and navigation bar remain visible and functional
  And the user can navigate away from the error page using the standard navigation
```

---

## 7. User Flows and Scenarios

### Flow 1: Application Launch and Dashboard Navigation

1. **Entry point:** User navigates to the base application URL via their browser.
2. **Step-by-step actions:**
   - The application shell renders immediately with the hardcoded Supervisor user context.
   - The Home Page dashboard loads with the system announcements banner and quick-action links.
   - The user clicks a quick-action button or navigation menu item to reach a feature screen.
1. **Exit points:** The user arrives at the target feature screen (e.g., Sites, Training).
2. **Error/exception paths:** If routing fails, the user is shown the generic error page (US-073).

### Flow 2: Recovering from an Error

1. **Entry point:** An unhandled exception occurs during any operation.
2. **Step-by-step actions:**
   - The global error interceptor catches the fault.
   - The system generates a unique error reference ID.
   - The user is shown the generic error page with the reference ID.
3. **Decision points:** The user can click "Return to Home Dashboard" or use the navigation bar to continue working.
4. **Exit points:** The user returns to the dashboard or navigates to another feature.

## 8. UI/Layout Specifications

### 8.1 Application Global Shell

- **Layout structure:**
  - **Header Region:** Contains the official APHA logo and application title "BST Database System". Right-aligned user context panel displaying `Smith, J (Supv)` as hardcoded text.
  - **Main Navigation Bar:** Horizontal ribbon immediately beneath the header. Dropdown menus for grouped items (Brainstem, Sites). All menu items render unconditionally (no RBAC filtering in POC).
  - **Main Content Area:** Dynamic injection space for all feature workflows and dashboards.
  - **Footer Region:** Contains standard compliance links, accessibility statements, current application version, and Crown Copyright notice.
- **Interaction states:**
  - Navigation links exhibit standard hover and active states.
  - Dropdown menus expand on hover or click.
  - Form submissions within the child content area trigger a global loading overlay on the shell to prevent double-clicks.

### 8.2 Home Page Dashboard

- **Screen purpose:** Default landing page when opening the application.
- **Logical groupings:**
  - **System Announcements Panel:** Full-width banner at the top of the content area. Displays static text. Replaces the redundant legacy News module.
  - **Quick Actions Panel:** Grid of large, high-contrast action buttons linking to primary workflows: Personnel, Training, Sites, Reports.
- **Key interactions:** Entirely read-only interface guiding users into primary workflows via clear links.

### 8.3 Generic Error Page

- **Screen purpose:** Graceful fallback for unhandled application exceptions.
- **Layout:** Centred card within the main content area, framed by the persistent global shell.
- **Components:**
  - Error title: "An Error Occurred".
  - Descriptive paragraph: brief, non-technical explanation.
  - Error Reference field: unique ID in format `ERR-YYYYMMDD-XXXXXX`.
  - Reassurance text: "Technical support has been notified automatically."
  - Primary action button: "Return to Home Dashboard".

## 9. Business Rules and Validation

| Rule ID | Rule Description                  | Applies To            | Validation Behaviour                                                                                                              |
| ------- | --------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| BR-071  | Hardcoded POC User Context        | Global Header         | The header always displays "Smith, J (Supv)" as the active user. No login required.                                               |
| BR-072  | Safe Error Presentation           | Generic Error Page    | No stack traces, SQL queries, or connection strings may appear in the error page.                                                 |
| BR-073  | Unique Error Reference Generation | Generic Error Page    | Each error event generates a unique reference ID in the format `ERR-YYYYMMDD-XXXXXX`.                                             |
| BR-074  | Navigation Completeness           | Global Navigation Bar | All primary menu items must resolve to valid routes. Unimplemented features display a placeholder page rather than a broken link. |

## 10. Data Model and Requirements

### Entities

This feature introduces no persistent database entities. The hardcoded user context is a static application constant. Error references are logged to application-level logging infrastructure (e.g., structured log files) rather than a dedicated database table in the POC.

### Data Relationships

None. The Application Shell reads no external data for its own operation in the POC. Feature screens injected into the content area manage their own data access.

## 11. Integration Points and External Dependencies

| System | Integration Type | Direction | Description                                                 | Criticality |
| ------ | ---------------- | --------- | ----------------------------------------------------------- | ----------- |
| None   | ---              | ---       | This feature has no external integration points in the POC. | ---         |

## 12. Non-Functional Requirements

| NFR ID  | Category  | Requirement                          | Acceptance Threshold                                                                              |
| ------- | --------- | ------------------------------------ | ------------------------------------------------------------------------------------------------- |
| NFR-071 | Usability | Navigation must have zero dead ends. | Every navigation link resolves to a rendered page (feature screen or placeholder). No 404 errors. |

## 13. Legacy Pain Points and Proposed Improvements

| #   | Legacy Pain Point                             | Impact                                        | Proposed Improvement                                                                           | Rationale                                                 |
| --- | --------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 1   | Heavy ViewState bloat from outdated Web Forms | Degraded navigation speed and UI freezing.    | Migrate to a lightweight modern rendering framework lacking native ViewState.                  | Achieves the < 3s loading threshold.                      |
| 2   | Redundant News module                         | User distraction and unnecessary maintenance. | Replace with a simplified, static system announcements banner in the dashboard.                | Cleans UI and removes redundant functionality.            |
| 3   | Broken home/back buttons                      | User frustration and navigational dead ends.  | Enforce standard application router logic via global components.                               | Prevents users getting stuck without closing the browser. |
| 4   | Raw error details leaked to users             | Security risk and user confusion.             | Centralised error interception showing only a sanitised reference ID on a friendly error page. | Protects sensitive data while keeping the user informed.  |

## 14. Internal System Dependencies

| Dependency | Type | Description                                                                 | Impact if Unavailable                                       |
| ---------- | ---- | --------------------------------------------------------------------------- | ----------------------------------------------------------- |
| None       | ---  | The Application Shell operates independently as the outermost wrapper. Feature screens are injected but their unavailability does not break the shell itself. | Navigation links to unavailable features show placeholder pages. |

## 15. Business Dependencies

| Dependency | Owner | Description                                | Status   |
| ---------- | ----- | ------------------------------------------ | -------- |
| None       | ---   | No external business dependencies for POC. | ---      |

## 16. Key Assumptions

| #   | Assumption                                                                                                       | Risk if Invalid                                                                            |
| --- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 1   | A hardcoded Supervisor context is acceptable for the POC demo; no authentication flow is required at this stage. | If stakeholders expect a login screen, additional work from FT-006 must be pulled forward. |
| 2   | All primary navigation targets (Sites, Training) will have at least a placeholder route.                         | Broken links in the navigation will undermine the demo.                                    |

## 17. Success Metrics and KPIs

| Metric                            | Baseline (Legacy)             | Target (New System)   | Measurement Method                  |
| --------------------------------- | ----------------------------- | --------------------- | ----------------------------------- |
| Application Shell Initial Paint   | Variable (+3 seconds common)  | < 1.0 second          | Automated performance tracing       |
| Broken navigation paths           | Multiple known dead ends      | 0                     | Manual exploratory testing          |
| Sensitive data in error pages     | Present (stack traces, SQL)   | 0 occurrences         | Manual review and testing           |

## 18. Effort Estimate

| Dimension        | Estimate      | Assumptions                                                                                                                                                 |
| ---------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Human Effort** | 3 person-days | Covers shell layout, navigation routing, dashboard content, error page, and placeholder routes for unimplemented features. No auth, RBAC, or session logic. |

## 19. Open Questions

| #   | Question                                                                                                   | Context                                                                    | Impact                                                                            | Raised By | Status                               |
| --- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --------- | ------------------------------------ |
| 1   | Should the system announcements banner content be configurable via a simple config file, or purely static? | Legacy system had a database-driven News module that was deemed redundant. | If configurable, adds minimal effort but provides flexibility for demo messaging. | Agent     | Resolved: keep it static for the POC |

## 20. Definition of Done

This feature is considered done when all of the following are satisfied:

- [ ] All user stories in User Stories and Acceptance Criteria are implemented and pass their acceptance criteria
- [ ] All test scenarios have been met
- [ ] UI implementations match the specifications in UI/Layout Specifications
- [ ] All business rules in Business Rules and Validation are enforced and validated
- [ ] No open questions in Open Questions remain with status "Open" that block release
- [ ] Feature has been reviewed and accepted by the product owner
- [ ] Feature has been demonstrated to stakeholders

## 21. Glossary

| Term                       | Definition                                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Application Shell**      | The persistent visual wrapper (header, navigation, footer) framing all feature content areas.         |
| **Hardcoded User Context** | A static, non-authenticated user identity embedded in the application for POC demonstration purposes. |
