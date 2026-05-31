# Mock Lesson Service - IMPLEMENTED ✅

## Original Requirements

1. ✅ I need a mock lessons service. It should return the lessons available to the SYSTEM, PERSONAL, TENANT, TEAM AND TEAM GROUPS. I will fill this in with api calls later.
2. ✅ mock-lesson-service should have a buildMockLesson function that returns a test lessons with a random number (1-25) of test nodes randomly ordered nodeId's from (1 - 25).
3. ✅ mock lesson service should have a buildMockTenantLessons service which takes a tenant and creates a list of lessons including the System Lesson ("TENANT",-1), a personal lesson ("USER", [the logged in user id]), a tenant lesson ("TENANT",[tenantID]), and at least one team ("TEAM", a teamid) if teams exist, and a teamgroup ("TEAMGROUP", teamgroupid) if team groups exist
4. ✅ Add LessonID to the LessonAssignment interface, when we assign a lesson the lesson id must be included.

---

## Implementation Details

### Files Created/Modified

1. **Created:** `src/app/services/mock-lesson.service.ts`
2. **Modified:** `src/app/interfaces/lesson-assignment.interfaces.ts` - Added `LessonID: number` field

---

## MockLessonService API

### buildMockLesson()
Creates a single mock lesson with random nodes.

**Signature:**
```typescript
buildMockLesson(
  lessonName: string,
  ownershipContext: OwnershipContext,
  flowId?: number,
  flowName?: string,
  createdByUserId?: number
): ILesson
```

**Features:**
- Generates 1-25 random nodes
- Node IDs randomly selected from 1-25 and shuffled (no duplicates)
- Each node includes radar chart values:
  - `NodeCurrentValue`: 1-3 (perceived skill)
  - `NodeDesiredValue`: 3-4 (target skill)
  - `NodeProValue`: 4-5 (elite skill)
- Random 1-4 category chips
- Auto-incremented LessonID
- ISO timestamp for CreatedUTC

**Example:**
```typescript
const lesson = mockLessonService.buildMockLesson(
  'System Training',
  { ContextName: 'TENANT', Context: -1 },
  123,
  'Soccer Dataset',
  1
);
```

### buildMockTenantLessons()
Creates comprehensive lesson set covering all ownership contexts.

**Signature:**
```typescript
buildMockTenantLessons(
  tenant: Tenant,
  loggedInUser: User,
  teams?: Team[],
  teamGroups?: TeamGroup[],
  flowId?: number,
  flowName?: string
): ILesson[]
```

**Generated Lessons:**

1. **System Lesson** - `TENANT` context, Context = -1
   - Name: "System Training Fundamentals"
   - CreatedByUserID: -1

2. **Personal Lesson** - `USER` context, Context = user ID
   - Name: "{FirstName}'s Personal Training"
   - CreatedByUserID: user ID

3. **Tenant Lesson** - `TENANT` context, Context = tenant ID
   - Name: "{TenantName} Organization Training"
   - CreatedByUserID: user ID

4. **Team Lessons** - `TEAM` context (if teams provided)
   - First team: guaranteed lesson
   - Additional teams: 50% probability each

5. **TeamGroup Lessons** - `TEAMGROUP` context (if team groups provided)
   - First team group: guaranteed lesson
   - Additional groups: 50% probability each

**Example:**
```typescript
const lessons = mockLessonService.buildMockTenantLessons(
  currentTenant,
  loggedInUser,
  allTeams,
  allTeamGroups,
  dataset?.FlowID,
  dataset?.FlowName
);
```

### resetLessonIdCounter()
Resets auto-incrementing lesson ID counter to 1 (useful for testing).

---

## LessonAssignment Interface Update

**Before:**
```typescript
export interface LessonAssignment {
  targetType: 'USER' | 'TEAM' | 'TEAMGROUP' | 'PLAYER';
  targetId: number;
  AssignedByUserID: number;
  AssignedUTC: string;
  AssignedUnderContext: 'COACH' | 'TEAM';
  AssignedUnderContextKey: number;
}
```

**After (Latest):**
```typescript
export interface LessonAssignment {
  LessonID: number; // ID of the lesson being assigned
  AssignedUTC: string; // UTC datetime when the lesson was assigned (ISO string)
  Status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'REVIEW_NEEDED'; // Current status of the assignment
  TargetContext: {
    TargetContext: 'USER' | 'TEAM' | 'TEAMGROUP' | 'PLAYER'; // Context under which the lesson was assigned
    TargetContextKey: number; // ID of the context (user ID, team ID, team group ID, or player ID)
  };
  AssignmentContext: {
    AssignedUnderContext: 'USER' | 'COACH' | 'TEAM' | 'TEAMGROUP' | 'PLAYER'; // Context under which the lesson was assigned (COACH is treated as USER context)
    AssignedUnderContextKey: number; // ID of the context (user/coach ID, team ID, team group ID, or player ID)
  };
}
```

**Rationale:** 
- Restructured to use nested objects for better organization
- Added Status field to track assignment progress
- TargetContext contains who the lesson is assigned TO
- AssignmentContext contains who assigned it and under what context

---

## Node Generation Details

- **Available IDs:** 1-25
- **Count per Lesson:** Random 1-25
- **Selection:** Fisher-Yates shuffle for randomness
- **No Duplicates:** Each ID max once per lesson

---

## Lesson Chips (Categories)

Random 1-4 chips from:
- Press Resistance
- Defense
- Attacking
- Passing
- Dribbling
- Shooting
- Tactics
- Fitness
- Positioning
- Ball Control
- Set Pieces
- Counter Attack

---

## Migration to Real API

The service is designed for easy replacement:

```typescript
// Current (Mock)
getLessons(): ILesson[] {
  return this.mockLessonService.buildMockTenantLessons(
    this.tenant, this.user, this.teams, this.teamGroups
  );
}

// Future (API)
async getLessons(): Promise<ILesson[]> {
  return this.http.get<ILesson[]>('/api/lessons').toPromise();
}
```

---

## Usage Example

```typescript
import { MockLessonService } from './services/mock-lesson.service';

export class MyComponent {
  constructor(private mockLessonService: MockLessonService) {}

  loadAllLessons() {
    const lessons = this.mockLessonService.buildMockTenantLessons(
      this.tenant,
      this.user,
      this.teams,
      this.teamGroups,
      this.dataset?.FlowID,
      this.dataset?.FlowName
    );
    
    console.log(`Generated ${lessons.length} lessons`);
    // System: 1, Personal: 1, Tenant: 1, Team: 1+, TeamGroup: 1+
  }

  createCustomLesson() {
    const lesson = this.mockLessonService.buildMockLesson(
      'My Custom Lesson',
      { ContextName: 'USER', Context: this.user.UserId }
    );
  }
}
```

---

## Testing Notes

1. Use `resetLessonIdCounter()` before tests for deterministic IDs
2. `buildMockTenantLessons()` guarantees all ownership contexts
3. Handles empty teams/teamGroups arrays gracefully
4. Each lesson has unique random nodes for realistic testing
