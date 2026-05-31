# Lorem Ipsum Generator Improvements

## Problem Solved

The original Lorem ipsum generator was producing repetitive text with the same words appearing multiple times because it was using a simple sequential multiplication approach that created similar random indices.

## Solution Implemented

### 1. **Pre-built Sentence Fragments**

Instead of randomly selecting individual words, the new implementation uses complete, grammatically correct Latin sentence fragments:

```typescript
const sentenceFragments = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco",
  // ... 20 total fragments
];
```

### 2. **Seeded Random Number Generator**

Implemented a proper seeded random generator for consistent, reproducible results:

```typescript
let randomSeed = seed;
const seededRandom = () => {
  randomSeed = (randomSeed * 9301 + 49297) % 233280;
  return randomSeed / 233280;
};
```

### 3. **Anti-Repetition Logic**

Uses a `Set` to track used sentence indices, ensuring no sentence fragment is repeated:

```typescript
const usedIndices = new Set<number>();
// Selection logic prevents duplicates
```

### 4. **Natural Sentence Combination**

- Selects 2-4 unique sentence fragments per node
- Properly joins sentences with periods
- Occasionally adds connecting words (Furthermore, Additionally, etc.)
- Ensures proper capitalization and punctuation

### 5. **Smart Length Management**

- Cuts text at complete sentences when approaching 500 character limit
- Preserves sentence integrity rather than cutting mid-sentence
- Ensures proper ending punctuation

## Key Improvements

### ✅ **Variety**: Each node gets different sentence combinations

### ✅ **Readability**: Proper grammar and sentence structure

### ✅ **Consistency**: Same nodeId always generates same content

### ✅ **No Repetition**: No duplicate words or sentence fragments within a single description

### ✅ **Natural Flow**: Sentences connect logically with optional transition words

## Example Output Variations

**Node "1"** might generate:

> "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Furthermore, ut enim ad minim veniam, quis nostrud exercitation ullamco. Duis aute irure dolor in reprehenderit in voluptate velit esse."

**Node "2"** might generate:

> "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Excepteur sint occaecat cupidatat non proident sunt in culpa. Additionally, nemo enim ipsam voluptatem quia voluptas sit aspernatur."

## Technical Benefits

1. **Deterministic**: Same input always produces same output
2. **Varied**: Different inputs produce genuinely different text
3. **Readable**: Uses proper Latin Lorem ipsum text
4. **Efficient**: No complex word shuffling or repetition checking needed
5. **Maintainable**: Easy to add new sentence fragments
6. **Scalable**: Can handle any number of nodes without performance issues

## Performance Characteristics

- **Time Complexity**: O(n) where n is number of sentences selected (typically 2-4)
- **Space Complexity**: O(1) - uses fixed-size arrays and sets
- **Deterministic**: Always produces same result for same nodeId
- **Fast**: No expensive shuffling or complex randomization

This implementation ensures that users will see genuinely varied, readable text when exploring different nodes, enhancing the simulation of real content while maintaining the placeholder nature of the text.
