# GOV.UK Design System (GDS) Rules

Rules for designing and building government services using the GOV.UK Design System. Ensures consistency with GOV.UK, accessibility compliance, and user-centred design across all frontend pages.

## Context

The GOV.UK Design System provides styles, components, and patterns to make government services consistent. All UI work must align with this framework to meet government standards and pass service assessments.

*Applies to:* All frontend pages, components, forms, and user-facing UI in the service
*Level:* Strategic/Tactical - Governs all design and frontend implementation decisions
*Audience:* Frontend developers, designers, content designers, code reviewers

## Core Principles

1. **User Needs First:** Every design decision must be driven by real user needs, validated through user research. Do not add features, imagery, or styling without a demonstrated need.
2. **Accessibility is Non-Negotiable:** All pages must meet WCAG 2.2 AA as a minimum. Using GDS components alone does not guarantee accessibility -- additional testing is always required.
3. **Consistency with GOV.UK:** Services must look and feel like GOV.UK. Follow established conventions for colour, typography, layout, and interaction patterns. Do not invent custom styles when a GDS solution exists.
4. **Mobile-First Design:** Design for small screens first, then progressively enhance for larger viewports. Start with a single-column layout.
5. **Reuse Before You Build:** Use existing GDS components and patterns before creating custom solutions. The design system captures cross-government research -- leverage it.

## Rules

### Must Have (Critical)

- **RULE-001:** Use GOV.UK Frontend as the foundation for all UI. Do not build custom component libraries that duplicate GDS components.
- **RULE-002:** All text and interactive elements MUST meet WCAG 2.2 success criterion 1.4.3 Contrast (minimum) level AA. Use the GOV.UK colour palette exclusively via `govuk-colour` and `govuk-functional-colour` Sass functions.
- **RULE-003:** Use GDS components (Button, Text input, Radios, Checkboxes, Error summary, etc.) for all form elements and UI controls. Do not restyle or replace them with custom alternatives.
- **RULE-004:** Implement mobile-first, single-column layouts. Use `govuk-grid-row` and `govuk-grid-column-*` classes for all page structure. Maximum page width is 1020px via `govuk-width-container`.
- **RULE-005:** All images MUST have meaningful `alt` attributes (specific, concise, max two sentences). Decorative images must use `alt=""`.
- **RULE-006:** Use GDS patterns for common tasks: asking for names, addresses, dates, email addresses, National Insurance numbers, and passwords. Do not design custom flows for these.
- **RULE-007:** Implement proper error handling using the Error summary and Error message components. Errors must be linked, descriptive, and follow GDS error patterns.
- **RULE-008:** All pages MUST use the GOV.UK page template with the standard Header, Footer, and Skip link components.

### Should Have (Important)

- **RULE-101:** Use two-thirds width (`govuk-grid-column-two-thirds`) for main content to maintain readability (~75 characters per line). Use two-thirds/one-third layouts for content with a sidebar.
- **RULE-102:** Follow GDS typography conventions: use the GDS type scale, heading hierarchy, and paragraph styles. Do not override font families, sizes, or weights.
- **RULE-103:** Avoid decorative images. Only include images when there is a genuine user need. Photography should show realistic representations, not abstract or stock imagery.
- **RULE-104:** Use the Phase banner component to indicate service status (alpha/beta) and provide a feedback link.
- **RULE-105:** Implement Breadcrumbs or Back link for navigation context. Use Service navigation for multi-section services.
- **RULE-106:** Use GDS page patterns for standard pages: Confirmation, Question, Page not found (404), Service unavailable, and "There is a problem" error pages.
- **RULE-107:** Apply `govuk-main-wrapper` for consistent vertical padding on the `<main>` element.

### Could Have (Preferred)

- **RULE-201:** Use `govuk-visually-hidden` to provide screen-reader-only content where visual context is insufficient.
- **RULE-202:** Use GDS spacing scale (`govuk-spacing`) consistently rather than arbitrary margin/padding values.
- **RULE-203:** Consider the Task list component for multi-step processes to show progress across sections.
- **RULE-204:** Use the Details component for progressive disclosure of supplementary information.

## DEFRA Organisation Branding

This is a DEFRA (Department for Environment, Food & Rural Affairs) service operated by APHA (Animal and Plant Health Agency). Apply these branding rules on top of the standard GOV.UK template:

