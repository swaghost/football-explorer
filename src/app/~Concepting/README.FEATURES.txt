# D3UIV6 Available Features

## Toolbars (Can be shown/hidden, dragged, locked/unlocked)

### Drawing Tools Toolbar
- **Drawing Modes**: Pan, Pencil, Eraser, Select, Lasso, Select Children, Related Nodes
- **Color Palette**: Multiple drawing colors available
- **Brush Size**: Slider control (1-20px)
- **Eraser Modes**: Magic Eraser (removes entire segments), Normal Eraser (partial removal)
- **Eraser Size**: Slider control (5-50px)
- **Lasso Modes**: Select mode, Deselect mode
- **Related Node Options**: Direction (descendants), Mode (selection)

### Lessons Toolbar
- **Lessons Management**: Create, edit, view lessons
- **Lesson Selection**: Choose active lesson

### Selected Nodes Toolbar
- **Node Operations**: Actions on currently selected nodes

### Node Viewer Toolbar
- **Node Details**: View detailed information for selected node

### Skills Radar Toolbar
- **Skills Assessment**: Visual radar chart for skill evaluation

### Rotation Control Toolbar
- **360° Rotation**: Rotate entire tree visualization

### Quick Nav Toolbar
- **Tree Navigation**: Minimap-style navigation
- **Follow Mode**: Auto-follow selected nodes

### Search Toolbar
- **Node Search**: Find nodes by name or properties

### Teams Toolbar
- **Team Management**: Create, edit, delete teams
- **Team Selection**: Choose active team

### Tenancy Toolbar
- **Organization Management**: Switch between organizations/tenants
- **Role Selection**: Choose user role

### Team Roster Toolbar
- **Player Management**: View and manage team players

### Team Group Members Toolbar
- **Group Management**: Manage team sub-groups (Starting XI, Substitutes)

### Default Team Groups Toolbar
- **Template Management**: Manage default team group templates

### Datasets Toolbar
- **Dataset Management**: Switch between different data sets
- **Decision Flows**: Manage decision flow workflows

### Status Panel Toolbar
- **System Status**: View current system status and statistics

### Zoom Controls Toolbar
- **Zoom In/Out**: Control visualization zoom level
- **Reset Zoom**: Return to default zoom

### Viewport Info Toolbar
- **Coordinates**: Display current viewport position and zoom level

### Visualization Options Toolbar
- **Display Settings**: Customize visualization appearance

### Nodes List Toolbar
- **Node Listing**: Comprehensive list of all nodes with search

## Dialogs (Pop-up when triggered)

### Player Management Dialogs
- **Add Player Dialog**: Add new player to team
- **Edit Player Dialog**: Modify player information
- **Delete Player Dialog**: Remove player from team

### Team Management Dialogs
- **Create Team Dialog**: Add new team to organization
- **Edit Team Dialog**: Modify team information
- **Delete Team Dialog**: Remove team from organization

### Team Group Dialogs
- **Create Team Group Dialog**: Add new sub-group to team
- **Edit Team Group Dialog**: Modify team group information
- **Delete Team Group Dialog**: Remove team group

### Default Team Groups Dialog
- **Add Default Team Groups Dialog**: Add template team groups

### Lesson Management Dialogs
- **Create Lesson Dialog**: Add new lesson
- **Edit Lesson Dialog**: Modify lesson content

### Dataset Management Dialogs
- **Create Dataset Dialog**: Add new dataset

### Confirmation Dialog
- **Generic Confirmation**: Confirm destructive actions

## Tree Visualization Features

### Core Visualization
- **D3.js Tree**: Interactive tree structure
- **Pan & Zoom**: Navigate large trees
- **Node Selection**: Single and multi-node selection
- **Node Creation**: Add new nodes to tree
- **Node Editing**: Modify node properties

### Drawing & Annotation
- **Freehand Drawing**: Draw over visualization
- **Multiple Colors**: Color palette for drawings
- **Variable Brush Size**: Adjustable stroke width
- **Eraser Tool**: Remove drawings (normal and magic modes)
- **Lasso Selection**: Advanced selection tool
- **Drawing Layers**: Drawings appear over tree

### Display Options
- **Dark/Light Theme**: Toggle between themes
- **Rotation**: 360-degree tree rotation
- **Viewport Information**: Real-time coordinates
- **Visualization Customization**: Various display options

## Team & Organization Features

### Multi-Tenancy
- **Organization Switching**: Support for multiple organizations
- **Tenant Isolation**: Data separation between organizations

### Team Management
- **Team Creation**: Add teams to organizations
- **Team Editing**: Modify team information
- **Team Deletion**: Remove teams
- **Team Selection**: Choose active team

### Player Management
- **Player Addition**: Add players to teams
- **Player Editing**: Modify player information
- **Player Assignment**: Assign players to team groups
- **Jersey Numbers**: Manage player jersey numbers

### Team Groups
- **Sub-Groups**: Create groups within teams (Starting XI, Substitutes)
- **Group Management**: Edit and delete team groups
- **Player Assignment**: Move players between groups
- **Default Templates**: Use template group structures

### Roles & Permissions
- **User Roles**: Administrator, Coach, Player, Parent
- **Role-Based Access**: Different permissions per role

## Data Management

### Lessons System
- **Lesson Creation**: Create educational content
- **Lesson Management**: Edit and organize lessons
- **Lesson Assignment**: Assign lessons to users/teams

### Decision Flows
- **Workflow Creation**: Multi-step decision workflows
- **Flow Management**: Edit and organize flows

### Datasets
- **Multiple Datasets**: Switch between different data collections
- **Dataset Creation**: Add new datasets
- **Data Isolation**: Separate data per dataset

## System Features

### Toolbar Management
- **Show/Hide**: Toggle visibility of any toolbar
- **Drag & Drop**: Reposition toolbars anywhere on screen
- **Lock/Unlock**: Lock toolbars in place to prevent accidental movement
- **Collision Detection**: Smart positioning to avoid toolbar overlap

### Theme Support
- **Dark Mode**: Full dark theme support
- **Light Mode**: Default light theme
- **Theme Toggle**: Switch between themes

### State Management
- **NGXS State**: Centralized state management
- **Persistence**: State maintained across sessions
- **Undo/Redo**: Action history (where applicable)

### Responsive Design
- **Window Resize**: Automatic toolbar repositioning
- **Mobile Friendly**: Touch-optimized interface elements
- **Flexible Layout**: Adapts to different screen sizes

## Bottom Toolbar
- **Toggle Visibility**: Show/hide bottom toolbar
- **Additional Controls**: Secondary action buttons
- **Status Information**: System status indicators