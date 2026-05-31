
------------------------------
TEAM GROUP  - AUTOBUILD
------------------------------
Now complete the "Auto-Build" feature so that when I click the auto build button on the Team Groups toolbar it matches the roster to the team group position list or position number requirements and adds the roster. If the Team Group does not have any position abbreviations or numbers specified pop an OK dialog that that says "To create Team Groups using the Auto-Build functionality, please assign positions abbreviations (CB, CAM, HM, etc.) or position numbers (1-11) to players"

------------------------------
TOOLBAR CHANGES>
------------------------------
1. Make sure toolbars can ever pop up under the top toolbar, and their header can never go into the bottom toolbar.
2. Personal and System lessons can always be selected from the Lesson toolbar
3. Make sure all the visibilty state of each toolbar is stored in state. 
4. When I am in an operating mode and one of it's dialogs is off, the operating mode should do a "soft off", that it the toggle button for that operating mode should be turned off but that happening shouldn't automatically close the other windows as if I can clicked the toggle button off.


------------------------------
Add-To buttons on Explorer
------------------------------
1. I need a button that looks like a star - this button stores a node in state as a favorite for examination later.  This button is only available for system datasets, and clicking add it to a personal list of favorite nodes stored in state for review later. A node can be stored under "Movements", "Match Skills", "Technique"
2. "Bookmark" - this button stores a node in state for so I can pick up where left off.  This button is only available for system datasets, and clicking add it to a sencond personal list of bookmarked nodes stored in state as "bookmarked nodes" for review later.


0. Make sure the favorites and bookmarks icons are adding to the lists in NGXS state when they are toggled on or off. I will replace these with API calls later.
1. The favorites star in Technique Explorer be gray background when not selected, yellow when selected.
2. Every time the Selected Node changes within the Technique Explorer,  check to see whether the technique id is in my list of favorites and toggle the button on appropriately.
3. The bookmarks star in technqiue explorer should be gray background when not selected, colorized when selected.
4. Every time the Selected Node changes within the Technique Explorer, check to see whether the technique id is in my list of bookmarks and toggle the button on appropriately.
5. Add both of these buttons to the header of the lesson runner.

5. create a new toolbar, the "MY TOOLBOX"  toolbar.
- Add the toolbar to the top toolbar and make sure it looks and operates the like the other toolbar in terms of open/close, drag, on/off, lock/unlock. 
- Make sure the toolbar won't crash the app the first time it's brought up.
- It should also conform the light mode/dark mode.
- Make sure it generates no view checking errors.
- make sure it inherits uses the base draggable toolbar component.
- this toolbar should show me a scrollable list of items in my toolbox that were clicked from using the favorits star.
- if there is an existing toolbar called "Explorer" (one that is not used for looking at the selectedNode but is instead used for favorites only) get rid of that in favor of the one we are creating with this request.

6. create a new toolbar, the "Bookmarks"  toolbar.
- Add the toolbar to the top toolbar and make sure it looks and operates the like the other toolbar in terms of open/close, drag, on/off, lock/unlock. 
- Make sure the toolbar won't crash the app the first time it's brought up.
- It should also conform the light mode/dark mode.
- Make sure it generates no view checking errors.
- make sure it inherits uses the base draggable toolbar component.
- this toolbar should show me a scrollable list of items in my bookmarked nodes that were clicked from using the bookmarks star.
- if there is an existing toolbar called "Lesson Runner" (one that is not used for lessons but is instead used for bookmarks only) get rid of that in favor of the one we are creating with this request.

------------------------------
LESSON FIXES
------------------------------
0. When I create a lesson, and choose a "system" ownership context it always goes in to personal ("TENANT",0) rather than system ownership context ("TENANT",-1) or the selected tenant ("TENANT", > 0) that i've chosen in the dialog.
It seems to be choosing the selectedTenant rather than the ownership context selection chosen in the dialog. make sure it follows the dialog selection rather than defaulting it to something unexpected. Make sure an ownership context is chosen

1. Please make sure lesson creation is creating lessons with the correct ownership context based on the ownership context selection.

2. Make sure the lessons show up in the tab they are supposed to, in in Team and TeamGroup tabs filtered to display only the selected team or team group.

3. Make sure the lessons are selectable as appropriate from the selected tab. 

4. Make sure state holds the selected lesson and selected node. 

5. Make sure the lesson buttons are available when a lesson is selected.

//The default ownership context should be the tenent if no team is chosen, the team if a team is chosen, or a team group if a team group is chosen. Personal is always an option and System is an option if I'm a developer or administrator.

------------------------------
DEMO TOOLBAR
------------------------------
- Random Node Selection (pick a random node)
- Fade In 