- **Organisation colour:** DEFRA green `#00a33b` (contrast-safe variant: `#008531`). Use via `govuk-organisation-colour("department-for-environment-food-rural-affairs")`. The contrast-safe variant meets WCAG AA for text on white backgrounds -- always prefer it for text and interactive elements.
- **Header:** Use the standard GOV.UK Header component. Set the `organisationName` to display "Department for Environment, Food & Rural Affairs" or the service-specific name. Do NOT change the black header bar or crown logo -- these are mandatory GOV.UK elements.
- **Service name:** Display the service name in the header using the `serviceName` prop/slot. For this service: "APHA BST".
- **Crown copyright:** The footer MUST include "© Crown copyright" with a link to the National Archives, and the Open Government Licence notice. These are non-negotiable GOV.UK requirements.

## Visual Identity Reference

These are the canonical GOV.UK Design System colour tokens, typography, and spacing values. When building or theming components, use these exact values to ensure the service looks like a real GOV.UK site.

### Colour Palette

**Functional colours (use these by role, not by hex):**

| Role | Hex | Sass function | Usage |
|------|-----|---------------|-------|
| Text | `#0b0c0c` | `govuk-functional-colour("text")` | All body text |
| Secondary text | `#484949` | `govuk-functional-colour("secondary-text")` | Hint text, captions |
| Link | `#1a65a6` | `govuk-functional-colour("link")` | Default link colour |
| Link hover | `#0f385c` | — | Link hover state |
| Link visited | `#54319f` | `govuk-functional-colour("link-visited")` | Visited link colour |
| Link active | `#0b0c0c` | — | Link active/pressed state |
| Focus | `#ffdd00` | `govuk-functional-colour("focus")` | Focus indicator background |
| Focus text | `#0b0c0c` | `govuk-functional-colour("focus-text")` | Text on focus background |
| Error | `#ca3535` | `govuk-functional-colour("error")` | Error messages and borders |
| Success | `#0f7a52` | `govuk-functional-colour("success")` | Confirmation panels, success |
| Brand | `#1d70b8` | `govuk-functional-colour("brand")` | GOV.UK brand blue |
| Border | `#cecece` | `govuk-functional-colour("border")` | Standard borders |
| Input border | `#0b0c0c` | `govuk-functional-colour("input-border")` | Form input borders (black) |
| Body background | `#ffffff` | — | Page body background |
| Page background | `#f4f8fb` | — | Template background (light blue-grey) |

**Key colour rules:**
- Never hardcode hex values -- always reference the Sass function or token name so values stay in sync with GOV.UK Frontend updates
- Form input borders are black (`#0b0c0c`), not grey -- this is intentional for accessibility
- The focus state is always yellow (`#ffdd00`) background with black text and a 3px black outline. Never change this -- it is a critical accessibility pattern across all GOV.UK services
- Error red (`#ca3535`) is used for error messages, error borders on inputs, and the error summary component

### Typography

| Element | Class | Desktop size | Mobile size | Weight |
|---------|-------|-------------|-------------|--------|
| XL heading | `govuk-heading-xl` | 48px | 32px | Bold (700) |
| L heading | `govuk-heading-l` | 36px | 24px | Bold (700) |
| M heading | `govuk-heading-m` | 24px | 18px | Bold (700) |
| S heading | `govuk-heading-s` | 19px | 16px | Bold (700) |
| Body | `govuk-body` | 19px | 16px | Regular (400) |
| Body small | `govuk-body-s` | 16px | 14px | Regular (400) |
| Body large | `govuk-body-l` | 24px | 18px | Regular (400) |
| Caption XL | `govuk-caption-xl` | 27px | 18px | Regular (400) |

**Font stack:** `"GDS Transport", arial, sans-serif`

**Typography rules:**
- Use sentence case for all headings (e.g. "Check your answers" not "Check Your Answers")
- Only one `<h1>` per page, using `govuk-heading-xl` or `govuk-heading-l`
- Heading hierarchy must be sequential -- do not skip from `h1` to `h3`
- Do not override font family, sizes, or weights -- use the GDS type scale classes only
- Body text at 19px on desktop is larger than most sites -- this is intentional for readability. Do not reduce it

### Spacing Scale

Use `govuk-spacing(n)` for all margin and padding values. Never use arbitrary pixel values.

| Scale point | Value | Common usage |
|-------------|-------|-------------|
| 0 | 0px | Reset spacing |
| 1 | 5px | Tight internal spacing |
| 2 | 10px | Small gaps, inline spacing |
| 3 | 15px | Standard internal padding |
| 4 | 15px/20px | Form group spacing |
| 5 | 15px/25px | Section spacing (small) |
| 6 | 20px/30px | Section spacing (medium) |
| 7 | 25px/40px | Section spacing (large) |
| 8 | 30px/50px | Major section breaks |
| 9 | 40px/60px | Page-level spacing |

