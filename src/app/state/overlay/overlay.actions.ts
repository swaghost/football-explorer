/**
 * Overlay State Actions
 */

import { IOverlaySet, IOverlayItem } from '../../interfaces/overlay/overlay.interface';

export namespace OverlayActions {
  export class CreateOverlaySet {
    static readonly type = '[Overlay] Create Overlay Set';
    constructor(public payload: { name: string }) {}
  }

  export class DeleteOverlaySet {
    static readonly type = '[Overlay] Delete Overlay Set';
    constructor(public payload: { setId: string }) {}
  }

  export class SelectOverlaySet {
    static readonly type = '[Overlay] Select Overlay Set';
    constructor(public payload: { setId: string | null }) {}
  }

  export class AddOverlayItem {
    static readonly type = '[Overlay] Add Overlay Item';
    constructor(
      public payload: {
        setId: string;
        element: string;
        location: string;
      }
    ) {}
  }

  export class RemoveOverlayItem {
    static readonly type = '[Overlay] Remove Overlay Item';
    constructor(
      public payload: {
        setId: string;
        itemId: string;
      }
    ) {}
  }

  export class ClearOverlaySet {
    static readonly type = '[Overlay] Clear Overlay Set';
    constructor(public payload: { setId: string }) {}
  }

  export class LoadOverlaySets {
    static readonly type = '[Overlay] Load Overlay Sets';
    constructor(public payload: { sets: IOverlaySet[] }) {}
  }
}