------------------------------
ARCHIVING
------------------------------
0. Add effective dating to Lessons, Datasets, Favorites. Each interface should have EffectiveUTC and ExpirationUTC.
1. When Lessons, Datasets and Favorites are created they are established with an effective date of "Now" (utc datetime) and an expiration date of the last possible UTC date.  When an item is archived, it's given Expiration date of last possible utc date before the day it was expired.

1. Change the "Favorites/Technique Toolbox" so it uses an interface which divides the list of "Favorites" into "Current" and "Archived".
2. Add a tab Format to the "Technique Toolbox" with headers "Current" and "Archived" and only show the current ones in the current tab and the archived ones in the archived tab. 
3. Add to each list item the ability to either (A) archive it if it's current, or restore it if it's Archived by setting the effective dates in the proper fashion and then repopulating the list.

We will leave datasets, teams and lessons for another time.

------------------------------
DISPLAY - FILTERING
------------------------------
? create a color-management interface
    - Color Mode
    "Phased"  --> Phases of the Game
        "Developer" - Empty Nodes
        Developer - Empty Nodes
        Colored Red --> Color Scheme
        Colored Orange --> Color Sche
        Colored Yellow --> Color Scheme
        Colored Green --> Color Scheme
        Colored Blue --> Color Scheme
        Colored Indigo/Violet --> Color Scheme        
        Colored Black/White --> Color Scheme       
        Tenant Scheme - Color Scheme

    - Background
        pick a color.
    
    - Highlight Mode
        - Accomplishment Mode --> There is some highlighting or graying of accomplished
        - To-Do Mode --> There is some highlighting or graying of accomplished


    
. Give me the option of choosing the choosing one of the built-in color schemes.
. Give me the option of defining a color scheme.

-----------------------------------------------
SELECTED NODE
-----------------------------------------------
OK, I need to have some sort of separation between the Lesson Runner Content and Technique Explorer content. The point of this is that I want to be able to run a lesson in the lesson runner, but also explore outside of it with the Technique Explorer without changing the state of the Lesson Runner.
- The Technique Explorer functionality should remain unchanged.
-= Maintain a new NGXS state variable selectedLessonNode. It's similar to the selectedNode but it maintains node state for the lesson runner. 
- Alter the way the Lesson Runner (and only the Lesson Runner works) so that the only way lesson runner content changes is if the selectedNode is within the list selectedNodes (the nodes that are populated via shift-click and lesson selections) and that allows us to change the selectedLessonNode.
- If I do not have a lesson selected, but I do have selectedNodes populated, and click on node outside of the selectedNodes list is clicked, Lesson runner does not change it's content and state maintains the lesson node the Lesson Runner was on. 
- If I do have an lesson selected and I click on a node in the tree that is not within the lesson, the lesson runner content and lesson runner selected node should not change.
- Selecting a lesson should populate the lesson runner with the first node. It should make it the selected node and panToNode.
- adding a node to the selectedNodes list (via shift-click) should populate the lesson runner with that node.

------------------------------------------------
Expand/Collapse
------------------------------------------------
The collapse views of the draggable toolbars should only show the header and nothing else below it. The exapnded view should show the the whole draggable toolbar.


------------------------------------------------
Zoom Controls
------------------------------------------------
Add a "zoom" control to the drawing toolbar. It should have an magnifying class icon.
- Simple clicking should zoom in as if I had zoomed in via scrollbar or alt-dragging. 
- if I control click and it should enable me to to select a rectangular region to zoom in on. It should allow me to drag create a square on the screen and then zoom to the middle of the square to zoom in on that region.


-----------------------------------------------
Effects
-----------------------------------------------
I'm going to add some effects to the effects toolbar.

0. Move "Auto Fade" and "Logo fade" below "Scroll to Node"
1. add an "Auto Fade Out (5s)" toggle button to the view effects toolbar so that the logo fades in, then the background fades to black, then the logo fades out, and then the background fade out over 5 seconds back to the normal screen.


2. Add another "Auto Fade Diagram" steps should be 
    1. fade the screen to black
    2. fade in the diagram at assets/images/TRAINING.SCREENSHOT.png as full screen (so the whole image fits in the screen) on a black background, 
    4. waits 4 seconds
    5. Fades out the image
    6. Fade in the logo fades 
    7. waits for four seconds 
    8. fades out to the image to the black screen
    9. waits 3 seconds 
    10. Fade the black background fades out.



