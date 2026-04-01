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

*Quick Decision Guide:*
When in doubt: **Does a GDS component or pattern already exist for this?** If yes, use it. If no, check the community backlog, then build the simplest accessible solution possible.
