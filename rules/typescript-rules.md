# TypeScript Best Practices

Comprehensive rules for writing maintainable, type-safe TypeScript code that leverages the type system to catch errors at compile time.

## Context

*Applies to:* All TypeScript code (frontend, backend, shared utilities)
*Level:* Tactical/Operational - daily coding practices
*Audience:* All developers writing TypeScript code

## Core Principles

1. **Type Safety First:** Leverage TypeScript's type system to catch errors at compile time. Strong typing is not overhead—it's documentation and a safety net.
2. **Explicit Over Implicit:** Make types explicit when they improve clarity, even when TypeScript can infer them.
3. **Strictness as Default:** Enable strict mode and all strict compiler options. Loose typing defeats the purpose of using TypeScript.
4. **Runtime Safety:** TypeScript types are erased at runtime. Validate external data and API boundaries with runtime checks.

## Rules

### Must Have (Critical)

- **RULE-001:** Enable strict mode in `tsconfig.json` (`"strict": true`). Never disable strict checks project-wide.
- **RULE-002:** Never use `any` type except for valid escape hatches. Use `unknown` for truly unknown types.
- **RULE-003:** All function parameters and return types must be explicitly typed. Do not rely on inference for public APIs.
- **RULE-004:** Validate all external data (API responses, user input) at runtime. Types alone don't protect against invalid runtime data.
- **RULE-005:** Never use `@ts-ignore` or `@ts-expect-error` without a detailed comment explaining why.
- **RULE-006:** Use `null` and `undefined` deliberately. Enable `strictNullChecks` and handle nullability explicitly with optional chaining (`?.`) and nullish coalescing (`??`).

### Should Have (Important)

- **RULE-101:** Prefer `interface` for object shapes that may be extended. Use `type` for unions, intersections, and utility types.
- **RULE-102:** Use readonly properties (`readonly`, `ReadonlyArray<T>`) to prevent unintended mutations.
- **RULE-103:** Use discriminated unions for state management and complex data structures with a literal type discriminant.
- **RULE-104:** Prefer type guards (`typeof`, `instanceof`, custom type predicates) over type assertions for narrowing types.
- **RULE-105:** Use enums sparingly. Prefer string literal unions (`type Status = 'pending' | 'active'`) for better type safety.
- **RULE-106:** Use generics to create reusable, type-safe components. Avoid over-generalization.

### Could Have (Preferred)

- **RULE-201:** Use utility types (`Partial<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, V>`) instead of redefining types.
- **RULE-202:** Use `satisfies` operator (TS 4.9+) to validate type compatibility while preserving literal types.
- **RULE-203:** Prefer tuple types over arrays when length and position matter (`[string, number]`).
- **RULE-204:** Enable `noUnusedLocals` and `noUnusedParameters` to catch dead code.

## Patterns & Anti-Patterns

### ✅ Do This

```typescript
// Explicit typing and readonly
function calculateTotal(items: readonly Item[], tax: number): number {
  return items.reduce((sum, item) => sum + item.price, 0) * (1 + tax);
}

// Discriminated unions
type ApiResponse<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

// Use unknown with type guards
function processData(data: unknown): string {
  if (typeof data === 'string') {
    return data.toUpperCase();
  }
  throw new Error('Invalid data type');
}

// Const assertions for literals
const CONFIG = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
} as const;

// Optional chaining for null safety
function getUserEmail(user: User | null): string | undefined {
  return user?.profile?.email;
}
```

### ❌ Don't Do This

```typescript
// Don't use any without justification
function processData(data: any): any { // ❌
  return data.toString();
}

// Don't omit return types on exports
export function calculate(a: number, b: number) { // ❌
  return a + b;
}

// Don't use unsafe type assertions
const user = getData() as User; // ❌

// Don't ignore null checks
function getLength(str: string | null): number {
  return str.length; // ❌ Object is possibly null
}

// Don't use @ts-ignore without explanation
// @ts-ignore // ❌
const result = dangerousOperation();
```

## Decision Framework

*When rules conflict:*
1. Prioritize type safety over convenience
2. Prefer explicit types at boundaries over internal inference
3. Choose strictness by default; relax only with clear documentation

*When facing edge cases:*
- For truly dynamic data, use `unknown` and validate with type guards or validation libraries (Zod, io-ts)
- For migration from JavaScript, use `any` with `// TODO: type this` comments
- When TypeScript cannot express a constraint, document it and use runtime validation

## Exceptions & Waivers

*Valid reasons for exceptions:*
- Third-party library incompatibility (document and consider creating type declarations)
- Migration phase from JavaScript (with clear plan and tracking issues)
- Performance-critical sections (after profiling, with documented justification)

*Process for exceptions:*
1. Document with detailed comment explaining why and the plan to remove it
2. Create tracking issue for removing the exception
3. Use `@ts-expect-error` with explanation instead of `@ts-ignore`

## Quality Gates

- **Automated checks:**
  - CI must run `tsc --noEmit` to verify no type errors
  - ESLint with `@typescript-eslint` rules
  - Enforce no `any` types in new code
  - Pre-commit hooks for type checking

- **Code review focus:**
  - Verify explicit types on exported functions
  - Check proper null/undefined handling
  - Ensure `any` types have justification
  - Validate runtime validation at system boundaries

- **Testing requirements:**
  - Type tests for complex utility types
  - Verify type narrowing in control flow
  - Test error cases for type safety

## Related Rules

- .rules/design-rules.md - Architectural patterns leveraging TypeScript
- .rules/design-system.md - Design system patterns

## References

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) - Official docs
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/) - Comprehensive guide
- [Effective TypeScript](https://effectivetypescript.com/) - 62 ways to improve TypeScript
- [TypeScript ESLint](https://typescript-eslint.io/rules/) - Recommended linting

---

## TL;DR

*Key Principles:*
- Type safety is the entire point of TypeScript
- Explicit types at boundaries, inference internally
- Strict mode always on

*Critical Rules:*
- Must enable strict mode and all strict compiler options
- Must never use `any` without justification (use `unknown`)
- Must explicitly type function parameters and returns for exports
- Must validate external data at runtime
- Must handle null/undefined explicitly

*Quick Decision Guide:*
When in doubt: **If TypeScript complains, listen to it.** The type error usually highlights a real bug. Fix the root cause rather than silencing the error.