3. Add another "Auto-Fade Options"
    A. This toggle pops a dialog that asks 
        - Logo checkbox
        - Background color via colorpicker (default black)
        - Foreground color via colorpicker (default white)
        - display stage seconds
        - wait delay seconds
        - text message to be displayed.
        - OK, and Cancel button.
    B. When cancel is clicked, close the dialog. When OK is clicked
        - close the dialog.
        - Fade the screen to the selected (background) 
        - wait [wait delay]  seconds
        - If the logo checkbox was checked, the site logo fades in on top over 2 seconds. 
        - If the logo checkbox was checked wait for sits there for [display stage] seconds
        - If the logo checkbox was checked, the the site logo fades out over 2 seconds        
        - if the logo checkbox was checked we wait for [delay] seconds.
        - If the text was populated the text fades (in a extra extra large font) in over 2 seconds
        - If the text was populated we wait for [display stage] seconds.
        - If the text was populated the text fades out over two seconds.
        - the background then fades out over 2 seconds.



    

------------------------------------------------
ZOOM
------------------------------------------------
Add a "zoom" control to the drawing toolbar. It should have an magnifying class icon.
- Simple clicking should zoom in as if I had zoomed in via scrollbar or alt-dragging. 
- if I control click and it should enable me to to select a rectangular region to zoom in on. It should allow me to drag create a square on the screen and then zoom to the middle of the square to zoom in on that region.

------------------------------------------------
ASSIGN
------------------------------------------------
Add an "Assign" button to the Lessons toolbar. This new button pops a tree view dialog which allows them to choose different availability targets (teams and teamgroups) depending upon the ownership context of the lesson.
I want to import the ui from D3ExampleCollapsibleTree, but the tree structure for assigned lessons will be different


DATA STRUCTURE
- The user interface is based on a dynamically constructed tree data. 
- The root node should be "Assignment Options", then next two child nodes are "ME" (with Checkbox) and "TENANT" (without Checkbox). Beneath the tennt listed all the teams for the tenant and then within each team the teamgroups for each tenant.

ASSIGNMENT ELIGIBILITY
. If the ownership context is a System, or Tenant then all teams and team groups within them that belong to the current tenant are available options.
. If the ownership context is a Team only the specific team and team groups within the team are available options.
. If the ownership context is a Team Group only the specific team group is the available option.
. If the ownership context is a Personal you can only assign it to yourself.

USER INTERFACE 
The user interface itself should look like the D3 tree view display in D3ExampleCollapsibleTree,  
Only the "ME" option and teams and team groups for a tenant show checkboxes, and only those items that match the Ownership Context of the lesson have their checkbox enabled.

Clicking OK assigns the options, this means the system stores the assigned options (TEAM/ID or TEAMGROUP/ID or USER/7) in the NGXS store under the lesson. 

If I click "ASSIGN" twice for a lesson, the dialog should include the previous selections in the tree data.





------------------------------
EXPORT/BACKUP
------------------------------

.Add a button to export/download.  When I click "Export" Present me a dialog that allows me to choose:

    - EXPORT 

        () Full Tenant Backup (includes staff directory, age groups, genders, tenant default team groups, tenant teams, tenant teamgroups, tenant datasets and tenent lessons)
        
        
        () Dataset (Names only as list)        
        () Teams (All)
        () Team [select team] 
        () Team Groups
        () Lesson

    
    - If I am in one of the following groups  I can choose to export the tenant (and all it's teams), or the selected team and all it's team groups or the selected teamgroup. as long it's not a System (-1) tenant.

        - Developer
        - Adminstrator
        - Tenant Admin    
        - Tenant Registrar
        - Sporting Architect
        - Director of Coaching (DOC)
        - Club Director

    If I am in one of the following groups I can choose to export the selected team and all it's team groups or the selected teamgroup as long it's not a System (-1) tenant.

        - "Team Manager" 
        - "Coach" 
    
    FORMAT 
        - () Text (not importable) 
        - () JSON (importable)

    SEPARATOR (enabled only for TEXT) 
        ( ) Comma (,)
        ( ) Pipe (|)

    INCLUDE - 
        [] Team/Team Group Structure (required)
        [] Rosters/Group Members
        [] Contact Information        
        [] Jersey number
        [] Positions

    SORT 
        ( ) By Name
        ( ) By Jersey

.Add a button to copy the team roster (just the text of the list) to the clipboard
    
    Team: [Team Name]
    ----------------------------------------------
    [Jersey].[Last Name], [First Name] (Positions, comma separated)

.Add a button to export/download the list of teamgroups (without players) 
.Add a button to export/download the a single teamgroup (with all of it's details) as JSON.
.Add a button to copy the team group member list (just the text of the list) to the clipboard
    
    Team: [Team Name]
    Group :[Team Group Name]
    ----------------------------------------------
    [Jersey].[Last Name], [First Name] (Positions)

