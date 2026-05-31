Let's work on the main tree visualizations.

1. Act as an expert software developer architect who wants to extract and abstract the visualization logic for the main tree in the vizualization tester into interfaces and services so you can add other visualizations later as you see fit but maintain the current interactivity (including pan, zoom, rotate, pan-to-Node, select node, shift-select, etc.).  Create and integrate strategies for the types of visualizations I'm interested in: 

* Radial Trees 
* Horizontal Trees 
* Vertical Trees 

- Indented
- Zoomable Sunburst
- Force-directed


Add a tree format called "Indented" which looks like the tree at this link:

https://observablehq.com/@d3/indented-tree

2. Also, I want to be able to impact the variables that change size/shape (width/height/radius) of the visualizations through options on the visualization toolbar, but for each visualization type I only want to see the options that apply to the selected visualization.
	- Radius (for radial trees)	
	- Width (for horizontal)
	- Height (for vertical)

3. Make sure the format dropdown allows me to choose 
	- Radial
	- Horizontal
	- Vertical
	- Sunburst

4. Add a modifier Tree Layout Style (as dropdown for Horizontal, Vertical, Radial only, doesn't apply to sunburst.):
    - Tidy Tree
    - Cluster     

5. Add a modifier Tree Layout Style (as dropdown for Horizontal, Vertical, Radial only, sunburst doesn't have links.):
    - Line 
    - Curved
    - Diagonal
    - Orthogonal

6. Add a modifier Labeling Style (as dropdown for Horizontal, Vertical, Radial only, sunburst only works one way.):
	- HORIZONTAL (Horizontal, Vertical only)
	- VERTICAL (Horizontal, Vertical only)
	- "RAY-LIKE - LEAVES ONLY" (Radial Only)
	- "RAY-LIKE ALL Nodes"  (Radial Only)

--------------------------------------------------------
COLORING STRATEGY
--------------------------------------------------------
1. I also want to be introduce coloring strategy of nodes (within Radial, Vertical, Horizontal), text (within Radial, Vertical, Horizontal, Senburst), links  (within Radial, Vertical, Horizontal), and color blocks/divisions (within the sunburst)
2. Add a dropdown in front of colorization strategy (same line, to the left of) that classifies options By different categories (which makes certain colorization strategies only available, dependent upon the type of class picked)

	- State	
	- Targeting
	- Lesson-Centric 
	- Accomplishment
	- By Phase/Branch
	- By Phase/Branch
	- By Moment
	- By Position
	- IQ Development
	- Search Results
	- Preferred Colorization

	- State 
		By Status (different colors for completed, visited, scheduled, not visited)
		Highlight Completed
		Highlight visited
		Highlight scheduled
		Highlight To Do

	- Targeting
		- Bookmarked
		- Favorites

	- Lesson-Centric 
		- Selected for Lesson Builder
		- Selected for Lesson Runner

	- Accomplishment
		- Highlight Completed
		- Highlight To Do	

	- By Phase
		Rainbow (Block Color by branch)
		Rainbow (Gradient Color by branch)

	- IQ Development
		- All IQ Development	
		- Scanning		
		- Defender Psychology
		- Principles of Movement
		- Inflicting Decision-Points
		- Operating In Crowds
		- Drift Principles
		- Decision-making/Responsiveness
		- Creating Space/Access
		- Gravity
		- Maximum Yield/Dinishing Returns		
		- Blind-side
		- Prioritization
		- Separation
		- Evasion/Dismarking (E/D)
		- E/D - Rotations		
		- E/D - Creating Confusion
		- E/D - Timing
		- E/D - Disguise
		- E/D - Active Dismarking		
		- Attacking - Close Quarters (CQ)		
		- Attacking - Counter Movements
		- Attacking - Wall-Passing/Position Exchange
		- Attacking - Head-On/Direct Dribbling
		- Attacking - Attacking the Offside Line
		- Attacking - Attacking From the Offside Position
		- Attacking - Wing/Sideline
		- Attacking - Escaping Pressur
		- Attacking - Half-Spaces
		- Attacking - Final Third
		


	- By Moment		
		Structured Attacking
		Structured Defending
		Transition to Structured Defending
		Transition to Structured Attacking
		Interstitial Moments
		Interstitial (FK)
		Interstitial (CK)
		Interstitial (Throw-In)	
		Interstitial (Kickoffs)	
		Interstitial (PK)	

	- Preferred Colors

		<option value="red-block">🔴 Red Block</option>
		<option value="red-gradient">🔴 Red Gradient By Depth</option>
		<option value="red-gradient">🔴 Red Gradient By Depth (Reversed)</option>
		<option value="orange-block">🟠 Orange Block</option>
		<option value="orange-gradient">🟠 Orange Gradient By Depth</option>
		<option value="orange-gradient">🟠 Orange Gradient By Depth (Reversed)</option>
		<option value="yellow-block">🟡 Yellow Block</option>
		<option value="yellow-gradient">🟡 Yellow Gradient By Depth</option>
		<option value="yellow-gradient">🟡 Yellow Gradient By Depth  (Reversed)</option>
		<option value="green-block">🟢 Green Block</option>
		<option value="green-gradient">🟢 Green Gradient By Depth</option>
		<option value="green-gradient">🟢 Green Gradient By Depth  (Reversed)</option>
		<option value="blue-block">🔵 Blue Block</option>
		<option value="blue-gradient">🔵 Blue Gradient By Depth</option>
		<option value="blue-gradient">🔵 Blue Gradient By Depth  (Reversed)</option>
		<option value="indigo-block">🟣 Indigo Block</option>
		<option value="indigo-gradient">🟣 Indigo Gradient By Depth</option>
		<option value="indigo-gradient">🟣 Indigo Gradient By Depth  (Reversed)</option>
		<option value="violet-block">🟣 Violet Block</option>

		<option value="brown-block">🟣 Brown Block</option>
		<option value="brown-gradient">🟣 Brown Gradient By Depth</option>
		<option value="brown-gradient">🟣 Brown Gradient By Depth  (Reversed)</option>
		
		<option value="violet-gradient">🟣 Violet Gradient By Depth</option>
		<option value="violet-gradient">🟣 Violet Gradient By Depth  (Reversed)</option>
		<option value="grayscale-block">⚫ Grayscale Block</option>
		<option value="grayscale-gradient">⚫ Grayscale Gradient By Depth</option>
		<option value="grayscale-gradient">⚫ Grayscale Gradient By Depth By Depth  (Reversed)</option>

2. "Colorization" dropdown should allow me to apply these colors





	<option value="custom-status" (completed, visited, scheduled, not visited)
	<option value="custom-visited">⚙️ Custom "visited" Property - Has Explored</option>
	<option value="custom-todo">⚙️ Custom "favorites" Property - My Favorites</option>
	<option value="custom-bookmarked">⚙️ Custom "bookmarked" Property - To Explore</option>
	<option value="custom-completed">⚙️ Custom "completed" Property - Has Tested/Completed</option>
	<option value="custom-scheduled">⚙️ Custom "scheduled" Property - Within Lesson</option>
	<option value="custom-position">⚙️ Custom "Applies to Position"</option>
	<option value="custom-moment">⚙️ Custom "Applies to Moment"</option>
	<option value="custom-LessonBuilder">⚙️ Custom Lesson Builder Lesson</option>
	<option value="custom-LessonRunner">⚙️ Custom Lesson Runner Lesson</option>	
	
	<option value="branch-block">🌳 Branch - Rainbow - Block</option>
	<option value="branch-gradient">🎨 Branch - Rainbow - Gradient</option>
	<option value="red-block">🔴 Red Block</option>
	<option value="red-gradient">🔴 Red Gradient By Depth</option>
	<option value="red-gradient">🔴 Red Gradient By Depth (Reversed)</option>
	<option value="orange-block">🟠 Orange Block</option>
	<option value="orange-gradient">🟠 Orange Gradient By Depth</option>
	<option value="orange-gradient">🟠 Orange Gradient By Depth (Reversed)</option>
	<option value="yellow-block">🟡 Yellow Block</option>
	<option value="yellow-gradient">🟡 Yellow Gradient By Depth</option>
	<option value="yellow-gradient">🟡 Yellow Gradient By Depth  (Reversed)</option>
	<option value="green-block">🟢 Green Block</option>
	<option value="green-gradient">🟢 Green Gradient By Depth</option>
	<option value="green-gradient">🟢 Green Gradient By Depth  (Reversed)</option>
	<option value="blue-block">🔵 Blue Block</option>
	<option value="blue-gradient">🔵 Blue Gradient By Depth</option>
	<option value="blue-gradient">🔵 Blue Gradient By Depth  (Reversed)</option>
	<option value="indigo-block">🟣 Indigo Block</option>
	<option value="indigo-gradient">🟣 Indigo Gradient By Depth</option>
	<option value="indigo-gradient">🟣 Indigo Gradient By Depth  (Reversed)</option>
	<option value="violet-block">🟣 Violet Block</option>

	<option value="brown-block">🟣 Brown Block</option>
	<option value="brown-gradient">🟣 Brown Gradient By Depth</option>
	<option value="brown-gradient">🟣 Brown Gradient By Depth  (Reversed)</option>
	
	<option value="violet-gradient">🟣 Violet Gradient By Depth</option>
	<option value="violet-gradient">🟣 Violet Gradient By Depth  (Reversed)</option>
	<option value="grayscale-block">⚫ Grayscale Block</option>
	<option value="grayscale-gradient">⚫ Grayscale Gradient By Depth</option>
	<option value="grayscale-gradient">⚫ Grayscale Gradient By Depth By Depth  (Reversed)</option>


Color Target (as dropdown, for Radial, Vertical, Horizontal only):
    - Node 
    - Text 

Background Color (as dropdown):
    - White
    - Black
    - Digital Grid Blue
    - Digital Grid Green
    
Line Constrast (as dropdown, this contrasts the links more so or less so with the background color, only applies to Radial, Vertical, Horizontal not sunburst):
    - Light 
    - Heavy



colorization strategy