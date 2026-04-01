# React Best Practices & Standards

Modern React development rules focused on functional components, hooks, performance optimization, and maintainable component architecture.

## Context

Establish consistent, performant, and maintainable React development practices across the application.

*Applies to:* All React components, hooks, and related frontend code
*Level:* Tactical/Operational - Daily development and code review standards
*Audience:* Frontend developers, React developers, code reviewers

## Core Principles

1. **Functional First:** Prioritize functional components and hooks over class components. Embrace modern React paradigms.
2. **Performance by Design:** Build with performance in mind from the start. Lazy loading, memoization, and efficient re-renders are not afterthoughts.
3. **Composition Over Inheritance:** Use composition patterns, render props, and custom hooks to share logic. Avoid deep component hierarchies.
4. **Explicit Dependencies:** Make component dependencies clear through props, context, and custom hooks. Avoid hidden global state mutations.
5. **Accessibility First:** Every component must be usable with keyboard navigation and screen readers. Accessibility is not optional.

## Rules

### Must Have (Critical)

- **RULE-001:** Use functional components exclusively. Class components only permitted for error boundaries.
- **RULE-002:** Always use TypeScript with explicit prop interfaces. No `any` types except for documented escape hatches.
- **RULE-003:** Implement proper error boundaries for all route-level components and critical UI sections.
- **RULE-004:** All side effects MUST be contained within `useEffect` hooks with explicit dependency arrays.
- **RULE-005:** Custom hooks MUST follow the "use" naming convention and contain all related logic for a specific concern.
- **RULE-006:** Never mutate props or state directly. Use immutable update patterns and state setters.
- **RULE-007:** All interactive elements MUST be keyboard accessible and have proper ARIA labels.
- **RULE-008:** Components MUST have a single responsibility. Split components that handle multiple concerns.

### Should Have (Important)

- **RULE-101:** Use `React.memo()` for components that receive the same props frequently.
- **RULE-102:** Prefer `useMemo()` and `useCallback()` for expensive computations and function references.
- **RULE-103:** Implement loading states, error states, and empty states for all data-dependent components.
- **RULE-104:** Use Suspense boundaries with lazy-loaded components for code splitting.
- **RULE-105:** Prefer controlled components over uncontrolled components for form inputs.
- **RULE-106:** Use React.StrictMode in development to catch side effects and deprecated patterns.
- **RULE-107:** Implement proper cleanup in useEffect hooks to prevent memory leaks.

### Could Have (Preferred)

- **RULE-201:** Consider using React Server Components for static content when framework supports them.
- **RULE-202:** Implement React DevTools Profiler integration for performance monitoring.
- **RULE-203:** Use concurrent features like `startTransition` for non-urgent state updates.
- **RULE-204:** Consider virtual scrolling for large lists (>100 items).

## Patterns & Anti-Patterns

### ✅ Do This

```typescript
// Proper functional component with TypeScript
interface UserCardProps {
  user: User;
  onEdit: (id: string) => void;
}

const UserCard: React.FC<UserCardProps> = React.memo(({ user, onEdit }) => {
  const handleEdit = useCallback(() => onEdit(user.id), [user.id, onEdit]);

  return (
    <Card>
      <Text>{user.name}</Text>
      <Button onClick={handleEdit} aria-label={`Edit ${user.name}'s profile`}>
        Edit
      </Button>
    </Card>
  );
});

// Custom hook for data fetching
function useUserData(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    
    async function fetchUser() {
      try {
        const userData = await api.getUser(userId);
        if (!cancelled) setUser(userData);
      } catch (err) {
        if (!cancelled) setError(err as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchUser();
    return () => { cancelled = true; };
  }, [userId]);

  return { user, loading, error };
}
```

### ❌ Don't Do This

```typescript
// Don't use class components (except error boundaries)
class UserCard extends Component { // ❌
  render() {
    return <div>{this.props.user.name}</div>;
  }
}

// Don't mutate props or state
function UserList({ users }) {
  const handleSort = () => {
    users.sort((a, b) => a.name.localeCompare(b.name)); // ❌ Mutating props
  };
}

// Don't use useEffect without dependencies
function UserProfile({ userId }) {
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }); // ❌ Missing dependency array
}

// Don't ignore accessibility
<div onClick={handleClick}>Click me</div> // ❌ Not keyboard accessible
```

## Decision Framework

*When rules conflict:*
1. Performance considerations must not compromise accessibility
2. Type safety takes precedence over developer convenience
3. User experience trumps developer experience when forced to choose

*When facing edge cases:*
- Profile first, optimize second with measurement
- Consider if the problem should be solved outside React
- Evaluate context vs external state management for complex state

## Exceptions & Waivers

*Valid reasons for exceptions:*
- Third-party components requiring class component patterns (document migration plan)
- Profiled performance bottlenecks where modern patterns cause regression
- Framework limitations that conflict with best practices

*Process for exceptions:*
1. Document exception with detailed rationale and tracking ticket
2. Get approval from tech lead for critical rule violations
3. Create migration path documentation if exception is temporary

## Quality Gates

*Automated checks:*
- ESLint React hooks rules (`exhaustive-deps`, `rules-of-hooks`) enforced in CI/CD
- TypeScript strict mode with no-implicit-any in React components
- Bundle analyzer warns on component chunks exceeding size thresholds
- Accessibility testing with jest-axe in unit tests

*Code review focus:*
- Verify proper useEffect cleanup and dependency arrays
- Check component composition and single responsibility adherence
- Ensure accessibility attributes and keyboard navigation
- Review performance patterns (memo, callback, useMemo usage)

*Testing requirements:*
- Unit tests for custom hooks using React Testing Library hooks utilities
- Integration tests for complete user flows using userEvent
- Performance testing for components handling large datasets

## Related Rules

- rules/typescript-rules.md - Type safety patterns for React components
- rules/design-rules.md - UI component implementation standards
- knowledge/design-system.md - React component library specifications

## References

- [React Documentation](https://react.dev) - Official React docs and patterns
- [React TypeScript Cheatsheets](https://react-typescript-cheatsheet.netlify.app/) - Community TypeScript patterns
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) - Testing best practices
- [Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility standards

---

## TL;DR

*Key Principles:*
- Functional components and hooks only (except error boundaries)
- Performance and accessibility are required, not optional features
- Composition over inheritance for component architecture

*Critical Rules:*
- Must use functional components with TypeScript and explicit prop interfaces
- Must implement error boundaries for all route-level components
- Must use useEffect with explicit dependency arrays (no missing deps)
- Must ensure keyboard accessibility and screen reader support
- Must never mutate props/state directly

*Quick Decision Guide:*
When in doubt: **Would this component be easy to test, performant by default, and accessible to all users?** If any answer is no, reconsider the implementation approach.
