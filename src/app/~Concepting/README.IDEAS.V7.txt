-------------------------------
DISPLAY
-------------------------------
. Add a radial tree map as a display options.

. add a radial bar chart (star, single line) option to the skills radar 
. add a radial bar chart (bar plot)  option to the skills radar 

-------------------------------
NEW COMPONENT: ME (Dashboard)
-------------------------------
This is a global (not-tenant) view of everything I have going on.
- My Toolbox - These are long term nodes I consistently wish to review. 
- My Teams - a list of teams I'm attached to and the role (Coach, Player)
- My To-Learn These are lessons/nodes to review.
     
- My Geography (A map of where I live)
- My Skillset (Radial Bar Chart ...see CODE - D3 for example)


-------------------------------
IMPORT - Let's move back to modifying D3UIV6. 
-------------------------------
.Make sure EmailAddress and ContactPhone can be entered for a player player, by making sure the correct interfaces and the Add Player and Edit Player dialogs are modified correctly.


- create a new toolbar, the "IMPORT/EXPORT"  toolbar.
- Add the toolbar's toggle to the top toolbar and make sure it looks and operates the like the other toolbar in terms of open/close, drag, on/off, lock/unlock by inheriting the toolbar base component.
- Make sure the toolbar won't crash the app the first time it's brought up.
- It should also conform the light mode/dark mode.
- Make sure it generates no view checking errors.
- Make sure it adheres to the "toolbar rescue" CTRL+click

Add an "DOWNLOAD TEMPLATE" button which downloads a file called "ROSTER-TEMPLATE.csv" with the following header:
    - Last Name 
    - First Name 
    - Email address 
    - Contact Phone 
    - Positions
    - Jersey Number
    - Gender
    - Age Group 
    
1. Add an "IMPORT ROSTER" button which creates a dialog that allows me to import a roster via  uploading a file. The file should be validated, if any data does not match the above specifications nothing should be loaded from the file. The file should be in the following csv format:    
    - Last Name (required)
    - First Name (required)    
    - Email address (required)
    - Contact Phone (optional)
    - Positions (optional, pipe-separated)
    - Jersey Number (optional)
    - Gender (optional)
    - Age Group (optional)


2. The "IMPORT ROSTER" button should be disabled if there is no current team not selected. 

3. Add a "DOWNLOAD TEST FILE" button which create and downloads a mock roster that I can use to test the upload.

.Add a placeholder for check to see if this player exists in the system with a matching email address and phone. Right now it should return false (which allows a the player to be added.)
.Allow me to add a player from another team within the same organization. Give me a dialog which allows me to search among teams within the same orgization, or search by name across the whole organization.
.Create an new draggable toolbar called Import/Export
.Add it to the top toolbar and make sure it looks and operates the like the other toolbar in terms of open/close, drag, on/off, lock/unlock and inherits from the same base toolbar component.

.Add a button to export/download the team (with all team groups) as JSON. This should include the team information, roster, teamgroups and team group members.
.Add a button to import/upload the team from JSON. This should include the team information, roster, teamgroups and team group members.
    






Make the rader tree of sample data at start. An empty radar, but still with the radar part and legends. It should only have nodes when nodes are actually selected in the SelectedNode

--------------------------------------------------
Structural Fixes
--------------------------------------------------
c.if all instances of "export interface D3TreeNode extends d3.HierarchyPointNode<TreeNode>" result in identical interfaces make this a common declaration in "intefaces"


--------------------------------------------------
CSS Fixes
--------------------------------------------------
Unify the colors for nodes in the selectedNodes list into a variable of type "INodeStyle" interface that has text color, and node color.
Unify the color for the (individual) selectedNode into another variable of type "INodeStyle" interface that has text color, and node color.
Allow the user to choose the highlight color and text color of of the selectedNodes list o fnodes via two colorpickers.
Allow the user to choose the highlight color and text color of of the individual selectedNode via two colorpickers.
Add to the View/Effects toolbar a toggle control which adds the ability turn down the brightness of both the text and node color of unselected nodes. The the net effect is that when I choose a lesson, or add nodes, the brightness dims of anything not selected.


