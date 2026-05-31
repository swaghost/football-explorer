# Project Documentation Index

This folder contains comprehensive documentation for the Angular D3UIV6 application features and implementations.

## 📋 Documentation Files

### Core Features

1. **[Operation Modes Implementation](./operation-modes-implementation.md)**

   - Configurable operation modes system for D3UIV6
   - Workflow-specific toolbar configurations
   - Bottom toolbar mode switching interface
   - Angular signals-based state management

2. **[Team Group Toolbar Management](./team-group-toolbar-management.md)**
   - Automatic toolbar visibility management
   - Team and team group selection logic
   - User experience flow and behaviors
   - State-driven toolbar show/hide functionality

### Architecture Documentation

3. **[BaseToolbarComponent Architecture](./base-toolbar-architecture.md)** _(Coming Soon)_

   - Shared toolbar component foundation
   - Migration patterns for existing toolbars
   - Common functionality and inheritance model

4. **[NGXS State Management](./ngxs-state-management.md)** _(Coming Soon)_
   - State structure and management patterns
   - Store configuration and setup
   - State actions and selectors documentation

### Implementation Guides

5. **[Toolbar Migration Guide](./toolbar-migration-guide.md)** _(Coming Soon)_

   - Step-by-step toolbar migration process
   - BaseToolbarComponent integration
   - Common patterns and best practices

6. **[Development Setup](./development-setup.md)** _(Coming Soon)_
   - Project setup and build configuration
   - Development server setup
   - Build optimization and deployment

## 🔄 Documentation Standards

### File Naming Convention

- Use kebab-case for file names (e.g., `team-group-toolbar-management.md`)
- Include descriptive names that clearly indicate the feature/topic
- Use `.md` extension for all documentation files

### Content Structure

Each documentation file should include:

- **Overview**: Brief description of the feature/implementation
- **Implementation Details**: Technical specifics and code examples
- **Usage**: How to use or interact with the feature
- **Benefits**: Advantages and value provided
- **Future Enhancements**: Planned improvements or extensions

### Code Examples

- Include relevant TypeScript/Angular code snippets
- Use proper syntax highlighting with \`\`\`typescript blocks
- Provide context for code examples (file locations, line numbers)
- Include both implementation and usage examples

### Cross-References

- Link to related documentation files using relative paths
- Reference specific code files and line numbers when applicable
- Maintain bidirectional links between related features

## 🏗️ Project Architecture Overview

### Technology Stack

- **Framework**: Angular 18+ (Standalone Components)
- **State Management**: NGXS with full store implementation
- **Styling**: SCSS with component-scoped styles
- **Visualization**: D3.js and P5.js libraries
- **Build**: Angular CLI with TypeScript compilation

### Key Architectural Patterns

- **Component Inheritance**: BaseToolbarComponent for shared functionality
- **Reactive State**: Angular signals for efficient change detection
- **Service-Oriented**: Centralized business logic in Angular services
- **Configuration-Driven**: JSON-based feature configuration

### Project Structure

```
src/app/
├── components/
│   ├── main/dr-ui-vers6/          # Main application component
│   ├── toolbars/                  # Draggable toolbar components
│   ├── dialogs/                   # Modal dialog components
│   └── shared/                    # Shared/base components
├── services/                      # Angular services
├── state/                         # NGXS state management
├── interfaces/                    # TypeScript type definitions
├── config/                        # Configuration files
└── styles/                        # Global SCSS styles
```

## 📝 Contributing to Documentation

### Adding New Documentation

1. Create new `.md` files in this `DOCUMENTATION` folder
2. Follow the established naming conventions
3. Update this index file with the new documentation
4. Include cross-references to related documentation

### Updating Existing Documentation

1. Keep documentation in sync with code changes
2. Update version information and timestamps
3. Maintain backward compatibility notes when applicable
4. Review and update cross-references

### Documentation Review Process

1. Ensure technical accuracy of all code examples
2. Verify that all links and references work correctly
3. Check for clarity and completeness of explanations
4. Validate that examples are up-to-date with current implementation

---

**Last Updated**: October 19, 2025  
**Documentation Maintainer**: Project Development Team
