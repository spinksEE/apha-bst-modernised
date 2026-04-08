# PostgreSQL Schema & SQL Best Practices

Guidelines for writing correct, performant, and maintainable PostgreSQL schemas and queries. Based on official PostgreSQL documentation recommendations and established community standards.

## Context

Standards for database schema design, SQL syntax, data types, indexing, constraints, and migration practices when working with PostgreSQL.

*Applies to:* All database schemas, migrations, queries, and Prisma schema definitions in this project
*Level:* Tactical/Operational - applied during schema design, migration authoring, and query writing
*Audience:* All developers working with the database layer

## Core Principles

1. *Correctness First:* Use the type system and constraints to make invalid states unrepresentable at the database level
2. *Explicit over Implicit:* Spell out column lists, constraint names, and type choices — never rely on defaults you haven't verified
3. *Least Surprise:* Follow PostgreSQL naming conventions and idioms so the schema reads naturally to any Postgres-literate developer
4. *Defence in Depth:* Enforce integrity in the database, not only in the application — applications change, the schema endures

## Rules

### Must Have (Critical)

- *RULE-001:* Use `snake_case` for all identifiers — table names, column names, indexes, constraints, functions. Never quote identifiers to force mixed case
- *RULE-002:* Name tables as **plural nouns** (`trainers`, `training_sessions`) to describe the set of rows they contain
- *RULE-003:* Always use `timestamptz` (timestamp with time zone), never `timestamp` without time zone. PostgreSQL stores UTC internally; `timestamptz` ensures correct conversion on input/output
- *RULE-004:* Prefer `text` over `varchar(n)` unless a hard length limit is a genuine domain constraint. `text` and `varchar` are stored identically in PostgreSQL; arbitrary length limits cause runtime errors with no performance benefit
- *RULE-005:* Every table must have a primary key. Prefer `GENERATED ALWAYS AS IDENTITY` over the legacy `serial` pseudo-type for auto-incrementing integer keys
- *RULE-006:* Every foreign key must have an explicit `ON DELETE` clause (`CASCADE`, `RESTRICT`, `SET NULL`, etc.) — never rely on the implicit default of `NO ACTION` without conscious intent
- *RULE-007:* Add `NOT NULL` to every column unless `NULL` has a defined domain meaning. Nullability should be the exception, not the default
- *RULE-008:* Name constraints explicitly using the pattern `{table}_{columns}_{type}` (e.g., `trainers_email_key`, `sessions_trainer_id_fkey`, `results_score_check`). Never rely on auto-generated names — they are database-specific and hinder migration troubleshooting

### Should Have (Important)

- *RULE-101:* Use `uuid` (with `gen_random_uuid()`) for primary keys exposed in public APIs or URLs. Use identity integers for internal-only keys where join performance matters
- *RULE-102:* Create indexes to support every foreign key column — PostgreSQL does **not** auto-index foreign keys, and missing indexes cause full table scans on joins and cascading deletes
- *RULE-103:* Use `boolean` columns instead of status strings when there are only two states. Use an `enum` type or a reference/lookup table for fixed sets of three or more values
- *RULE-104:* Use `numeric` (or `decimal`) for money and precision-critical values — never `real`/`double precision`, which are IEEE 754 floating point and accumulate rounding errors
- *RULE-105:* Add `created_at timestamptz NOT NULL DEFAULT now()` and `updated_at timestamptz NOT NULL DEFAULT now()` audit columns to every table. Use a trigger or application logic to maintain `updated_at`
- *RULE-106:* Write `CHECK` constraints for domain invariants that go beyond type (e.g., `CHECK (age >= 0)`, `CHECK (end_date > start_date)`)
- *RULE-107:* Prefer `bigint` over `integer` for identity/serial columns on tables expected to grow large — exhausting a 32-bit integer range requires a painful migration

### Could Have (Preferred)

- *RULE-201:* Use partial indexes (`CREATE INDEX ... WHERE condition`) when queries consistently filter on a subset of rows
- *RULE-202:* Use `jsonb` (not `json`) when storing semi-structured data — `jsonb` supports indexing and is stored in a decomposed binary format for faster access
- *RULE-203:* Group related tables into named schemas (e.g., `training`, `personnel`) to organise large databases and control permissions per schema
- *RULE-204:* Prefer `EXISTS` subqueries over `IN` subqueries for correlated lookups — the query planner handles `EXISTS` more efficiently in most cases
- *RULE-205:* Use `CONCURRENTLY` when creating or dropping indexes on tables that receive writes, to avoid holding an exclusive lock

