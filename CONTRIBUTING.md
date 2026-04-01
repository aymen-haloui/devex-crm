# Contributing

Thanks for helping improve the CRM project! Please follow these guidelines when submitting changes.

## Development
1. Install dependencies with `pnpm install`.
2. Create a feature branch off `main` with a descriptive name.
3. Add tests for any new functionality; the project uses Jest for unit tests (`__tests__` folder).
4. Run the full suite before committing:
   ```bash
   pnpm lint
   pnpm test
   pnpm build
   ```
5. Keep TypeScript errors and ESLint warnings to a minimum.

## Pull Requests
- Target the `main` branch.
- Include a clear description of what the change does and why.
- CI will run automatically via GitHub Actions; make sure the pipeline passes before merging.

## Coding style
- Follow existing code conventions (hooks prefix `use`, components in `components/`, etc.).
- Prefer small, composable pieces over large files.
- Be thoughtful with dependencies; avoid adding large libraries without justification.

Thank you!
