We are still working on the lesson builder v2, in the new right-side panel...
1. Add a section for two dropdowns:

    - Background 
    - Base Formation

2. The background dropdown drivs an SVG file that should scale to the size of the right side panel.  I should be able to select that file from a dropdown across the top containing:
    "Guardiola" (field.guardiola.svg)
    "Nagelsmann" (field.nagelsmann.svg)
    "Standard" (field.standard.svg)
    "Futsal" (field.futsal.svg)


3. The base formation dropdown will do nothing at the moment. I will fill that in later, but it should contain the following options:
- "11v11 - Final Third - W"
- "11v11 - Middle Third - Progression"
- "11v11 - Buildout - La Salidia Lavolpiana (vs Single Striker)"
- "11v11 - Buildout - La Salidia Lavolpiana (vs Double Striker)"
- "11v11 - Buildout - Di Zerbi - Box"
- "11v11 - Buildout - Di Zerbi - Attacking Covershadows"
- "11v11 - Buildout - Di Zerbi - Hourglass"
- "11v11 - Kickoff - 3-5-2"
- "11v11 - Kickoff - 4-4-2"
- "11v11 - Kickoff - 4-5-1"
- "11v11 - CK - Stack"
- "11v11 - CK - Pack"
- "11v11 - CK - Even Distribution"
- "11v11 - CK - Short #1"
- "11v11 - FK - Deep"
- "11v11 - FK - Short - Centrally"
- "11v11 - FK - Short - From Wings"
- "11v11 - Throw-In - Attacking Third"
- "11v11 - Throw-In - Middle Third"
- "11v11 - Throw-In - Defending Third"
- "11v11 - Defending - High Block"
- "11v11 - Defending - Middle Block"
- "11v11 - Defending - Low Block"
- "9v9 - Kickoff - 3-3-2"
- "9v9 - Kickoff - 3-2-3"
- "9v9 - Kickoff - 3-4-1"
- "9v9 - Kickoff - 4-3-1"
- "9v9 - Kickoff - 2-4-2"


4. Make sure the svg background selected in the background becomes the background for that right side panel (and no other parts)

When I select a formation, it should populate from the file [formation.config]

Create structures for a mini-match configuration in the right panel called "IMiniMatch" with player configuration called "IMiniTeam" and "IMiniPlayer", create the files in the inferfaces/mini-match folder.

export interface IMiniPlayer:{
    playerNumber: number;
    playerCenterX:number;
    playerCenterY:number;    
}

export interace IMiniTeam: {
    teamName: string;
    playerCount: number;
    players: IMiniPlayer[];
    sequence: any[];
}
export interface IMiniMatch {
    name: string;
    perTeamplayerCount: number;
    teams: IMiniTeam:[]    
}

- "11v11 - Final Third - W"
- "11v11 - Middle Third - Progression"
- "11v11 - Buildout - La Salidia Lavolpiana (vs Single Striker)"
- "11v11 - Buildout - La Salidia Lavolpiana (vs Double Striker)"
- "11v11 - Buildout - Di Zerbi - Box"
- "11v11 - Buildout - Di Zerbi - Attacking Covershadows"
- "11v11 - Buildout - Di Zerbi - Hourglass"
- "11v11 - Kickoff - 3-5-2"
- "11v11 - Kickoff - 4-4-2"
- "11v11 - Kickoff - 4-5-1"
- "11v11 - CK - Stack"
- "11v11 - CK - Pack"
- "11v11 - CK - Even Distribution"
- "11v11 - CK - Short #1"
- "11v11 - FK - Deep"
- "11v11 - FK - Short - Centrally"
- "11v11 - FK - Short - From Wings"
- "11v11 - Throw-In - Attacking Third"
- "11v11 - Throw-In - Middle Third"
- "11v11 - Throw-In - Defending Third"
- "11v11 - Defending - High Block"
- "11v11 - Defending - Middle Block"
- "11v11 - Defending - Low Block"
- "9v9 - Kickoff - 3-3-2"
- "9v9 - Kickoff - 3-2-3"
- "9v9 - Kickoff - 3-4-1"
- "9v9 - Kickoff - 4-3-1"
- "9v9 - Kickoff - 2-4-2"


I need to add some tools to the example to make it a full-featured editor.

1. I need to be able to add text of different font families, size, boldness, italics and underline and color. Once drawn, I need to be able select the text, and modify it, including changing the actual text.
2. I need to be able to draw lines, those lines can be thin or thick, can be tiny dashed, dashed or solid. Once drawn, I need to be able to modify it, rotate it and resize it, or delete it. 
3. I need to be able to draw circles and ovals. Circle lines can be thin or thick, can be tiny dashed, dashed or solid.  Once drawn I also need to be able select that circle or oval, rotate it and resize it, or delete it. 
4. I need to be able to draw squares and rectangles. Rectangle lines can be thin or thick, can be tiny dashed, dashed or solid. Once drawn I also need to be able select that rectangle, rotate it and resize it. 
5. I need to be able to draw triangles. Triangle lines can be thin or thick, can be tiny dashed, dashed or solid. Once drawn I also need to be able select that triangle, rotate it and resize it or delete it.
 
