# CRITICAL RULES - MUST FOLLOW

## RESPONSES

- Keep responses concise and to the point - unless the user asks otherwise

## PLANNING MODE

- Always ask clarifying questions
- Never assume design, tech stack or features
- Use deep-dive sub-agents to assist with research
- Use deep-dive sub-agents to review the different aspects of your plan before presenting to the user

## CHANGE / EDIT MODE

- Never implement features yourself when possible - use sub-agents!
- Identify changes from the plan that can be implemented in parallel, and use sub-agents to implement the features efficiently
- When using sub-agents to implement features, act as a coordinator only
- Use the best model for the task - premium models for complex tasks (like coding) and mid-tier models for simpler tasks, like documentation
- After completing features (large or small), always run commands like lint, type check and next build to check code quality

## DATABASE SCHEMA CHANGES

- Whenever you make changes to the database schema, ALWAYS run the drizzle generate and migrate commands
- NEVER run drizzle push!
- For all ID columns NOT related to BetterAuth, use UUID for the ID columns and be randomly generated

## TESTING

- Use any testing tools, libraries available to the project for testing your changes
- Never assume your changes simply work, always test!
- If the project does not have any testing tools, scripts, MCP tools, skills, etc. available for testing, ask the user whether testing should be skipped.

## UI DESIGN

- Always follow the UI design system when creating or reviewing components or pages.
- Design System: @DESIGN.md

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, invoke the `skill` tool with `skill: "graphify"` before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## WEDDING PLATFORM SPECIFIC RULES

- **Vocabulary**: Always use "Wedding Task Planner" instead of "Kanban Board" and "Wedding Ceremony Planner" instead of "Timeline" or "Rituals" across all routes, sidebar menus, onboarding steps, seeding files, and user-facing copy. Use "Ceremony" instead of "Itinerary Event" in all user-facing UI (buttons, dialogs, toast messages). Use "Manage Your Team" instead of "User Management".
- **Client Component State Synchronization**: When syncing props to local state in client components, **never** perform raw object or array reference comparisons (e.g. `wedding !== prevWedding` or `rituals !== prevRituals`). Parent re-renders and `router.refresh()` generate new references even if the properties are identical. Always compare unique identifiers or structural values (e.g. `wedding.id !== prevWedding.id` or deep property checks) to prevent local inputs from resetting.
- **Server Actions Body Limit**: Next.js Server Actions `bodySizeLimit` is configured at `50mb` in `next.config.ts`. Be mindful of this limit when sending base64-encoded file uploads or large payloads via server actions.
- **Coolify Deployment**: The application is configured to run on port `3044` inside the Docker container. Ensure PostgreSQL migrations are run automatically during container startup using the custom migration scripts.

