// Relative interface for linked accounts

import { Relationship } from './relationship.interfaces';
import { User } from './user.interfaces';

export interface Relative extends User {
  Relationship: Relationship;
}
