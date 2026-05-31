# Ownership Context Permissions Documentation

## Overview

This document outlines the ownership context-based permission system implemented throughout the application. The system controls access to various features based on user roles and the ownership context of data entities.

## Ownership Context Hierarchy

The application uses a three-tier ownership context system:

1. **SYSTEM** (TENANT/-1) - Global system resources
2. **TENANT** (TENANT/orgId) - Organization-specific resources
3. **TEAM** (TEAM/teamId) - Team-specific resources

### Special Context Types

- **PERSONAL** (TENANT/0) - Personal workspace resources

## User Roles and IDs

| Role ID | Role Name                  | Description                                       |
| ------- | -------------------------- | ------------------------------------------------- |
| 99      | Developer                  | Highest level access, can perform all operations  |
| 1       | Administrator              | System administrator with broad access            |
| 6       | Tenant Admin               | Administrator for specific tenant/organization    |
| 9       | Sporting Architect         | Strategic planning and development (tenant-level) |
| 10      | Director of Coaching (DOC) | Coaching oversight and development (tenant-level) |
| 11      | Club Director              | Overall club management (tenant-level)            |
| 7       | Team Manager               | Manager for specific team operations              |
| 8       | Tenant Registrar           | Registration management for tenant                |
| 2       | Coach                      | Coaching staff with team-level access             |
| 3       | Player                     | Player with limited access                        |
| 4       | Parent                     | Parent/guardian with limited access               |
| 5       | Member                     | General member with basic access                  |
| 0       | Personal Space             | Personal workspace access                         |

### 🏆 Tenant-Level Management Roles

The following roles have been added to provide specialized management capabilities at the tenant (organization) level, with permissions equivalent to **Tenant Admin**:

- **Sporting Architect (9)**: Focuses on strategic sporting development, long-term planning, and organizational structure within the sporting context
- **Director of Coaching (DOC) (10)**: Oversees all coaching activities, coach development, and coaching methodology across the organization
- **Club Director (11)**: Provides overall club/organization management, strategic oversight, and administrative leadership

These roles enable specialized management structures while maintaining consistent permission levels for tenant-scoped operations.

## Feature Permissions Matrix

### 🗂️ Dataset Management

#### **View Datasets**

All authenticated users can view datasets according to tenant filtering:

- Always visible: SYSTEM datasets (TENANT/-1)
- Visible when organization selected: TENANT datasets (TENANT/orgId)
- Visible when team selected: TEAM datasets (TEAM/teamId)

#### **Edit Dataset** ✏️

Modify dataset name and description

| Ownership Context     | Allowed Roles                                                                                                                          |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| SYSTEM (TENANT/-1)    | Developer (99), Administrator (1)                                                                                                      |
| TENANT (TENANT/orgId) | Developer (99), Administrator (1), Tenant Admin (6), Sporting Architect (9), DOC (10), Club Director (11)                              |
| TEAM (TEAM/teamId)    | Developer (99), Administrator (1), Tenant Admin (6), Sporting Architect (9), DOC (10), Club Director (11), Team Manager (7), Coach (2) |

#### **Delete Dataset** 🗑️

Permanently remove datasets

| Ownership Context | Allowed Roles                                                                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| SYSTEM (SYS)      | Developer (99), Administrator (1)                                                                                                      |
| TENANT            | Developer (99), Administrator (1), Tenant Admin (6), Sporting Architect (9), DOC (10), Club Director (11)                              |
| TEAM              | Developer (99), Administrator (1), Tenant Admin (6), Sporting Architect (9), DOC (10), Club Director (11), Team Manager (7), Coach (2) |

#### **Promote Dataset** ⬆️

Move datasets to higher ownership level

| Source → Target | Allowed Roles                                                                                             |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| TEAM → TENANT   | Developer (99), Administrator (1), Tenant Admin (6), Sporting Architect (9), DOC (10), Club Director (11) |
| TENANT → SYSTEM | Developer (99), Administrator (1)                                                                         |

#### **Demote Dataset** ⬇️

Move datasets to lower ownership level

| Source → Target       | Allowed Roles                                                                                             |
| --------------------- | --------------------------------------------------------------------------------------------------------- |
| SYSTEM (SYS) → TENANT | Developer (99), Administrator (1)                                                                         |
| TENANT → TEAM         | Developer (99), Administrator (1), Tenant Admin (6), Sporting Architect (9), DOC (10), Club Director (11) |

_Note: TEAM datasets cannot be demoted further_

#### **Combine Datasets** 🔗

Create new datasets by combining existing ones

**Creation Permissions by Target Ownership Context:**

