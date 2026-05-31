I want to work on the Team Directory component. 

This is a two-panel component 
    - the Navigation/Selection panel is on the left (and occupies 1/2 of the screen width)
    - the Detail panel is on the right (and occupies 1/2 of the screen width)

-------------------------------    
NAVIGATION panel
-------------------------------
FILTERING - There is a set of three horizontal select boxes for filting.
    - RECERATION ("RECREATIONAL (All)" or "DISABLED")
    - YOUTH ACADEMY (with options "YOUTH ACADAMY (ANY TIER)", "YOUTH ACADAMY (Competitive TIER)",     
    - YOUTH SELECT ("YOUTH SELECT (ANY TIER)","YOUTH SELECT (Competitive TIER)", "YOUTH SELECT (TIER 1)", "YOUTH SELECT (TIER 2 and Above)", "YOUTH SELECT (TIER 3 and Above)" 

SORTING - There are two SORT MODES for this: "Age Group" mode and "Gender Mode", this is a toggle button.

- The Root Node is always "All Teams" (team id 0)
- "Age group" mode builds a tree with all the age groups, and all the teams for each age group sorted by gender that qualify versus filtering.
- "Gender" mode builds a tree with genders, and all the teams for each age group that qualify versus filtering.
- Within each team are it's team groups.

DISPLAY
The tree should display as a tree table with full expand collapse and the following columns:

- Age/Gender/Tier/Team Name/Group Name as the tree colum, each preceded by a selection checkbox. 

- Profile Button (only shown at the team level, will display a profile in the details panel)
- Roster (only shown at the team level, will display the roster in the details panel)
- Team Groups (only shown at the team level, will display the list of team groups in the details panel)
- Lessons (will display the lessons in the details panel)
- Archive/restore
- Delete


