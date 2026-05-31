We're going to work on Visualization Tester now.

I want to add "to-do list" functionality.

1. the NGXS state should maintain a "to-do" list.
2. the NGXS state should be stored to disk when it changes like the others, I will replace it with an API later.
3. each To-Do entry should have a Title (short string)
3. each To-Do entry should have a Description (longer string)
4. each To-Do entry should have a Status (Open, Ready, On Hold, Complete, Incomplete, Pinned)
5. each To-Do entry should have a Priority (critical path, high, medium, low)
6. each To-Do entry should have an TargetType (broken into sections "Development" and "Architecting", "Teaching"):

"Development"
- Feature Request
- Bug Fix
- Improvement
- Next Iteration
- Concept Exploration

"Architecting"
- Diagram
- Node Entry
- Technique Card Note

"Teaching"
- Player Note
- Team Note
- Team Group Note
- Session Note
- Training Note

7. To-Do entry should have a Target, this is a string but in some cases selectable from dropdown. If it's a player note, it should allow me to list the player name from the current team. If it's a team note it should populate it with the team name. If it's a teamgroup it should allow me to select a team group from the selected team's teamgroups and enter it as the Team Group Name. If it's a session note, it should accept a date. If it's a training note I can enter a string as I see fit.

8. Add a drawer "To Do List" that contains a scrollable list of my to-do entries. The drawer button should with the other right-side drawer buttons and work the same as the others in terms of opening/closing.

 - There should be a target type filter for "Development", "Architecting", "Teaching", "All" with default "All". 
 - There should be a status filter (Open, Ready, On Hold, Closed, Pinned, Any )
 - there should be a "+" (new entry) buttons
 - each entry should have a selectable empty checkbox
 - if I check one ore more entries, buttons should appear that allow me to set selected checkboxes to "Open", "Ready", "Hold", "Pin", "Close Complete", "Close Incomplete", "Pin"
 - Clicking an entry should allow to edit it via dialog.
 