| Target Context | Allowed Roles                                                                                             |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| SYSTEM         | Developer (99), Administrator (1)                                                                         |
| TENANT         | Developer (99), Administrator (1), Tenant Admin (6), Sporting Architect (9), DOC (10), Club Director (11) |
| TEAM           | All roles (when team is selected)                                                                         |

#### **Breakout Dataset** 🎯

Create new dataset from selected node and its children

- **Requirement**: A node must be selected and have children
- **Permissions**: Follow the same rules as "Combine Datasets" based on target ownership context

#### **Create New Dataset** ➕

Create entirely new datasets

**Creation Permissions by Target Ownership Context:**

| Target Context | Allowed Roles                                                                                             |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| SYSTEM         | Developer (99), Administrator (1)                                                                         |
| TENANT         | Developer (99), Administrator (1), Tenant Admin (6), Sporting Architect (9), DOC (10), Club Director (11) |
| TEAM           | All roles (when team is selected)                                                                         |

### 🏗️ Default Team Groups

Default Team Groups follow similar ownership context patterns but have their own specific implementations:

#### **View Default Team Groups**

- **SYSTEM Groups**: Available as templates to all users
- **TENANT Groups**: Visible to users within the specific organization
- **TEAM Groups**: Visible to users within the specific team

#### **Create Default Team Groups**

Based on target ownership context, following similar patterns to dataset creation.

#### **Copy System Templates**

Users can copy SYSTEM-level default team groups as templates for their organization or team.

## Data Filtering Rules

### Tenant-Controlled Filtering

The application implements strict tenant-controlled filtering:

1. **Always Include**: SYSTEM resources (TENANT/-1)
2. **Conditionally Include**:
   - TENANT resources when organization is selected
   - TEAM resources when team is selected
3. **Never Include**: Resources from other tenants or teams

### Context Inheritance

- Users with higher-level roles can access lower-level contexts
- Users with lower-level roles cannot access higher-level contexts
- Team-specific roles (Coach, Team Manager) have access to team resources but not tenant or system resources (unless they also have higher roles)

## Implementation Notes

### Role Hierarchy

The system does not implement a strict role hierarchy. Instead, permissions are granted explicitly for each operation and ownership context combination.

### Multi-Role Support

Users can potentially have multiple roles, and the system checks for any qualifying role when determining permissions.

### Error Handling

When users attempt unauthorized operations:

- Buttons/controls are disabled preventively
- Backend validation should also enforce these permissions
- User-friendly error messages explain insufficient permissions

## Security Considerations

### Defense in Depth

- Frontend controls provide immediate user feedback
- Backend validation must enforce the same permission rules
- Database constraints should prevent unauthorized data access

### Permission Caching

- Permissions are calculated in real-time based on current user role and selected contexts
- No permission caching is implemented to ensure immediate updates when contexts change

### Audit Trail

Consider implementing audit logging for:

- Dataset promotions/demotions
- Dataset deletions
- Cross-context operations

## Development Guidelines

### Adding New Features with Ownership Context

When implementing new features that should respect ownership contexts:

1. **Define Permission Matrix**: Create a clear matrix of which roles can perform which operations on which ownership contexts
2. **Implement Permission Methods**: Create `canX()` methods following the established patterns
3. **Frontend Controls**: Disable buttons/controls when permissions are insufficient
4. **Backend Validation**: Ensure server-side validation matches frontend permissions
5. **User Feedback**: Provide clear tooltips/messages explaining permission requirements

### Permission Method Patterns

```typescript
canPerformOperation(entity: EntityWithOwnershipContext): boolean {
  if (!entity || !this.currentUserRoleId) {
    return false;
  }

  const context = entity.OwnershipContext;
  const roleId = this.currentUserRoleId;

  // SYSTEM context permissions
  if (context.ContextName === 'TENANT' && context.Context === -1) {
    return roleId === 99 || roleId === 1; // Developer or Administrator
  }

  // TENANT context permissions
  if (context.ContextName === 'TENANT' && context.Context !== -1) {
    return roleId === 99 || roleId === 1 || roleId === 6; // + Tenant Admin
  }

  // TEAM context permissions
  if (context.ContextName === 'TEAM') {
    return roleId === 99 || roleId === 1 || roleId === 6 || roleId === 7 || roleId === 2; // + Team Manager, Coach
  }

  return false;
}
```

## Future Enhancements

### Planned Features

- Role-based dashboard customization
- Advanced permission inheritance
- Time-based permissions (temporary access)
- Permission delegation

### Considerations

- Performance optimization for permission checking
- Internationalization of permission error messages
- Integration with external authentication systems
- Advanced audit logging and compliance reporting

---

_Last Updated: October 16, 2025_  
_Document Version: 1.0_