Values shown as mobile/desktop where responsive. Use `govuk-responsive-margin` and `govuk-responsive-padding` mixins for responsive spacing.

### Breakpoints

| Name | Value | Usage |
|------|-------|-------|
| Mobile | 320px | Minimum supported width |
| Tablet | 641px | Two-column layouts begin |
| Desktop | 769px | Full desktop layout |

### Focus States

The GOV.UK focus state is a distinctive and critical accessibility pattern. Every interactive element must show it:

- **Background:** `#ffdd00` (yellow)
- **Outline:** 3px solid `#0b0c0c` (black)
- **Text colour:** `#0b0c0c` (black, overriding link blue)
- **Offset:** No outline offset (outline sits tight to the element)

When theming or building custom interactive elements, replicate this exact focus state. Users of GOV.UK services expect this pattern -- it is tested with assistive technology users and must not be altered.

### Key Visual Patterns

**GOV.UK Header (black bar):**
- Background: `#0b0c0c` (black)
- Crown logo on the left, GOV.UK text beside it
- Service name in white below the crown row
- Full width, not constrained to 1020px content area

**GOV.UK Footer (grey bar):**
- Background: `#f3f2f1` (light grey)
- Contains: Open Government Licence notice, Crown copyright link
- Meta links (accessibility statement, cookies, etc.)
- Full width with content constrained to 1020px

**Green confirmation panel:**
- Background: `#0f7a52` (success green)
- White text, used for confirmation pages ("Application complete")
- Use the Panel component -- do not build custom

**Phase banner:**
- "Alpha" or "Beta" tag in the banner area
- Includes feedback link
- Sits between the header and main content

**Notification banner:**
- Blue left border (`#1d70b8`) for informational
- Blue header background for success variant

## Content Design Rules

GOV.UK services follow strict content conventions. Text that does not follow these rules will look wrong even if the visual styling is correct.

### Writing Style

- **Plain English:** Use simple, direct language. Avoid jargon, Latin, and formal phrasing. Write "use" not "utilise", "buy" not "purchase", "help" not "assist".
- **Sentence case everywhere:** Headings, labels, buttons, links, and navigation items all use sentence case. The only exceptions are proper nouns and acronyms. Write "Check your answers" not "Check Your Answers".
- **Active voice:** Write "We will send you an email" not "An email will be sent to you".
- **Second person:** Address the user as "you". Write "Enter your email address" not "Enter the email address".
- **Short sentences:** Aim for 25 words or fewer per sentence. Break long sentences into two.

### Formatting Conventions

- **Dates:** "6 April 2026" (no leading zero, month as word, no ordinals like "6th")
- **Times:** "5:30pm" (no space before am/pm, no minutes for on-the-hour times: "5pm")
- **Numbers:** Spell out one to nine, use digits for 10 and above. Use commas in thousands: "1,250"
- **Currency:** "£75" (no decimal for whole pounds), "£75.50" (two decimal places when pence)
- **Addresses:** Each line on a new line, postcode on the final line, no comma at line ends
- **Phone numbers:** "0800 123 4567" (spaces after area code and in groups)

### Button and Link Text

- Buttons use a verb: "Continue", "Submit application", "Save and return". Never "Click here" or "Next".
- Links describe the destination: "View your applications" not "Click here". Never use "Click here" or raw URLs as link text.
- Destructive actions use the warning button style (red) with clear text: "Delete application".

## Patterns & Anti-Patterns

### Do This

```html
<!-- Correct: GDS layout with proper grid classes -->
<div class="govuk-width-container">
  <main class="govuk-main-wrapper" id="main-content" role="main">
    <div class="govuk-grid-row">
      <div class="govuk-grid-column-two-thirds">
        <h1 class="govuk-heading-xl">Page title</h1>
        <p class="govuk-body">Content here.</p>
      </div>
    </div>
  </main>
</div>

<!-- Correct: GDS form input with error handling -->
<div class="govuk-form-group govuk-form-group--error">
  <label class="govuk-label" for="email">Email address</label>
  <p class="govuk-error-message">
    <span class="govuk-visually-hidden">Error:</span> Enter an email address
  </p>
  <input class="govuk-input govuk-input--error" id="email" name="email" type="email">
</div>
```

### Don't Do This

