// Decision Flow interfaces for dataset management

import { OwnershipContext } from './ownership-context.interface';
import { TreeNode } from './tree.interfaces';

export interface DecisionFlow {
  FlowID?: number;
  OwnershipContext: OwnershipContext;
  FlowName?: string | null;
  FlowDesc?: string | null;
  treeData: TreeNode;
}
