import { Injectable } from '@angular/core';
import {
  DecisionFlow,
  TreeNode,
  User,
  ITenant,
  ITeam,
  ITeamGroup,
} from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class MockDatasetService {
  // Lorem ipsum text components for random node descriptions
  private descriptionPrefixes = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco.',
    'Duis aute irure dolor in reprehenderit in voluptate velit esse.',
    'Excepteur sint occaecat cupidatat non proident.',
    'At vero eos et accusamus et iusto odio dignissimos.',
    'Nam libero tempore cum soluta nobis est eligendi optio.',
    'Temporibus autem quibusdam et aut officiis debitis.',
    'Et harum quidem rerum facilis est et expedita distinctio.',
    'Nemo enim ipsam voluptatem quia voluptas sit aspernatur.',
  ];

  private descriptionMiddles = [
    'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.',
    'Mauris viverra veniam sit amet massa dapibus condimentum sed quis odio.',
    'Pellentesque habitant morbi tristique senectus et netus et malesuada fames.',
    'Donec sollicitudin molestie malesuada proin libero nunc consequat interdum.',
    'Curabitur arcu erat accumsan id imperdiet et porttitor at sem.',
    'Vivamus magna justo lacinia eget consectetur sed convallis at tellus.',
    'Praesent sapien massa convallis a pellentesque nec egestas non nisi.',
    'Sed porttitor lectus nibh vivamus accumsan lacus vel facilisis.',
    'Quisque velit nisi pretium ut lacinia in elementum id enim.',
    'Cras ultricies ligula sed magna dictum porta lorem ipsum dolor.',
    'Vestibulum ac diam sit amet quam vehicula elementum sed sit amet.',
    'Pellentesque id nibh tortor id aliquet lectus proin nibh nisl.',
    'Nulla facilisi morbi tempus iaculis urna id volutpat lacus laoreet.',
    'Sed vulputate mi sit amet mauris commodo quis imperdiet massa.',
    'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet.',
  ];

  private descriptionSuffixes = [
    'Suscipit adipiscing bibendum est ultricies integer quis auctor elit.',
    'Elementum integer enim neque volutpat ac tincidunt vitae semper.',
    'Facilisis leo vel fringilla est ullamcorper eget nulla facilisi.',
    'Mattis rhoncus urna neque viverra justo nec ultrices dui sapien.',
    'Cursus turpis massa tincidunt dui ut ornare lectus sit amet.',
    'Diam volutpat commodo sed egestas egestas fringilla phasellus.',
    'Scelerisque felis imperdiet proin fermentum leo vel orci porta.',
    'Arcu cursus euismod quis viverra nibh cras pulvinar mattis.',
    'Pharetra et ultrices neque ornare aenean euismod elementum nisi.',
    'Consequat nisl vel pretium lectus quam id leo in vitae.',
    'Turpis egestas integer eget aliquet nibh praesent tristique magna.',
    'Dignissim convallis aenean et tortor at risus viverra adipiscing.',
    'Bibendum arcu vitae elementum curabitur vitae nunc sed velit.',
    'Accumsan tortor posuere ac ut consequat semper viverra nam.',
    'Lacus vestibulum sed arcu non odio euismod lacinia at quis.',
  ];

  /**
   * Generate random boilerplate description text for nodes
   * @param nodeId Optional node ID to ensure consistent variation based on ID
   * @returns Random description text
   */
  generateRandomDescription(nodeId?: string): string {
    // Use node ID for seeded randomness if provided, otherwise use true random
    const seed = nodeId ? this.simpleHash(nodeId) : Math.random();

    const prefixIndex = Math.floor(
      (seed * 1000) % this.descriptionPrefixes.length
    );
    const middleIndex = Math.floor(
      (seed * 2000) % this.descriptionMiddles.length
    );
    const suffixIndex = Math.floor(
      (seed * 3000) % this.descriptionSuffixes.length
    );

    return `${this.descriptionPrefixes[prefixIndex]} ${this.descriptionMiddles[middleIndex]} ${this.descriptionSuffixes[suffixIndex]}`;
  }

  /**
   * Simple hash function to convert string to number for seeded randomness
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) / 2147483647; // Normalize to 0-1 range
  }

  /**
   * Generate random node description with optional customization
   * @param nodeId Node ID for consistent variation
   * @param includeDetails Whether to include additional details
   * @returns Formatted description text
   */
  generateNodeDescription(nodeId: string, includeDetails = true): string {
    const baseDescription = this.generateRandomDescription(nodeId);

    if (!includeDetails) {
      return baseDescription;
    }

    // Add some additional details based on node ID
    const additionalDetails = this.generateAdditionalDetails(nodeId);

    return `${baseDescription}\n\n${additionalDetails}`;
  }

  /**
   * Generate additional details for node descriptions
   */
  private generateAdditionalDetails(nodeId: string): string {
    const seed = this.simpleHash(nodeId + 'details');
    const detailTypes = [
      'Key Benefits:',
      'Implementation Notes:',
      'Success Metrics:',
      'Dependencies:',
      'Best Practices:',
    ];

    const details = [
      '• Improved efficiency and throughput',
      '• Enhanced collaboration between teams',
      '• Reduced operational overhead',
      '• Increased customer satisfaction scores',
      '• Streamlined decision-making processes',
      '• Better resource allocation',
      '• Enhanced data visibility',
      '• Improved compliance tracking',
      '• Automated workflow management',
      '• Real-time performance monitoring',
    ];

    const typeIndex = Math.floor((seed * 1000) % detailTypes.length);
    const detail1Index = Math.floor((seed * 2000) % details.length);
    const detail2Index = Math.floor((seed * 3000) % details.length);

    // Ensure we don't pick the same detail twice
    const detail2ActualIndex =
      detail2Index === detail1Index
        ? (detail2Index + 1) % details.length
        : detail2Index;

    return `${detailTypes[typeIndex]}\n${details[detail1Index]}\n${details[detail2ActualIndex]}`;
  }

  /**
   * Generate a random video URL for a node
   * @param nodeId Node ID for consistent video selection
   * @returns Video URL string
   */
  generateNodeVideoUrl(nodeId: string): string {
    // Available videos in assets/video folder (5 videos available)
    const videos = ['V1.mp4', 'V2.mp4', 'V3.mp4', 'V5.mp4', 'V6.mp4'];

    // Use node ID for consistent video selection
    const seed = this.simpleHash(nodeId + 'video');
    const videoIndex = Math.floor((seed * 1000) % videos.length);
    const selectedVideo = videos[videoIndex];

    return `assets/video/${selectedVideo}`;
  }

  /**
   * Generate Lorem ipsum-style text for nodes without descriptions
   * @param nodeId Node identifier for consistent generation
   * @returns Random descriptive text up to 500 characters
   */
  generateLoremIpsumDescription(nodeId: string): string {
    // Pre-built sentence fragments for more natural text
    const sentenceFragments = [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco',
      'Duis aute irure dolor in reprehenderit in voluptate velit esse',
      'Excepteur sint occaecat cupidatat non proident sunt in culpa',
      'At vero eos et accusamus et iusto odio dignissimos ducimus',
      'Nam libero tempore cum soluta nobis est eligendi optio cumque',
      'Temporibus autem quibusdam et aut officiis debitis aut rerum',
      'Et harum quidem rerum facilis est et expedita distinctio',
      'Nemo enim ipsam voluptatem quia voluptas sit aspernatur',
      'Neque porro quisquam est qui dolorem ipsum quia dolor',
      'Ut aliquip ex ea commodo consequat lorem ipsum consectetur',
      'Quis autem vel eum iure reprehenderit qui in ea voluptate',
      'Sed ut perspiciatis unde omnis iste natus error sit voluptatem',
      'Accusantium doloremque laudantium totam rem aperiam eaque ipsa',
      'Beatae vitae dicta sunt explicabo nemo enim ipsam voluptatem',
      'Qui ratione voluptatem sequi nesciunt neque porro quisquam',
      'Molestiae consequatur vel illum qui dolorem eum fugiat quo',
      'Similique sunt in culpa qui officia deserunt mollitia animi',
      'Itaque earum rerum hic tenetur a sapiente delectus ut aut',
      'Voluptate velit esse cillum dolore eu fugiat nulla pariatur',
      'Excepteur sint occaecat cupidatat non proident sunt in culpa',
      'Duis autem vel eum iriure dolor in hendrerit in vulputate velit',
      'Ut wisi enim ad minim veniam quis nostrud exerci tation',
      'Nam liber tempor cum soluta nobis eleifend option congue nihil',
      'Claritas est etiam processus dynamicus qui sequitur mutationem',
      'Investigationes demonstraverunt lectores legere me lius quod',
      'Eodem modo typi qui nunc nobis videntur parum clari fiant',
      'Sollemnes in futurum autem vel eum iriure dolor hendrerit',
      'Vulputate velit esse molestie consequat vel illum dolore',
    ];

    // Create more unique seed by combining nodeId with additional entropy
    const enhancedSeed = nodeId + '_desc_' + nodeId.length;
    const seed = this.simpleHash(enhancedSeed);

    // Select 2-5 sentence fragments randomly (increased variation)
    const numSentences = 2 + Math.floor((seed * 10000) % 4); // 2-5 sentences
    const selectedSentences: string[] = [];
    const usedIndices = new Set<number>();

    // Create a more robust seeded random number generator for consistent results
    let randomSeed = Math.floor(seed * 2147483647); // Use larger seed
    const seededRandom = () => {
      randomSeed = (randomSeed * 16807) % 2147483647; // Park-Miller algorithm
      return randomSeed / 2147483647;
    };

    // Select unique sentence fragments
    for (let i = 0; i < numSentences; i++) {
      let attempts = 0;
      let index: number;

      do {
        index = Math.floor(seededRandom() * sentenceFragments.length);
        attempts++;
      } while (usedIndices.has(index) && attempts < 30); // Increased attempts

      if (!usedIndices.has(index)) {
        usedIndices.add(index);
        selectedSentences.push(sentenceFragments[index]);
      }
    }

    // Join sentences with proper punctuation
    let text = selectedSentences
      .map((sentence) => {
        // Ensure each sentence ends with a period
        const trimmed = sentence.trim();
        return trimmed.endsWith('.') ? trimmed : trimmed + '.';
      })
      .join(' ');

    // Add some variation by occasionally adding connecting words
    const connectors = [
      'Furthermore',
      'Additionally',
      'Moreover',
      'However',
      'Nevertheless',
    ];
    if (selectedSentences.length > 1 && seededRandom() > 0.5) {
      const connectorIndex = Math.floor(seededRandom() * connectors.length);
      const sentences = text.split('. ');
      if (sentences.length > 1) {
        sentences[1] = `${
          connectors[connectorIndex]
        }, ${sentences[1].toLowerCase()}`;
        text = sentences.join('. ');
      }
    }

    // Ensure we don't exceed 500 characters
    if (text.length > 500) {
      // Cut at the last complete sentence that fits
      const sentences = text.split('. ');
      let result = '';
      for (const sentence of sentences) {
        const potential = result ? `${result}. ${sentence}` : sentence;
        if (potential.length <= 497) {
          result = potential;
        } else {
          break;
        }
      }
      // Ensure it ends with proper punctuation
      if (result && !result.endsWith('.')) {
        result += '.';
      }
      text = result || text.substring(0, 497) + '...';
    }

    return text;
  }

  /**
   * Get all DecisionFlows - system-level flows for each organization
   */
  getDecisionFlows(): DecisionFlow[] {
    return [
      {
        FlowID: -1, // Generate random data
        OwnershipContext: {
          Context: 'TENANT' as const,
          ContextKey: -1, // -1 indicates system level
        },
        FlowName: 'Generate Random Tree Data',
        FlowDesc: 'System-level decision flow that generates random tree data',
        treeData: this.createEmptyRootNode(), // Placeholder - will be replaced with random data
      },
      {
        FlowID: 0, // Generate single root node
        OwnershipContext: {
          Context: 'TENANT' as const,
          ContextKey: -1, // -1 indicates system level
        },
        FlowName: 'Single Root Node',
        FlowDesc: 'System-level decision flow that creates a single root node',
        treeData: this.createEmptyRootNode(), // Placeholder - will be replaced with single root
      },
      {
        FlowID: 1, // Predefined 5-node tree
        OwnershipContext: {
          Context: 'TENANT' as const,
          ContextKey: -1, // -1 indicates system level
        },
        FlowName: 'Footballing Patterns (5 Nodes)',
        FlowDesc: 'Football movement patterns dataset for tactical analysis',
        treeData: this.createFootballingPatternsTree(), // Use the specific footballing patterns tree
      },
      {
        FlowID: 2, // Predefined single-node tree
        OwnershipContext: {
          Context: 'TENANT' as const,
          ContextKey: -1, // -1 indicates system level
        },
        FlowName: 'Empty Test (Null Root)',
        FlowDesc: 'Test Garbage',
        treeData: null as any,
      },
      {
        FlowID: 30, // Predefined single-node tree
        OwnershipContext: {
          Context: 'TENANT' as const,
          ContextKey: 3, // -1 indicates system level
        },
        FlowName: 'Tosa East Footballing',
        FlowDesc: 'Footballing at Tosa East',
        treeData: this.createRootTree(), // Use the specific footballing patterns tree
      },
      {
        FlowID: 30, // Predefined single-node tree
        OwnershipContext: {
          Context: 'TENANT' as const,
          ContextKey: 5, // -1 indicates system level
        },
        FlowName: 'Elmbrook United Footballing',
        FlowDesc: 'Footballing at Elmbrook United',
        treeData: this.createRootTree(), // Use the specific footballing patterns tree
      },
      {
        FlowID: 32, // Predefined single-node tree
        OwnershipContext: {
          Context: 'USER' as const,
          ContextKey: 7, // -1 indicates system level
        },
        FlowName: 'Footballing Patterns (Root Only)',
        FlowDesc: 'Football movement patterns dataset for tactical analysis',
        treeData: this.createRootTree(), // Use the specific footballing patterns tree
      },
      {
        FlowID: 32, // Predefined single-node tree
        OwnershipContext: {
          Context: 'USER' as const,
          ContextKey: 3, // -1 indicates system level
        },
        FlowName: 'Quinn Footballing Patterns',
        FlowDesc: 'Football movement patterns dataset for tactical analysis',
        treeData: this.createFootballingPatternsTree(
          'Quinn Footballing Patterns'
        ), // Use the specific footballing patterns tree
      },
      {
        FlowID: 32, // Predefined single-node tree
        OwnershipContext: {
          Context: 'USER' as const,
          ContextKey: 4, // -1 indicates system level
        },
        FlowName: 'Chase Footballing Patterns',
        FlowDesc: 'Football movement patterns dataset for tactical analysis',
        treeData: this.createFootballingPatternsTree(
          'Chase Footballing Patterns'
        ), // Use the specific footballing patterns tree
      },
      {
        FlowID: 32, // Predefined single-node tree
        OwnershipContext: {
          Context: 'USER' as const,
          ContextKey: 5, // -1 indicates system level
        },
        FlowName: 'Archer Footballing Patterns',
        FlowDesc: 'Football movement patterns dataset for tactical analysis',
        treeData: this.createFootballingPatternsTree(
          'Archer Footballing Patterns'
        ), // Use the specific footballing patterns tree
      },
    ];
  }

  /**
   * Create an empty root node for DecisionFlows
   */
  private createEmptyRootNode(): TreeNode {
    return {
      id: 'root',
      name: 'Footballing Patterns',
      description: this.generateNodeDescription('root'),
      videoUrl: this.generateNodeVideoUrl('root'),
      children: [],
    };
  }

  private createRootTree(): TreeNode {
    return {
      id: '0',
      name: 'Footballing Patterns',
      description: this.generateNodeDescription('0'),
      videoUrl: this.generateNodeVideoUrl('0'),
      children: [],
    };
  }

  /**
   * Create the footballing patterns tree structure for DecisionFlow 31
   */
  private createFootballingPatternsTree(name?: string): TreeNode {
    return {
      id: '0',
      name: name || 'Footballing Patterns',
      description: this.generateNodeDescription('0'),
      videoUrl: this.generateNodeVideoUrl('0'),
      children: [
        {
          id: '1',
          name: 'Attacking Principles',
          description: this.generateNodeDescription('1'),
          videoUrl: this.generateNodeVideoUrl('1'),
          children: [],
        },
        {
          id: '2',
          name: 'Defending Principles',
          description: this.generateNodeDescription('2'),
          videoUrl: this.generateNodeVideoUrl('2'),
          children: [],
        },
        {
          id: '3',
          name: 'Transition to Structured Defense',
          description: this.generateNodeDescription('3'),
          videoUrl: this.generateNodeVideoUrl('3'),
          children: [],
        },
        {
          id: '4',
          name: 'Transition to Structured Offense',
          description: this.generateNodeDescription('4'),
          videoUrl: this.generateNodeVideoUrl('4'),
          children: [],
        },
        {
          id: '5',
          name: 'Interstitial Moments',
          description: this.generateNodeDescription('5'),
          videoUrl: this.generateNodeVideoUrl('5'),
          children: [],
        },
      ],
    };
  }

  /**
   * Filter DecisionFlows based on user context and ownership
   * This acts as an abstraction layer between the raw dataset list and components
   *
   * @param loggedInUser - The currently logged-in user
   * @param selectedTenant - The currently selected tenant (can be null)
   * @param selectedTeam - The currently selected team (can be null)
   * @param selectedTeamGroup - The currently selected team group (can be null)
   * @returns Filtered array of DecisionFlows the user has access to
   */
  getFilteredDecisionFlows(
    loggedInUser: User | null,
    selectedTenant: ITenant | null = null,
    selectedTeam: ITeam | null = null,
    selectedTeamGroup: ITeamGroup | null = null
  ): DecisionFlow[] {
    // Get all available datasets
    const allFlows = this.getDecisionFlows();

    if (!loggedInUser) {
      console.log('⚠️ No logged-in user, returning only SYSTEM datasets');
      // Only return SYSTEM-level datasets if no user is logged in
      return allFlows.filter(
        (flow) =>
          flow.OwnershipContext.Context === 'TENANT' &&
          flow.OwnershipContext.ContextKey === -1
      );
    }

    console.log('🔍 Filtering datasets for user:', loggedInUser.UserId);
    console.log('  - Selected Tenant:', selectedTenant?.TenantID);
    console.log('  - Selected Team:', selectedTeam?.TeamID);
    console.log('  - Selected Team Group:', selectedTeamGroup?.TeamGroupID);

    // Build list of valid tenant IDs from user's tenants
    const validTenantIds = loggedInUser.Tenants
      ? loggedInUser.Tenants.map((t) => t.TenantID)
      : [];

    // Build list of valid team IDs (if tenant is selected)
    const validTeamIds: number[] = [];
    if (selectedTenant && selectedTenant.Teams) {
      validTeamIds.push(...selectedTenant.Teams.map((t) => t.TeamID));
    }

    // Build list of valid team group IDs (if team is selected)
    const validTeamGroupIds: number[] = [];
    if (selectedTeam && selectedTeam.TeamGroups) {
      validTeamGroupIds.push(
        ...selectedTeam.TeamGroups.map((tg) => tg.TeamGroupID)
      );
    }

    // Filter datasets based on ownership context
    const filteredFlows = allFlows.filter((flow) => {
      const context = flow.OwnershipContext;

      switch (context.Context) {
        case 'TENANT':
          // SYSTEM level (Context === -1) is always accessible
          if (context.ContextKey === -1) {
            return true;
          }
          // TENANT level - check if user has access to this tenant
          return validTenantIds.includes(context.ContextKey as number);

        case 'USER':
          // PERSONAL datasets - only accessible if it matches the logged-in user
          return context.ContextKey === loggedInUser.UserId;

        case 'TEAM':
          // TEAM datasets - only accessible if user has access to this team
          return validTeamIds.includes(context.ContextKey as number);

        case 'TEAMGROUP':
          // TEAMGROUP datasets - only accessible if user has access to this team group
          return validTeamGroupIds.includes(context.ContextKey as number);

        default:
          console.warn('⚠️ Unknown OwnershipContext:', context.Context);
          return false;
      }
    });

    console.log(
      `✅ Filtered ${filteredFlows.length} datasets from ${allFlows.length} total`
    );
    console.log(
      '  - Filtered dataset IDs:',
      filteredFlows.map((f) => f.FlowID)
    );

    return filteredFlows;
  }
}