```html
<!-- Wrong: Custom layout bypassing GDS grid -->
<div style="max-width: 800px; margin: 0 auto; padding: 20px;">
  <h1 style="font-size: 2em;">Page title</h1>
</div>

<!-- Wrong: Custom styled button instead of GDS component -->
<button class="custom-btn primary-action">Submit</button>

<!-- Wrong: Decorative image with no user need -->
<img src="banner-decoration.png" alt="Decorative swirls and shapes">

<!-- Wrong: Custom error display instead of GDS Error summary -->
<div class="alert alert-danger">Something went wrong</div>
```

## Decision Framework

*When rules conflict:*
1. Accessibility requirements always take priority
2. GDS standard components take precedence over custom designs
3. User research evidence overrides personal design preferences

*When making visual decisions without a GDS component:*
1. Use only colours from the GOV.UK functional colour palette -- never invent colours
2. Use the GDS spacing scale -- never use arbitrary pixel values
3. Use the GDS type scale and font stack -- never override typography
4. Replicate the standard focus state exactly on any custom interactive elements
5. Follow the content design rules for all text (sentence case, plain English, GOV.UK date/number formats)

*When facing edge cases:*
- If no GDS component exists, check the GDS community backlog and GitHub discussions before building custom
- If extending a GDS component, follow the official guidance on extending and modifying components
- When in doubt, keep it simple -- the plainest GDS implementation is usually the right one

## Exceptions & Waivers

*Valid reasons for exceptions:*
- A user research finding that demonstrates a GDS pattern does not work for a specific user group (document evidence)
- A service requirement with no existing GDS component or pattern (check community backlog first)
- Departmental branding requirements that override standard GOV.UK styling (use organisation colours from GOV.UK Frontend)

*Process for exceptions:*
1. Document the exception with user research evidence or technical rationale
2. Get design lead approval before implementing custom solutions
3. Contribute findings back to the GDS community via GitHub discussions

## Quality Gates

- **Automated checks:** axe-core or WAVE accessibility scans in CI/CD; colour contrast ratio validation
- **Code review focus:** Verify GDS classes used correctly; no inline styles overriding GDS; proper error pattern implementation; alt text on all images
- **Testing requirements:** Test on mobile viewports first; screen reader testing with NVDA/VoiceOver; keyboard-only navigation testing

## Related Rules

- rules/react-rules.md - Component implementation standards (accessibility-first principle)
- rules/typescript-rules.md - Type safety for component props and GDS integration
- rules/clean-code.md - Code quality standards for frontend templates

## References

- [GOV.UK Design System](https://design-system.service.gov.uk/) - Official styles, components, and patterns
- [GOV.UK Design Principles](https://www.gov.uk/guidance/government-design-principles) - The 10 principles underpinning government design
- [GOV.UK Service Manual](https://www.gov.uk/service-manual) - Standards for building government services
- [WCAG 2.2 Guidelines](https://www.w3.org/TR/WCAG22/) - Web Content Accessibility Guidelines
- [GOV.UK Frontend on GitHub](https://github.com/alphagov/govuk-frontend) - Source code and releases
- [GOV.UK Frontend Sass API](https://frontend.design-system.service.gov.uk/sass-api-reference/) - Sass functions, mixins, and variables
- [GOV.UK Style Guide](https://www.gov.uk/guidance/style-guide/a-to-z-of-gov-uk-style) - Content and writing conventions

---

## TL;DR

*Key Principles:*
- Design for user needs first, validated by research -- not assumptions
- Accessibility (WCAG 2.2 AA) is mandatory, not optional
- Use GOV.UK Design System components and patterns before building custom

*Critical Rules:*
- Must use GOV.UK Frontend, colour palette, and standard page template
- Must use GDS components for all forms, navigation, and UI controls
- Must design mobile-first with GDS grid layout (max 1020px)
- Must meet WCAG 2.2 AA colour contrast and provide alt text on all images
- Must use GDS patterns for common tasks (names, addresses, dates, errors)

*Visual Identity (make it look like GOV.UK):*
- Black header bar with crown logo, grey footer with OGL notice
- Font: "GDS Transport", arial, sans-serif -- body text at 19px desktop
- Links: `#1a65a6`, visited `#54319f`, focus yellow `#ffdd00` with black outline
- Input borders are black (`#0b0c0c`), not grey
- Sentence case for all headings, buttons, and labels
- DEFRA organisation colour: `#00a33b` (contrast-safe: `#008531`)

*Quick Decision Guide:*
When in doubt: **Does a GDS component or pattern already exist for this?** If yes, use it. If no, check the community backlog, then build the simplest accessible solution possible.