---------------------------------------------------
PLAYER-STRIPING
---------------------------------------------------
Add a team "kit color" (striped, block, home-whites) to the player color section

- Block picks a color.
- Striped picks two colors and stripes the players.
- Home-Whites chooses white.

---------------------------------------------------
PATH TOOLS
---------------------------------------------------
6. I need to be able to select and de-select elements to combine and uncombine shapes, players and the ball so I can move them together within a sequence.    For example I can combined a player and the ball for possssion so they move together.
7. I need to be able to draw paths between two points, and once that path is drawn I need to be able to extend it, shorten it or rotate it. Paths can be have characteristics  of a "Path Appearance Type", "Path Visibility" and "Path Travel Type" and "Path Participants". I want to be able to define a path that looks a certain way, is drawn between to points in a certain way and runs objects that I attach along the path.

"Path Appearance Type": 
 - "runs" are a solid arrow 
 - "driven passes" are a long dash arrow, 
 - "short passes" are short dashes arrow, 
 - "shots" are solid red lines arrow, 
 - "taking space/gliding" is a longer-curvy line arrow, 
 - "speed dribble" is a straighter arrow
 - "contact dribbles" are short-curvy, almost squiggly lines.  
 - "chipped passes" should look like raised arcs arrow
 - "clears" should look like raised arcs arrow with a thicker line
 - "punts" are higher raised arcs arrow

"Path Visibility"
- Visible - Path is shown during both editing and animation sequence executions.
- Hidden - Path is shown during editing but hidden during animation sequence executions.

 "Path Travel Type"
 - Simple Convex Curved Path
 - Simple Concave Curved Path
 - Straight Line Path
 - complex path (where I draw the path with a pencil)

"Path Participants"
- adding a path participant attaches one or more other previously positioned objects to the path and runs the object along the path to the next keyframe. For the most part 

I want to be able to choose to add the players to the display by 
0. picking a field player and choosing "assign from roster"
1. picking a field player and choosing "assign from roster"
1. selecting a "starting eleven" team group and applying players by position number.
2. selecting a "reserves" team group and applying players by position number without changing players which don't apply.


------------------------------------------------
BLOCK-TOOLS
------------------------------------------------
1. Add a "block density" tool which allows me to choose options:
- "active bock" (home or away) 
- "dimension" (vertical as default, horizontal and both)
- "block density" which via slider moves the players within the active block closer to the middle in whichever dimension was selected.

2. Add a toggle mode "block movement" tool which allows me to choose the "active bock" (home or away) and move all the players except the 1 player together in a block.

3. Add a "block height" tool which allows me to choose the "active bock" (home or away) and choose "high block", "mid block", "low block"
- High block positions all the players so furthest players are are touching the opposition penalty area.
- Mid Block positions all the players so the further players are so the furthest players are touching the half-way line
- Low Block positions all the players so the furthest players are touching the line between the their defending third and the middle third.

Add a checkbox near block height called "Enforce block strictness". 

Fix block height, we want to divide the field into 12 sections from top to bottom, numbered from 1-12 from top to bottom. When we create the block we want to move the players to fit within the following parameters.  "Enforce block strictness" will control whether we condense the block vertically to make the players squish into the block height rows specfied below.


1. With enforced block strictnness, High Block for Home Team is all players except player 1 are moved within their existing shape condensed to fit within rows 7 - 10.  Without block strictness, simply move the formation so that the highest home players end at row 10. Player 1 should start at the end of row 3.
2. With enforced block strictnness, High Block for Away Team is all players except player 1 are moved within their existing shape condensed to fit within rows 3 - 6. Without block strictness, simply move the formation so that the highest away players end at row 3. Player 1 should start at the beginning of row 10
3. With enforced block strictnness, With enforced block strictnness, Low Block for Home Team is all players except player 1 are moved within their existing shape condensed to fit within rows 3 - 6. Without block strictness, simply move the formation so that the highest home players end at row 6.  Player 1 should start at the beginning of row 1
4. With enforced block strictnness, Low Block for Away Team is all players except player 1 are moved within their existing shape condensed to fit within rows 7 - 10. Without block strictness, simply move the formation so that the highest away players end at row 7. Player 1 should start at the beginning of row 12
5. With enforced block strictnness, Mid Block for Home Team is all players except player 1 are moved within their existing shape condensed to fit within rows 5 - 8. Without block strictness, simply move the formation so that the highest home players end at row 8. Player 1 should start at the end of row 2
6. With enforced block strictnness, Mid Block for Away Team is all players except player 1 are moved within their existing shape condensed to fit within rows 5 - 8. Without block strictness, simply move the formation so that the highest away players end at row 5. Player 1 should start at the end of row 10
8. Add a "parking the bus" option which for home players puts all players between 2 and 4, and for away players put all away players between 9 and 10.