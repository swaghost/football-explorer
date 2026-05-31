---------------------------------------
Tour - Guided Learning
---------------------------------------

We are now going to work on a guided lesson tour, a fly through of the selectedNodes data.

C. In ngxs state, maintain a new state called tourState, which contains a list of "attempted lessons" which tracks a list of attempted lessons, by the lessons id, with a list of completed nodes for that lesson, and a lessonNodeIndex which tracks the current node in view from the list of nodes for the  lesson.  we will use that to keep track of which node in the selectedNodes list we are currently on, and that should start at zero when a lesson is added to the tourState.  

C. Add another draggable toolbar, this one is a "Node Viewer".
    - Add it to the top toolbar and make sure it looks and operates the like the other toolbar in terms of open/close, drag, on/off, lock/unlock. 
    - Make sure it won't crash the app the first time it's brought up.
    - Make sure it generates no view checking errors.
    - It will works ** exactly**  the same as the "selected Node" toolbar in that it takes the selectedNode and shows its data, except I will fill this toolbar in with other data later. 
    - When opened, this "Node Viewer" should open exactly in the middle of the screen on the first node in the list (and only show a single node at a time). It should be 600 pixels wide, only require up to the content amount of length and expand up to 800 pixels before scrolling.
    - In the content portion of the toolbar there should be an "[ID] - [Node Name]" header line. This should not scroll 
    - In the content portion of the toolbar underneath the header put a brief paragraph of some boilerplate text (I will fill in details later), this area should scroll.
C. Make the boilerplate text smaller (fewer lines of text).    
C. Running across the bottom of the content section below the boilerplate text, floating from far left to right, there should be some action buttons that should not scroll:
           
    - First - Loads the first node from the selectedNodes list (and saves the index in lessonNodeIndex), if we are on the first node the button is disabled.
    - Prev - loads the previous node from the selected index list (and saves the index in lessonNodeIndex), if we are on the first node, it should be disabled.
    - Next - marks the selected node as completed, and loads the next node from the selected index list, if we are on the last node in the lesson it should be replaced with Finish
    - Last - loads the last node in the selectedNodes list (and saves the index in lessonNodeIndex), if we are on the last lesson the button is disabled.
    - Finish - This button is only visible if we have run through all the selectedNodes. Clicking it asks "Do you want to save your lesson results? Yes/No". If the user choose "Yes", it  marks the lesson completed, all the nodes as completed and closes the dialog.
    - Quit - - This button is only visible if we haven't yet run through all the nodes. Clicking it asks  ""Do you want to save your lesson progress? Yes/No". If the user chooses "Yes" it closes the dialog but marks the lesson as incomplete.

    
C. When we change the lessonNodeIndex,  doing so should make that node that corresponds to that node the selectedNode, and it should show up in both the selected node toolbar and the NodeViewer toolbar, and also use panToNode functionality to also focus the main tree on the node within the center.    
    
   
C. There should be a blue footer for this dialog which says "X of Y, N remaining" where x is the index (+1), x is the node count for the lesson, and N is (the number of total lessons - the number of completed lessons).
C. In the lesson toolbar, add another button called "Run Lesson".  When we click this button is should start the tour by loading the Node Viewer in the center, updating the lessonNodeIndex to zero, and emptying the list of completed nodes.
C. In the lesson toolbar, add another button caleld "Autopilot", when we click this button, the system should run a lesson on autopilot by starting the tour by, loading the Node Viewer in the center, updating the lessonNodeIndex to zero, and emptying the list of completed nodes, spending 3 seconds on a node before clicking the next button, and when we have completed all the nodes it clicks Finish, opens the dialog and saves the results by answering yes. I want to be able to see the buttons clicked, as if the user was doing it.
    

-------------------------------
ARCHITECTURE
-------------------------------
C. Break dialogs off into their own component that works with D3UIV6 without changing the functionality. All toolbar compoonents should start with component name "dialog-[function].component.ts" and be named "dialog[FunctionName]Component"
C. Break toolbars off into their own component that works with D3UIV6 without changing the functionality. All toolbar compoonents should start with component name "toolbar-[function].component.ts" and be named "toolbar[FunctionName]Component"

-------------------------------
IMPORT
-------------------------------
.Add Email Address and Phone to enter player.
.Add a placeholder for check to see if this player exists in the system with a matching email address and phone. Right now it should return false (which allows a the player to be added.)
.Allow me to add a player from another team within the same organization. Give me a dialog which allows me to search among teams within the same orgization, or search by name across the whole organization.

-------------------------------
DISPLAY
-------------------------------
. Add a radial tree map as a display option.

---------------------------------------
RADAR CHART LEARNING 
---------------------------------------
We are going to have a player-rating spider chart.
We pick a given set of skills from the lesson
We rate each player (or assign an average) on the skill as the coach.
We allow them to set the lesson focus on the chart.

We then ask the player to rate themselves before and after.
We radar chart the results for a given player. Coach Before/Player Before/Player After



-------------------------------
Navigator
-------------------------------
1. Create me a new draggable toolbar called "Quick-Nav" that shows me a tree from our tree data in the same format that looks like the tree shown in D3ExampleCollapsibleTree.
2. The "Quick-Nav" Toolbar should be separate from the bottom toolbar. 
3. The toolbar should look like all the other draggable toolbars, same header with same header buttons, styles and header colors.
5. When the tree source data changes, this tree should redraw using the enter/update/exit pattern. 
6. It should have it's own icon that lookes like a vertical tree.

4. When the selected node is changed and this tree is visible it should open to and higlight the selected node.
5. When I click on a node, it should trigger the selected node to change in the same way, and with the same behavior as if I had clicked on it in the tree.

-------------------------------
Navigator - EXPANSION/STATE/RESET
-------------------------------

1. Add to the quick-nav toolbar a numerical selector that controls how many levels are opened by default. For example, if the value is 1, the first level after the root is opened, if it's 2 then the root, it's first level and their children are open. This only applies to the quick-nav toolbar.
2. This quick-nav numerical value ("default level expansion") should be saved in ngxs state so that when I leave and then return to the page the value is as I left it.
3. Even better, save the quick-nav tree open state in NGXS state. When I leave the page and return and if the number of nodes are the same, the quick-nav tree should open as it's last state was when it was closed. If I change the number of nodes then expansion state should be reset (expanded to the "default level expansion" value) to the to track freshly with no interference from previous data.

-------------------------------
Search
-------------------------------
We are going to add another toolbar to D3UIV6.

1. Give me a new draggable toolbar called "Search".  add it in the common toolbars folder.
2. Add it to the top toolbar and make sure it looks and operates the like the other toolbar in terms of open/close, drag, on/off, lock/unlock. 
3. It should also adhere to light mode/dark mode.
4. It will have two text boxes, one for ID and one for terms
5. It will have three buttons, 1 button next to each textbox to clear it and another to actually search.
6. clicking the buttons should reveal a scrollable list of nodes that contain the entered node ID or text.

The style on the header of the search draggable toolbar isn't correct. Please make the search toolbar's header style matches all the other draggable toolbars 


Let's move back to modifying D3UIV6. 
1. Create me a new draggable toolbar called "Navigator" that shows me a tree from our tree data in the same format that looks like the tree shown in D3ExampleCollapsibleTree.
2. When the tree nodes change, this tree should draw using the enter/update/exit pattern. 
3. When the selected node is changed and this tree is visible it should open to and higlight the selected node.