## Patterns & Anti-Patterns

### Do This

```sql
-- Table with explicit types, constraints, and naming
CREATE TABLE training_sessions (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    trainer_id  bigint NOT NULL,
    title       text   NOT NULL,
    scheduled_at timestamptz NOT NULL,
    duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
    is_completed boolean NOT NULL DEFAULT false,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT training_sessions_trainer_id_fkey
        FOREIGN KEY (trainer_id) REFERENCES trainers (id) ON DELETE CASCADE
);

-- Index on the foreign key column
CREATE INDEX training_sessions_trainer_id_idx ON training_sessions (trainer_id);

-- Partial index for common query pattern
CREATE INDEX training_sessions_upcoming_idx
    ON training_sessions (scheduled_at)
    WHERE is_completed = false;
```

### Don't Do This

```sql
-- Anti-pattern: mixed case, varchar limits, no time zone, implicit nullability
CREATE TABLE "TrainingSession" (
    "Id"        SERIAL PRIMARY KEY,
    "TrainerId" INTEGER REFERENCES trainers(id),  -- no ON DELETE, no index
    "Title"     VARCHAR(255),                      -- arbitrary limit, implicitly nullable
    "Date"      TIMESTAMP,                         -- no time zone
    "Score"     FLOAT                              -- imprecise type for numeric data
);
```

## Decision Framework

*When rules conflict:*
1. Correctness (constraints, types) always wins over convenience
2. Readability and consistency win over marginal performance gains
3. Consult `EXPLAIN ANALYZE` with real data before adding complexity for performance

*When facing edge cases:*
- If unsure between `text` and `varchar(n)`, choose `text` and validate length in a `CHECK` constraint if needed — this gives a clear error message
- If unsure between `integer` and `bigint`, choose `bigint` — storage difference is negligible, migration cost is not
- If unsure whether a column should be nullable, make it `NOT NULL` and relax later if needed — adding `NOT NULL` to an existing column requires a full table scan

## Exceptions & Waivers

*Valid reasons for exceptions:*
- Third-party or legacy system integration requiring specific column types or naming
- Prisma ORM limitations that necessitate deviation (document in a schema comment)
- Demonstrated performance requirement backed by `EXPLAIN ANALYZE` on representative data

*Process for exceptions:*
1. Add a SQL comment or Prisma `///` doc comment explaining the deviation
2. Reference the exception in the relevant migration file

## Quality Gates

- *Automated checks:* Prisma schema validation, migration dry-run (`prisma migrate diff`), SQL linting via `squawk` or `pgFormatter`
- *Code review focus:* Constraint completeness, index coverage for foreign keys, correct use of `timestamptz`, explicit `ON DELETE` clauses
- *Testing requirements:* E2E tests must exercise cascade/restrict behaviour for critical relationships

## Related Rules

- rules/nestjs.md - Backend module structure and service layer that consumes database entities
- rules/domain-driven-design.md - Domain modelling principles that inform schema design
- rules/architecture.md - System architecture and data flow between layers
- rules/clean-code.md - General code quality principles applied to migration files and raw SQL

## References

- [PostgreSQL Official Documentation — Data Types](https://www.postgresql.org/docs/current/datatype.html)
- [PostgreSQL Official Documentation — Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL Official Documentation — Indexes](https://www.postgresql.org/docs/current/indexes.html)
- [PostgreSQL Official Documentation — Date/Time Types](https://www.postgresql.org/docs/current/datatype-datetime.html)
- [PostgreSQL Wiki — Don't Do This](https://wiki.postgresql.org/wiki/Don%27t_Do_This)
- [PostgreSQL Wiki — Performance Optimization](https://wiki.postgresql.org/wiki/Performance_Optimization)

---

## TL;DR

*Key Principles:*
- Use the database's type system and constraints to enforce correctness — don't rely on the application alone
- Be explicit about names, types, nullability, and referential actions — never accept silent defaults
- Follow PostgreSQL idioms: `snake_case`, `text` over `varchar`, `timestamptz` always, `NOT NULL` by default

*Critical Rules:*
- Must use `snake_case` for all identifiers and plural table names
- Must use `timestamptz`, never bare `timestamp`
- Must use `text` over `varchar(n)` unless a hard limit is a real domain constraint
- Must add `NOT NULL` to every column unless `NULL` has defined meaning
- Must explicitly name all constraints and specify `ON DELETE` on foreign keys
- Must index every foreign key column

*Quick Decision Guide:*
When in doubt: add the constraint now — removing a constraint is easy, adding one to a populated table is hard.
