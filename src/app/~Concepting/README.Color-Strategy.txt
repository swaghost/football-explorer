1. Add Search Results as a colorization strategy for it's category

2. I need a colorization-strategy-service
	- Extract all the category/item list item logic from the colorization toolbar so it can be easily modified. Create IColorizationCategory and IColorizationStrategy interfaces. The data should be in a colorization configuration file in the "config" folder.
	- Create an IColorizationStrategyResult interfaces which extends the IColorizationStrategy and adds adds an IColorResult array (each with the ID, and color)
	- create an IColorizationMechanism interface, possible versions of this would include...
		- AllNodes Mechanism (results in all nodes getting the color strategy ...for example any of the preferred colorization choices)		
		- NodeList Mechanism (results in a supplied list of nodes returned as getting the color strategy...for example "search results")
		- Branch Block Mechanism (determines what branch the items are and applies the appropriate block color)
		- Branch Gradient Mechanism (determines what branch the items are and applies the appropriate gradient color)
		- KeyedRemoteServiceCallMechanism (results in a call to an API service  which returns a list of nodes that should get the color strategy)
		- UnkeyedRemoteServiceCallMechanism (results in a call to an API service which returns a list of nodes that should get the color strategy)
		- UnkeyedLocalServiceCallMechanism (results in a call to use a specific local service algorithm which returns a list of nodes that should get the color strategy)
		- KeyedLocalServiceCallMechanism (results in a call to use a specific local service algorithm, with a specific key list, which returns a list of nodes that should get the color strategy)
		
	- the colorization service should take a colorization strategy, the current dataset tree node data, apply the mechanism and produce a colorization result which is a list of nodes and the colors they should have which can be used the visualization drawing service to color the codes.
	

	

  Example: "Colorization Key (Phases)" 
  	
	This uses the colorization data to create a key based on the colorization options chosen, in this case I have chosen "Phase" , it runs a specific API query (to be determined later) and it uses the resulting node data to show which nodes apply to my chosen selection, colors the nodes appropriately, and creates a key indicating which apply and which do not.  (resulting in a key of  "Visited", "Completed", "Assigned")
  
  Example: "Colorization Key (Status)" 
  
	This uses the colorization data to create a key based on the colorization options chosen, in this case I have chosen "Status" , it runs a specific API query (to be determined later) and it uses the resulting node data to show which nodes apply to my chosen selection, colors the nodes appropriately, and creates a key indicating which apply and which do not.  (resulting in a key of  "Visited", "Completed", "Assigned")
  
  Example: "Colorization Key (Bookmarks)" 
  
		This uses the colorization data to create a key based on the colorization options chosen, in this case I have chosen "Bookmarks" , it runs a specific API query (to be determined later) and it uses the resulting node data to show which nodes apply to my chosen selection, colors the nodes appropriately, and creates a key indicating which apply and which do not.  (resulting in a key of "Bookmarks", "Unbookmarked")
  
  Example: "Colorization Key (Tested)" 
  
	 This uses the colorization data to create a key based on the colorization options chosen, in this case I have chosen "Tested" , it runs a specific API query (to be determined later) and it uses the resulting node data to show which nodes apply to my chosen selection, colors the nodes appropriately, and creates a key indicating which apply and which do not.  (resulting in a key of  "Tested Successfully", "Untested")

  Example: "Colorization Key (Visited)" 
  
    This uses the colorization data to create a key that tells me which ones the user has tested successfully and which ones have note (resulting in a key of Visited, Unvisited)
	
  Example: "Colorization Key (Favorites)" 
  
	This uses the colorization data to create a key based on the colorization options chosen, in this case I have chosen "Favorites" , it runs a specific API query (to be determined later) and it uses the resulting node data to show which nodes apply to my chosen selection, colors the nodes appropriately, and creates a key indicating which apply and which do not.  (resulting in a key of Favorites, Non-Favorites)
  
  Example: "Colorization Key (Lessons Builder)" 
  
	This uses the colorization data to create a key based on the colorization options chosen, in this case I have chosen "Lessons Builder Lesson" , it runs a specific API query (to be determined later) and it uses the resulting node data to show which nodes apply to my chosen selection, colors the nodes appropriately, and creates a key indicating which apply and which do not (resulting in a key of Lesson Selections, Unselected).
  
  Example: "Colorization Key (Lessons Runner)" 
  
	This uses the colorization data to create a key based on the colorization options chosen, in this case I have chosen "Lessons Runner Lesson", it runs a specific API query (to be determined later) and it uses the resulting node data to show which nodes apply to my chosen selection, colors the nodes appropriately, and creates a key indicating which apply and which do not (resulting in a key of Lesson Selections, Unselected)
  
  Example: "Colorization Key (Position)" 
  
	This one requries me to pick a position from the position list and uses the colorization data to create a key based on the colorization options chosen, in this case I have chosen "CB" (centerback), it runs a specific API query (to be determined later) and it uses the resulting node data to show which nodes apply to my chosen selection, colors the nodes appropriately, and creates a key indicating which apply and which do not (resulting in a key of "CB-Specific", "CB-Helpful", "N/A"). 
  
  Example: "Colorization Key (Moment)" 
  
    This one requries me to pick a moment from the moment list and uses the colorization data to create a key based on the colorization options chosen, in this case I have chosen "structured attacking" , it runs a specific API query (to be determined later) and it uses the resulting node data to show which nodes apply to my chosen selection, colors the nodes appropriately, and creates a key indicating which apply and which do not (resulting in a key of "Structured Attacking", "N/A")
	
  Example: "Colorization Key (IQ)" 
  
    This one requries me to pick an IQ topic from the list and uses the colorization data to create a key based on the colorization options chosen, in this case I have chosen "scanning", it runs a specific API query (to be determined later) and it uses the resulting node data to show which nodes apply to my chosen selection, colors the nodes appropriately, and creates a key indicating which apply and which do not (resulting in a key of  "Scanning Topics", "N/A")