2. In the Node Viewer toolbar, add "Skip" and "Jump To" buttons. Skip should move past this lesson with no changes. 
3,  "Jump" should present me a dialog with a list of the selectedNodes and clicking them should advance to than node.


--------------------------------------------------
Zoom Up/Down
--------------------------------------------------


--------------------------------------------------
DATA SELECTION
--------------------------------------------------
- Create a DecisionFlow interface:

export interface DecisionFlow {
    FlowID?: number;
    OwnershipContext: OwnershipContext; 
    FlowName?: string | null;
    FlowDesc?: string | null;
    treeData: TreeNode;
}


- The MockDataCreator should create a list of DecisionFlows, 1 each for each organization having an ID of zero, and an ownership context of "ORG" and -1. This is the system level "generate random data" DecisionFlow. 
- When the page loads, load the DecisionFlows into state.
- Create a new "DATASETS" draggable toolbar. 
- Add the toolbar to the top toolbar and make sure it looks and operates the like the other toolbar in terms of open/close, drag, on/off, lock/unlock. 
- It should also conform the light mode/dark mode.
- Make sure the toolbar won't crash the app the first time it's brought up.
- Make sure it generates no view checking errors.
- It should work similar to the default Team Groups toolbar except that it shows a list of decision flows (data sets we use ) of interface type DecisionFlow, only those that are of ORG/-1 or ORG/Selected Org or if a team is selected the TEAM/selected team.

- If I click a DecisionFlow it uses that data and regenerates the chart.

The DataSet list should only contain items FROM ORG/-1 or ORG/[the selected org], or TEAM/[the selected team]

- each decision flow in the DecisionFlow structure should have an OwnershipContext (ContextName as string, and Context as number).
    If it's Context = "ORG" and -1, then it's a system level team group and can't be changed but it can be copied into an ORG team group and then edited.
    If it's Context = "ORG" and zero number then it's a personal default team group.

    If it's Context = "ORG" and non-zero number then it's an organization team group and it can be edited.
    If it's a context = "TEAM" and teamID then it was create for the team.
- For every organization there should be a DecisionFlow 0 (which generates random data and uses the current functionality), so if you see me select a decision flow zero, that should generate a tree with random data from this.generateTreeData(this.nodeCount) function. Otherwise it should use the data from within the flow.


--------------------------------------------------
NODE-PAINTER Toolbar
--------------------------------------------------
- create a new toolbar, the "NODE PAINTER"  toolbar.
- Add the toolbar to the top toolbar and make sure it looks and operates the like the other toolbar in terms of open/close, drag, on/off, lock/unlock. 
- Make sure the toolbar won't crash the app the first time it's brought up.
- It should also conform the light mode/dark mode.
- Make sure it generates no view checking errors.
- Add a button to add a child to the selected node via a dialog (supplying name, and description). It should be called "Add Child" and only be enabled if a node is selected. 
- Add a button to reparent (move) a selected node (supply the nodeid to which the selected node should be attached.) It should be called "Reparent Node" and  should only be enabled if a node is selected

