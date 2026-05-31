# GSAP Soccer Field Animation Studio

An interactive SVG-based soccer field with GSAP-powered player animations and keyframe editing capabilities.

## Features

### ⚽ Interactive Soccer Field

- Full-size SVG soccer field with accurate markings
- 22 players (2 teams in 4-3-3 formation)
- Drag-and-drop player positioning
- Optional grid overlay with snap-to-grid functionality

### 🎬 Animation System

- **Keyframe-based animation** - Create smooth animations between player positions
- **Timeline playback** - Play, pause, and stop animations
- **Recording mode** - Capture player positions at specific times
- **Time scrubbing** - Jump to any point in the animation

### 💾 Sequence Management

- **Save sequences** - Store multiple animation sequences
- **Export/Import** - Save sequences as JSON files for sharing
- **Load saved sequences** - Switch between different animations
- **Named sequences** - Organize your tactical animations

### 🎯 Use Cases

- Tactical analysis and planning
- Training drills visualization
- Set piece choreography
- Movement pattern demonstrations
- Player positioning studies

## Usage

### Creating an Animation

1. **Start Recording**

   - Click "Start Recording" button
   - The recording indicator will turn red

2. **Create Keyframes**

   - Set the time value (e.g., 0.0s for start)
   - Drag players to desired positions
   - Keyframe is auto-captured when you finish dragging
   - Or manually click "Capture Keyframe"

3. **Add More Keyframes**

   - Change the time value (e.g., 2.0s)
   - Move players to new positions
   - Repeat for each phase of movement

4. **Playback**

   - Click "Play" to see the animation
   - Players will smoothly animate between keyframes
   - Use "Pause" and "Stop" for control

5. **Save Your Work**
   - Click "Save" to store in the session
   - Click "Export" to download as JSON
   - Use "Import" to load previous exports

### Controls

#### Playback Controls

- ▶️ **Play** - Start animation from current time
- ⏸️ **Pause** - Pause the animation
- ⏹️ **Stop** - Stop and reset to beginning
- **Time Display** - Shows current animation time

#### Recording Controls

- ⏺️ **Start/Stop Recording** - Toggle recording mode
- 📸 **Capture Keyframe** - Manually capture current positions
- **Time Input** - Set the time for next keyframe

#### Sequence Controls

- 🆕 **New** - Start a new animation sequence
- 💾 **Save** - Save current sequence to list
- 📤 **Export** - Download sequence as JSON file
- 📥 **Import** - Load sequence from JSON file

#### View Options

- **Show Grid** - Toggle grid overlay
- **Snap to Grid** - Enable/disable grid snapping
- 🔄 **Reset Positions** - Return all players to starting formation

### Keyframe Management

- **Keyframe List** - Shows all captured keyframes with timestamps
- 🎯 **Go To** - Jump to a specific keyframe
- 🗑️ **Delete** - Remove a keyframe
- **Active Highlight** - Current keyframe is highlighted in green

### Saved Sequences

- View all saved animation sequences
- See keyframe count for each sequence
- 📂 **Load** - Switch to a saved sequence
- 🗑️ **Delete** - Remove a saved sequence

## Technical Details

### Technologies Used

- **GSAP (GreenSock)** - Animation engine
- **GSAP Draggable Plugin** - Player drag interactions
- **Angular Standalone Components** - Modern Angular architecture
- **SVG** - Vector graphics for crisp rendering at any size

### Component Structure

```
gsap-soccer-field/
├── gsap-soccer-field.component.ts    - Main component logic
├── gsap-soccer-field.component.html  - Template
├── gsap-soccer-field.component.scss  - Styles
└── README.md                         - This file
```

### Data Structures

#### Player

```typescript
{
  id: string; // Unique identifier
  x: number; // X position
  y: number; // Y position
  team: "home" | "away";
  number: number; // Jersey number
  color: string; // Team color
}
```

#### Keyframe

```typescript
{
  time: number; // Time in seconds
  players: Array<{
    // Player positions at this time
    id: string;
    x: number;
    y: number;
  }>;
}
```

#### Animation Sequence

```typescript
{
  name: string;        // Sequence name
  keyframes: Keyframe[]; // Array of keyframes
  duration: number;    // Total duration in seconds
}
```

## Accessing the Component

Navigate to: `/example/gsap/soccer-field`

## Future Enhancements

Potential features to add:

- Ball object with physics
- Player rotation/orientation
- Formation presets (4-4-2, 3-5-2, etc.)
- Multiple camera angles
- Zoom and pan controls
- Onion skinning (show previous positions)
- Path visualization (show movement trails)
- Speed controls for playback
- Loop mode
- Export to video/GIF
- Collaborative editing
- Play-by-play annotations

## Tips

1. **Start Simple** - Create 2-3 keyframes first to understand the system
2. **Use Even Time Intervals** - Makes it easier to calculate movement timing
3. **Grid Helps** - Enable grid and snap for consistent positioning
4. **Save Often** - Export important sequences to avoid losing work
5. **Name Sequences** - Use descriptive names for easy identification

## Troubleshooting

**Players won't move:**

- Make sure recording mode is active
- Check that you're not currently playing an animation

**Animation is jerky:**

- Add more keyframes between movements
- Ensure keyframes are properly sorted by time

**Can't save sequence:**

- You need at least one keyframe to save
- Make sure you provide a name when prompted

## Example Use Case: Corner Kick

1. Start Recording (time: 0.0s)
2. Position all players in corner kick setup
3. Capture keyframe
4. Set time to 2.0s
5. Move attacking players toward goal
6. Move defending players to mark
7. Set time to 4.0s
8. Position players for header/finish
9. Play to see the choreographed movement
10. Save as "Corner Kick - Near Post"

Enjoy creating tactical animations! ⚽🎬
