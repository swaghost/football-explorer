// ContextUser interface for tracking the current user context

import { User } from './user.interfaces';

export interface ContextUser {
  // The actual user (either the logged-in user or a related user selected for context)
  User: User;
  // Whether this is the original logged-in user or a related user
  IsOriginalUser: boolean;
  // If this is a related user, reference to the original logged-in user's ID
  OriginalUserId?: number;
}