- Add a button to insert a node (that is, add a node between a child and it's parent.) It should be called "Insert Between" and should only be enabled if a node is selected
- Add a button to "promote" a node (that is, make it the sibling of it's parent).It should be called "Promote Node" and should only be enabled if a node is selected
- Add a button to delete a selected child (and all it's children, with an OK/Cancel warning that it has children). It should called "Delete" and only be enabled if a node is selected.

- Add a "Create New Chart" icon button which when clicked allows you to create a new decision flow with just a root node. This button is always available.
- Add a "Breakout" button which allows you to take the selected node and and break it and all it's children out into a new smaller drawing by copying all the nodes from the node on downward into a new decision flow. 
    It asks for a name, and the ownership context and then creates the tree data. It should only be enabled if a node is selected.


0. The "ORG" ownership context should be changed to "TENANT" to get rid of org references in favor TENANT. Make all the changes so that it recognizes "TENANT" rather than "ORG" for ownership-context sensitive logic.

1. Add roles "Tenant Admin" and "Developer".  A Tenant Admin has special abilities for the tenant which I will specify later, but not system administrator functions. Developer (me) can do anything, it's a level higher than tenant admin.

2. Add a button within the datasets toolbar called "Breakout Into New" that allows me to copy the selectedNode as root and all of it's children into new dataset. This button should only be disabled when a node is selected as the selectedNode, and it has children.  It should pop the "Create Dataset" dialog before, and finish by adding the new dataset with the specified data copied from the previous tree. When it's created it should switch to the new dataset.

2. Add a button called "Promote" within the datasets toolbar, 
    when a dataset is selected and it's ownership context is "TEAM", then I can make it a 'TENANT' dataset for the current TENANT.  Use the confirmation dialog to ask "Are you sure you want to promote this to a TENANT dataset? This is an administrator function.".  This buttons is only available if the user is in role "Developer" or "Administrator"
    when a dataset is selected and it's ownership context is "TEAM", this button is enabled if the user is in role "Developer", "Administrator", "Tenant Administrator" (but nothing else)

    when a dataset is selected and it's ownership context is "TENANT", then I can make it a 'SYSTEM' dataset.  Use the confirmation dialog to ask "Are you sure you want to promote this from a TENANT dataset to a SYSTEM dataset? This is an administrator function.".  This buttons is only available if the user is in role "Developer" or "Administrator"
    when a dataset is selected and it's ownership context is "TENANT", this buttons is enabled if the user is in role "Developer" or "Administrator" (but nothing else)

    
3. Add a button called "Demote", when a dataset is selected and it's ownership context is system, then I can make it an tenante node for the selected tenant. Use the confirmation dialog to ask "Are you sure you want to demote this dataset to a tenant dataset? This is an administrator function." 
    when a dataset is selected and it's ownership context is "SYSTEM", then I can make it a 'TENANT' dataset.  Use the confirmation dialog to ask "Are you sure you want to DEMOTE this from a SYSTEM dataset to a TENANT dataset? This is an administrator function.".  This buttons is only available if the user is in role "Developer" or "Administrator"
    
    when a dataset is selected and it's ownership context is "TENANT", then I can make it a 'TEAM' dataset for the current TEAM.  Use the confirmation dialog to ask "Are you sure you want to DEMOTE this to a TEAM dataset for [Team Name]? This is an administrator function.".  This buttons is only available if the user is in role "Developer" or "Administrator" or "Tenant Admin". If the no team is selected then pop an OK dialog saying "To demote a TENANT dataset to a team, you must have a team selected."

    when a dataset is selected and it's ownership context is "TEAM", this buttons is disabled.


4. Add a button called "Delete", when a dataset is selected...
     - When it's ownership context is system, then I can delete it if it's an DEVELOPER OR ADMINISTRATOR. 
     - When it's ownership context is TEANNT, then I can delete it if it's an DEVELOPER OR ADMINISTRATOR  OR TENANT ADMIN. 
     - When it's ownership context is system, then I can delete it if it's an DEVELOPER OR ADMINISTRATOR  OR TENANT ADMIN OR TEAM ADMIN OR TEAM MANAGER OR COACH 
     Use the confirmation dialog to ask "Deleting a datset is unrecoverable. Are you sure you want to delete this dataset? This is an administrator function."

C. Add a another button called "Combine", this will require a new dialog box that allows me enter a name and an ownership context and also to pick  more than one dataset from the list of accessible datasets  and create a new dataset that has a common root node with the child datasets root as children of the new root. All the nodes should be renumbered but keep their name and description.

C. Add me an edit button on each dataset row, this will allow me to edit the name and description of the dataset.
     - When it's ownership context is SYSTEM, then I can edit it if it's an DEVELOPER OR ADMINISTRATOR. 
     - When it's ownership context is TENANT, then I can edit it if it's an DEVELOPER OR ADMINISTRATOR  OR TENANT ADMIN. 
     - When it's ownership context is TEAM, then I can edit  it if it's an DEVELOPER OR ADMINISTRATOR  OR TENANT ADMIN OR TEAM ADMIN OR TEAM MANAGER OR COACH 



--------------------------------------------------
BREADCRUMB
--------------------------------------------------
. Extract the breadcrumb element into it's own shared component.
. make sure it's links are clickable
. make sure it adheres to light and dark mode.
. make sure it takes a list of elements with an id and a name.
. make sure i can toggle whether elements generally are clickable and that it generates a click even other components can respond to.
. It's still white. Maybe i just can't see it, but it appears that class div.breadcrumb-container and span.breadcrumb-item and span.breadcrumb item aren't applying styles correctly. Since that control is in the bottom toolbar it can ignore light mode dark mode, just make sure it's a slightly lighter blue than the toolbar, and that's the font is white for the text and separator.
--------------------------------------------------
MORE NAVIGATION CHANGES
--------------------------------------------------
C. Within the Quick-Nav toolbar, when the selectedNode changes and the quick-nav toolbar is open, expand the quick-nav to that node and focus (move the scrolling) to that node. It should follow the selection. Also if it is newly-opened and a selectedNode is in place, scroll to that node. 
C.Make sure this doesn't impact performance when it's closed. Add an element to turn on/off the "Quick-Nav Follow in Item List" in the View/Effects toolbar.

C. Node-List toolbar, when the selectedNode changes and the node list toolbar is open, scroll to the selected node and highlight it. It should follow the selection, but only if it's open. Also if it is newly-opened and a selectedNode is in place, scroll to that node.
C.Make sure this doesn't impact performance when it's closed. Add an element to turn on/off the "Node List Follow in Item List" in the View/Effects toolbar.
-------------------------
LESSONS VIEW
-------------------------
.When in autopilot mode? When I click any of the node-viwer buttons except finish or quit, hide the node-viweer while the main tree diagram is transitioning between nodes.


-------------------------
TENANCY
-------------------------
add to the organization interface the concept of a 

Add an Role interface, which will apply to my organization entries (which are treated like tenants in a multi-tenant application)

export interface Roles {
    RoleID: number;
    RoleName: string;
}

add a test data role list: 

0 / Personal Space
1 / Administrator
2 / Coach
3 / Player
4 / Parent
5 / Member

Change the Organization interface so it has the following: 

export interface Organization {
  OrgID: number;
  OrgName: string;
  UserID: number;
  UserFirstName: string;
  UserLastName: string;
  RoleID: number;
  RoleName: string;
  Teams: Team[]; // List of team objects in this organization
}

In my test data add to each organization the userID 7, the userFirstName = "Scott", the userLastName = "Assenheimer". All Organization entries should be "Coach" (role 2) except Organization 0 (Personal) which also has role 1 (Administrator)

This next change will separate the ORGANIZATION dropdown from the TEAMS toolbar into it's own TENANCY toolbar.
Create another new toolbar call "TENANCY", this should exist in a hamburger menu all the way to the left side of the top toolbar.
    - Add it to the top toolbar and make sure it looks and operates the like the other toolbar in terms of open/close, drag, on/off, lock/unlock.
    - It should reside all the way to the left in the top toolbar, and have a three-horizontal-lines hamburger icon.
    - I want to make sure the toolbar shows up the first time it's used. It should default to the middle of the screen until I move it.
    - When this is complete remove the Organization selector from the TEAMS toolbar.
    - Popping this toolbar allows me to select my organization, kind of a like an open checkbox list.  It shows me a list of all the tenants, with the actively selected one having a green checkmark next to it. Clicking on an entry allows me to change the tenant (the organization).
    - Each entry should have three lines:
 
        1. The Name: "Scott Assenheimer"
        2. The Organization: "Wauwatosa School District"
        3. The Role: "Coach"

-------------------------------
LESSON TOOLBAR
-------------------------------
In the LESSONS toolbar:
- Refactor the UI so that the LESSONS toolbar looks more like the DATASETS toolbar in that it displays as a list rather than a dropdown, with each entry having an ID, a name, description, and shows the ownership context and flow name it applies to. 
- Lessons are child objects of the ownership context and the flowID
- It should only allow selection of those that match the currently-selected dataset (FlowID) and TenantID. All other lessons that are visible aand that should not be selectable are disabled (and gray)
- Add filter checkkboxes to show SYSTEM / TENANT / TEAM lessons.
- If no DATASET is selected, or the selected dataset has no lessons for the dataset / tenant combination instead of the empty list show a text panel that says "No lessons exist for the filter specifications for this tenant and the selected dataset."
- Add the same filter to the DATASETS toolbar.


- it is possible to make changes to lesson selectedNodes without apply them to the lesson. I need some way to indicate unsaved node, and the apply button should become available the instant this condition occurs.
-  It is also possible to select a list of nodes with no lesson yet selected.  If there are unsaved changes, and no lesson is selected, then clicking apply should act like clicking "Create Lesson" (allowing me to create a lesson, before selecting that lesson as the selectedLesson and then applyingv the nodes to it and saving the changes.)

- Creating a new lesson needs to be able to select it's ownership context. 
- If I'm an admin or developer I can select system. If I'm not an administrator or developer then the "SYSTEM" option isn't shown.
- If I'm in these roles than I can add it to the tenant
   - Developer
    - Adminstrator
    - Tenant Admin    
    - Tenant Registrar
    - Sporting Architect
    - Director of Coaching (DOC)
    - Club Director
- if I'm in these roles and a team is selected then I can add it to the team.     
    Coach
    Team Manager
    Developer
    Adminstrator
    Tenant Admin    
    Tenant Registrar
    Sporting Architect
    Director of Coaching (DOC)
    Club Director
- I also need to be able to promote and demote similarly to how one can promote and demote a Dataset.    

-. Add a button called "Promote" within the LESSONS toolbar, 
    when a lesson is selected and it's ownership context is "TEAM", then I can make it a 'TENANT' LESSON for the current TENANT.  Use the confirmation dialog to ask "Are you sure you want to promote this to a TENANT lesson? This is an administrator function."/. this buttons is enabled if the user is in role    
    - Developer
    - Adminstrator
    - Tenant Admin    
    - Tenant Registrar
    - Sporting Architect
    - Director of Coaching (DOC)
    - Club Director


    when a lesson is selected and it's ownership context is "TEAM", this button is enabled if the user is in Roles    - Developer
    - Adminstrator
    - Tenant Admin    
    - Tenant Registrar
    - Sporting Architect
    - Director of Coaching (DOC)
    - Club Director

    when a lesson is selected and it's ownership context is "TENANT", then I can make it a 'SYSTEM' dataset.  Use the confirmation dialog to ask "Are you sure you want to promote this from a TENANT dataset to a SYSTEM dataset? This is an administrator function.".  This buttons is only available if the user is in role "Developer" or "Administrator". 
    
        

    
3. Add a button called "Demote", when a lesson is selected and it's ownership context is system, then I can make it an tenante node for the selected tenant. Use the confirmation dialog to ask "Are you sure you want to demote this dataset to a tenant dataset? This is an administrator function." 
    when a lesson is selected and it's ownership context is "SYSTEM", then I can make it a 'TENANT' dataset.  Use the confirmation dialog to ask "Are you sure you want to DEMOTE this from a SYSTEM dataset to a TENANT dataset? This is an administrator function.".  This buttons is only available if the user is in role "Developer" or "Administrator"
        
    when a lesson is selected and it's ownership context is "TENANT", then I can make it a 'TEAM' dataset for the current TEAM.  Use the confirmation dialog to ask "Are you sure you want to DEMOTE this to a TEAM dataset for [Team Name]? This is an administrator function.".   If the no team is selected then pop an OK dialog saying "To demote a TENANT dataset to a team, you must have a team selected."
    This buttons is only available if the user is in roles
        - Adminstrator
        - Tenant Admin    
        - Tenant Registrar
        - Sporting Architect
        - Director of Coaching (DOC)
        - Club Director
    when a lesson is selected and it's ownership context is "TEAM", this buttons is disabled.
-------------------------------
NODE-VIEWER
-------------------------------
1. Please improve the node-viewer so that when the selectedNode has no description the mock data service provides a randomly generated selection of "ipso" text (resulting in node's descripting being slightly different) to present the simulated impression that the technique content changed. I will improve this component to retrieve real data and images later. Do not supply more than 500 characters.
2. If the description is not null/empty, present the real text.
3. Remove the block of stuff that says "This Node Viewer displays detailed information about the currently selected node. Use the navigation buttons below to move through your lesson nodes." so the node viewer just has title and description sections and then the current navigation button when in "Lesson Mode".
4. Node-Viewer has three states: 

- The state of having no selectedNode (the selected node is null) - This is "Waiting Mode".
- The state of "having no lesson selected but there still being a selectedNode" is called "Exploratory Mode"
- The state of "have a selectedLesson and also a selectedNode" is called "Lesson Mode"

When in "Lesson Mode" it operates as it does currently. 
When in "Waiting Mode" the dialog should present the message "To begin training, select a node to explore, or lesson to work through"

When in "Exploratory Mode", the "lesson navigation" buttons should not be shown. Instead,  add two buttons: 
     - "Mark as Completed" which marks the node completed for the current use. The NodeID, completion status and the node survey results should be stored in state as nodes are selected to be sent to the database. I will complete that part later.
    -  "Mark as Needs Review" that is disabled if the node has not yet been completed, enabled if it has been completed and clicking it removes the node completed state for that node.

When the selectedNode changes and the user has already completed a node, a message in Green text on a light green background surrounded by a rounded rectangle of green color should be able to say "You explored and completed this node on [some date]." and the "Mark as Completed" button should be disabled, and the "Mark as Needs Review" should be enabled.

There is an extra gold line and extra space above description, please remove it.

Within the Node Virewer "Exploratory Mode" (selected node, no selected lesson) and "Lesson Mode" (selected node, selected lesson) are presenting the same buttons. "Exploratory Mode" should only display "Mark Completed" and "Mark as Needs Review", while "Lesson Mode" should display the lesson navigator buttons. Please fix.

-------------------------------
Feature Manager
-------------------------------
. Add a "FeatureManager" service which manages the feature access based on the subscription.
. It gets the current Feature Set for the current version from a JSON file (I will at some point replace this with an API call)
. It is configured by taking the Tenant (which includes tier features, and )

-------------------------------
SUBSCRIPTION MANAGEMENT/BILLING
-------------------------------
. Add component to display Subscription Tiers
. Add payment methods
. Add Component for Billing which gets billing from Square.
. Add Component for Subscriptions which gets Subscription History from Square
. Add Component for Donations which gets Donation history from Square
. Add Component to Upgrade or Downgrade the active subscription. Essentially it cancels the current subscription and starts the next subscription to be billed on the next billing date of the last subscription.

-------------------------------
TENANT USERS
-------------------------------
. Add a component to manage tenant users.
    .You should only be able to do this if you are a tenant administrator.

    . Within the Tenant User Management add the ability to add a user to a tenant.
        .Users are effective dated, the user effective date is established as today, with the default expiration date = 12/31/9999        
        .Adding a user should take the user first name, user last name, phone and email address.    
        .Users can be in many roles, you should be able to see a list of checkboxes with role that apply to the user.        
        .To prevent adding duplicate data, we need to check that the user doesn't already exist as an effective (current user) or doesn't already exist as an expired user. sow we should search (via a future API call...) If the phone and email address already exists in the list of expired users you should be asked if you want to re-establish this user, if the answer is yes then the user should be able to select which current roles apply.
        
    . Within the Tenant User Management Add the ability to remove a user from a tenant.
            . It should ask "Are you sure"
            . Removing the user simply expires it. Setting it's expiration date to 5 minutes ago.


-------------------------
POST-LESSON SURVEY
-------------------------
In the node-viewer toolbar, when you finish a lesson allow them to rate the lesson and provide comments:

- Prior Knowledge -  how much they had on the topics before (1 - 5)
- Informative - "Did this lesson provide new information, or wh?" (1-5)
- Personal Result - "Did this lesson improve your personal game?" (1-5)
- Team Result -  "Did this lesson improve the team collective?" (1-5)
- Applicability - "How like are you likely to these lessons in a match situation (1-5)
- More Information - "More like this or less like this?"

In the View Effects, create the ability to toggle on/off the "Content Quality Survey" and the default should be to "on".
The surevy applies to the lesson it's totality, not the nodes of the lesson.

Add the ability to also collect a node-related survey using the same questions, but only when there is no selectedLesson.

In the View Effects,change the name of the ability toggle on/off the "Lesson Content Quality Survey" 
In the View Effects, create the ability to toggle on/off the "Content Quality Survey" for non-lesson selections and call it "Exploratory Content Quality Survey"  and the default should be to "on".

For both survey types add an unchecked checkbox that says "Don't show me this again" that turns off the applicable "Lesson Content Quality Survey" or "Exploratory Content Quality Survey" feature when checked.

-------------------------
Lesson/NODEVIEWER/Explorer
-------------------------
- Add a lesson description to the lesson interface.
- Add chips (entered text fragments) to the lesson interface. I should be able to enter chips that describe the lesson, like Falls under "Press Resistance', 'Defense', 'Movement Patterns'
Make it so if I hit return when in the chips control it adds the chip as if I had clicked add.



- Break the node viewer into different separate dialogs "Explorer" and "Lesson Runner". Lesson Runner should be concerned with Lesson Mode buttons and functionality (for when a lesson is selected)
- "Explorer" should be concerned with "Explorer Mode" buttons (Mark Completed and Mark as Needs Review) functionality for when the selctedNode changes but no lesson is selected.
- Any new dialogs should be light mode/dark mode styled, have headers with the common buttons (Expand/Condense, Open/Close, Lock/Unlock, Drag)
- Add both to the top toolbar and make sure they looks and operate the like the other toolbar in terms of open/close, drag, on/off, lock/unlock. 
- As these are two separate draggable toolbars which will show the same content and can coexist on the screen at the same time, both dialogs should use as an internal display element a completely component as a common node display component. I will improve later.
- In the Lesson Runer, when a lesson is run, the first screen on the lesson should always be a screen containing...
    - [Lesson ID] - [Lesson Name]
    - [Lesson Description]
    - Falls Under: [Lesson chips]
- In autopilot mode it should stay on this first lesson screen for 2 seconds.
- Make sure I can rescue them with the control-top-toolbar click functionality.
- Make sure neither will crash the app the first time it's brought up.
- Make sure it generates no view checking errors.

At the end of this request I want two separate toolbars, one for Lesson Runner and one for Explorer. 

-------------------------
Operation Modes
-------------------------
We are going to add "operation modes" to D3UIV6. These operation modes show a set of toolbars and hide everyting else, you could think of them as "toolbar-group activation/deactivation"

Create me an interface that I can use to configure and dynamically load an operation mode buttons so when I click one of these buttons it closes all the toolbars and then opens up the list as specified (or only keeps the ones specified open):

Add the operation mode buttons to the bottom toolbar to the left of the CTRL / ALT / SHIFT indicators

The buttons should be as follows but I might want to add more later, or let the user add them dynamically, so have them pulled from a config file.
- "Team Builder" Button -  (opens Team, Team Group, Roster, Team Group Members)
- "Dataset Builder" Button -  (opens  Navigation, Quick Nav, List Nav, Node Painter)
- "Lesson Builder" Button -  (opens   Drawing Tools, Selected Lesson, Selected Nodes List, Lesson Explorer, QUick Nav)
- "Lesson Mode" Button -  (opens Selected Lesson, Selected Nodes, Lesson Runner)
- "Explorer Mode" Button -  (opens  Drawing Tools, Navigation, Quick-Nav, Explorer)



-------------------------
DATSET ORGANIZATION
-------------------------
- Tenant  (Wauwatosa East)
    - Tenant Dataset        
        [Subfolder 1]
            [Subfolder 1.1]
            [Subfolder 1.2]
        [Subfolder 2]
            [Subfolder 2.1]
            [Subfolder 2.2]
    - Teams Datasets
        [Varsity]
        [JV]
        [Freshman]

- Tenant  (Personal)
    - Personal Datasets        
        [Subfolder1]
        [Subfolder2]
    - Teams Datasets
        [T1]
        [T2]
        [T3]        

-------------------------
REPORTING
-------------------------
[TEAM CREATION/CONSUMPTION METRICS]
- How many teams are using the system.
- How many teams are creating highly, some, not at all. 
- How many teams are consuming voraciously, actively, sparsely, not at all.
- List all teams and where they sit in terms of creating, and players consuming, and what percentage of players are not engaged.
- In what node areas are the most node children use for creating content.

[COACH CREATION METRICS]
- How many coaches are using the system.
- which coaches are creating highly, some, not at all. 
- List all coaches and where they sit.

[COACH CREATION METRICS]
- How many coaches are using the system to learn?
- which coaches are consuming voraciously, actively, sparsely, not at all.
- List all coaches and where they sit.

[CONSUMPTION]
- What is the high-water, mean, mode of player nodes for the subscription period.
- What are the most popular sections (where most have accomplished)
- In what node areas are the most node children consuming content.
- In what node areas are the most node children consuming highly-desired content.

------------------------------------------
LESSON TABS
------------------------------------------
1. It appears as though the right lessons are being enabled disabled, but while I can click the edit button in each row, I can't also select it via clicking elsewhere on the button. Please fix the lesson dialog so that I am able to click "edit" on the row, but also click elsewhere on the row to make it the selected lesson and show the lesson runner.
2. I do not see a Lesson Runner toolbar toggle in the top bar. Please fix it so that I see a lesson runner toolbar toggle, and so that I can have both the Explorer and Lesson Runner open at the same time.
3. Instead of filtering with checkboxes, I would like to remove those checkboxes and instead add a tabbed interface for with tabs for "System", "Tenent", "Team, "Team Group" where only those tabs with data are enabled, and only data for that tab is shown in the tab. For example, if neither a team nor teamgroup is selected, neither of those tabs are enabled. When the team or team group selection changes tabs become enabled or disabled as a appropriate and I would onlyh see team lessons in the Team tab, and System lessons in the system tab,etc.


Team-group detection uses a legacy heuristic (OwnershipContext.ContextName === 'TEAM' with a GroupId property). If you have a specific structured OwnershipContext for team groups (like 'TEAMGROUP'), tell me and I’ll make the detection exact and typed.

1. Fix the ownership context search logic so that it uses "TEAMGROUP" for the ContextName and the team group ID for the Context value.
Please deep debug this feature set and test and confirm it is working:

1. Fix the tab enable/disable in the lesson toobar so that 
   - When I select tenant "SYSTEM"  (OwnershipContext ContextName="TENANT", Context=-1) then only the system tab should be enabled, but not team and teamgroup unless a team and/or teamgroup is selected. 
   - When I select tenant "PERSONAL"  (OwnershipContext ContextName="TENANT", Context=0) then both the system, Tenant tab should be enabled, but not team and teamgroup unless a team and/or teamgroup is selected. 
   - When I select any other customer tenant (OwnershipContext ContextName="TENANT", Context>0) then both the system, Tenant tab should be enabled, but not team and teamgroup unless a team and/or teamgroup is selected. 
   - When I have tenant selected and a TEAM is selected in the TEAM toolbar then System, Tenant and Team are enabled.
   - When I have tenant selected and a TEAM and a TEAMGROUP is selected in the TEAM toolbar then System, Tenant and Team, TeamGroup are enabled.
2. When I select a lesson in the lesson toolbar, the bottom buttons in the LESSONS toolbar should ALL become enabled, if no LESSON is selected the should be disabled only CREATE is enabled.
3 When I select a dataset in the DATASET toolbar, the bottom buttons in the DATASET toolbar should ALL become enabled, if no DATASET is selected the should be disabled only CREATE is enabled.
4. Make sure the tab CSS is correctly adhering to light mode and dark mode and properly showing enabled or disabled.
5. When I click a DATSET toolbar tab, only the proper items for that tab  are listed.
6. When I click a LESSON toolbar tab, only the proper items for that tab  are listed.

If the SYSTEM tenant is selected, the Tenant tab is disabled. If a tenant greater than -1 is selected, then both System and Tenant tabs are enabled. Team and Teamgroup tabs can be available when the system tenant is selected as long as a TEAM is selected to enable the team tab and a team and teamgroup is selected to enable the teamgroup tab. Make sure the tab-enablement logic is accurate.

------------------------------------------
Toolbar Component
------------------------------------------
I would like to reduce repeated logic. Please extract the base logic common to every toolbar into a base component all draggable toobars can inherit from. This would include:
- header (with title)
- footer
- Lock/Unlock
- Open/Close
- Expand/Condense
- Drag-bar
- light mode/dark mode
- control-click rescue
- position remembering


Make sure to analyzed the draggable toolbars for any other common functionality I didn't think of that can be extracted into a shared common base component.

If necessary, allow templating for other functionality that needs to be dropped in by other components. 

