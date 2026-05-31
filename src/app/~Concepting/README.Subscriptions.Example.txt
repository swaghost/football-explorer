# D3UIV6 Subscription Tiers - Based on Actual Features

## Recommended Subscription Model

### 🆓 **FREE TIER** - "Personal Space"
**Target**: Individual users, students, personal learning
**Monthly Price**: $0
**Features**:
- ✅ Single organization (Personal space only)
- ✅ Basic tree visualization with pan & zoom
- ✅ 1 team maximum
- ✅ Up to 20 players total
- ✅ Basic drawing tools (pencil only, 3 colors)
- ✅ Node viewer toolbar
- ✅ Zoom controls
- ✅ Light/dark theme toggle
- ✅ Basic node selection and editing
- ❌ Multi-organization support
- ❌ Advanced drawing tools (eraser, lasso)
- ❌ Team groups/rosters
- ❌ Lessons system
- ❌ Skills radar
- ❌ Datasets management
- ❌ Quick navigation
- ❌ Search functionality

### 💪 **PRO TIER** - "Coach Edition"
**Target**: Individual coaches, small clubs, freelance trainers
**Monthly Price**: $19/month
**Features**:
- ✅ **All Free features**
- ✅ Up to 3 organizations
- ✅ Unlimited teams per organization
- ✅ Up to 200 players total
- ✅ Full drawing tools suite (pencil, eraser, lasso)
- ✅ Complete color palette
- ✅ Variable brush and eraser sizes
- ✅ Magic and normal eraser modes
- ✅ Team roster management
- ✅ Team groups (Starting XI, Substitutes)
- ✅ Player management with jersey numbers
- ✅ Lessons system (create, edit, assign)
- ✅ Skills radar charts
- ✅ Quick navigation toolbar
- ✅ Search functionality
- ✅ Node list toolbar
- ✅ All visualization options
- ✅ Toolbar customization (drag, lock, position)
- ✅ Tree rotation controls
- ❌ Unlimited organizations
- ❌ Default team groups templates
- ❌ Advanced datasets management
- ❌ Decision flows

### 🏢 **ENTERPRISE TIER** - "Organization Level"
**Target**: Large clubs, academies, schools, enterprises
**Monthly Price**: $99/month
**Features**:
- ✅ **All Pro features**
- ✅ Unlimited organizations
- ✅ Unlimited teams and players
- ✅ Full multi-tenancy support
- ✅ Default team groups templates
- ✅ Advanced datasets management
- ✅ Decision flows and workflows
- ✅ Advanced role management (Administrator, Coach, Player, Parent)
- ✅ Tenancy toolbar with organization switching
- ✅ Status panel with system analytics
- ✅ Viewport information toolbar
- ✅ Advanced team group management
- ✅ All toolbar features unlocked
- ✅ Priority email support
- ✅ Training and onboarding assistance

## Feature Gating by Tier

### Toolbar Access Control
- **FREE**: Drawing Tools (limited), Lessons (view only), Node Viewer, Zoom Controls, Visualization Options
- **PRO**: All toolbars except Tenancy, Datasets, Status Panel, Default Team Groups
- **ENTERPRISE**: All toolbars unrestricted

### Drawing Tools Limitations
- **FREE**: Pencil only, 3 basic colors, fixed brush size
- **PRO**: Full drawing suite, all colors, variable sizes
- **ENTERPRISE**: All features plus advanced related node modes

### Team Management Limits
- **FREE**: 1 team, 20 players, no team groups
- **PRO**: Unlimited teams, 200 players, basic team groups
- **ENTERPRISE**: Unlimited everything, advanced group templates

### Data & Content Limits
- **FREE**: No lessons creation, no datasets
- **PRO**: Full lessons system, basic datasets
- **ENTERPRISE**: Advanced datasets, decision flows, unlimited content

### Organization Limits
- **FREE**: Personal space only (TenantID: 0)
- **PRO**: Up to 3 organizations
- **ENTERPRISE**: Unlimited organizations with full multi-tenancy

## Technical Implementation Notes

### Feature Flag Structure
```typescript
interface SubscriptionFeatures {
  maxOrganizations: number;
  maxTeamsPerOrg: number;
  maxPlayers: number;
  drawingTools: {
    pencil: boolean;
    eraser: boolean;Action Mode
    lasso: boolean;
    colorPalette: string[];
    variableBrushSize: boolean;
  };
  toolbars: {
    tenancy: boolean;
    datasets: boolean;
    statusPanel: boolean;
    skillsRadar: boolean;
    quickNav: boolean;
    search: boolean;
    defaultTeamGroups: boolean;
  };
  teamManagement: {
    teamGroups: boolean;
    playerJerseyNumbers: boolean;
    defaultTemplates: boolean;
  };
  content: {
    lessonsCreate: boolean;
    lessonsView: boolean;
    datasets: boolean;
    decisionFlows: boolean;
  };
}
```

### Current Subscription Mapping
- **FREE**: Maps to existing TenantID: 0 ("Personal")
- **PRO**: New tier between Personal and Enterprise functionality  
- **ENTERPRISE**: Maps to existing enterprise-level features

## Possible Areas of Development for Enterprise Confidence

### Data & Analytics
- **Usage Analytics Dashboard**: Track feature usage, user engagement, team performance
- **Custom Reports**: Generate detailed reports on team statistics, player progress
- **Data Export**: CSV, PDF, Excel export capabilities for all data
- **Backup & Restore**: Automated data backup with point-in-time recovery

### Integration & API
- **REST API**: Full API access for custom integrations
- **Webhooks**: Real-time notifications for events (team updates, lesson completions)
- **Single Sign-On (SSO)**: SAML, OAuth integration with enterprise identity providers
- **Third-party Integrations**: Connect with existing sports management systems

### Advanced Security
- **Audit Logs**: Complete activity tracking for compliance requirements
- **Data Encryption**: End-to-end encryption for sensitive data
- **IP Restrictions**: Limit access to specific IP ranges
- **Two-Factor Authentication**: Enhanced security for admin accounts

### Customization & White-label
- **Custom Branding**: Upload logos, customize colors, white-label interface
- **Custom Fields**: Add organization-specific data fields for teams/players
- **Custom Workflows**: Create custom decision flows and processes
- **Custom Roles**: Define organization-specific user roles and permissions

### Enterprise Management
- **Bulk Operations**: Bulk import/export of teams, players, lessons
- **Organization Templates**: Pre-configured setups for common use cases
- **Multi-level Administration**: Hierarchical admin structure for large organizations
- **Service Level Agreements**: Guaranteed uptime, response times

### Advanced Features
- **Mobile App**: Dedicated iOS/Android apps for coaches and players
- **Offline Mode**: Work without internet connection, sync when online
- **Real-time Collaboration**: Multiple users editing simultaneously
- **Version Control**: Track changes to lessons, team configurations over time
- **Advanced Visualizations**: Additional chart types, custom visualization options

### Professional Services
- **Implementation Consulting**: Help with initial setup and configuration
- **Training Programs**: Comprehensive training for administrators and end users
- **Custom Development**: Bespoke features for specific enterprise needs
- **Dedicated Support**: Direct phone support, dedicated account manager