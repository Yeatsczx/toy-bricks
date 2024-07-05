import { Patch, applyPatches } from 'immer';

type Timeline = Array<{
  patches: Patch[];
  inversePatches: Patch[];
  timestamp: number;
}>;

export const HISTORY_ACTIONS = {
  UNDO: 'HISTORY_UNDO',
  REDO: 'HISTORY_REDO',
  THROTTLE: 'HISTORY_THROTTLE',
  IGNORE: 'HISTORY_IGNORE',
  MERGE: 'HISTORY_MERGE',
  CLEAR: 'HISTORY_CLEAR',
};

export class History {
  timeline: Timeline = [];
  pointer = -1;

  add(patches: Patch[], inversePatches: Patch[]) {
    if (patches.length === 0 && inversePatches.length === 0) {
      return;
    }

    this.pointer = this.pointer + 1;
    this.timeline.length = this.pointer;
    this.timeline[this.pointer] = {
      patches,
      inversePatches,
      timestamp: Date.now(),
    };
  }

  throttleAdd(
    patches: Patch[],
    inversePatches: Patch[],
    throttleRate: number = 500
  ) {
    if (patches.length === 0 && inversePatches.length === 0) {
      return;
    }

    if (this.timeline.length && this.pointer >= 0) {
      const {
        patches: currPatches,
        inversePatches: currInversePatches,
        timestamp,
      } = this.timeline[this.pointer];

      const now = new Date();
      const diff = now.getTime() - timestamp;
      // 把时间间隔很短的几次 作为一次历史记录
      if (diff < throttleRate) {
        this.timeline[this.pointer] = {
          timestamp,
          patches: [...currPatches, ...patches],
          inversePatches: [...inversePatches, ...currInversePatches],
        };
        return;
      }
    }

    this.add(patches, inversePatches);
  }
  // 除了增加关于这次修改的记录，还将这次修改记录合并到上次最新的记录
  merge(patches: Patch[], inversePatches: Patch[]) {
    if (patches.length === 0 && inversePatches.length === 0) {
      return;
    }

    if (this.timeline.length && this.pointer >= 0) {
      const {
        patches: currPatches,
        inversePatches: currInversePatches,
        timestamp,
      } = this.timeline[this.pointer];

      this.timeline[this.pointer] = {
        timestamp,
        patches: [...currPatches, ...patches],
        inversePatches: [...inversePatches, ...currInversePatches],
      };
      return;
    }

    this.add(patches, inversePatches);
  }

  clear() {
    this.timeline = [];
    this.pointer = -1;
  }

  canUndo() {
    return this.pointer >= 0;
  }

  canRedo() {
    return this.pointer < this.timeline.length - 1;
  }

  undo(state) {
    if (!this.canUndo()) {
      return;
    }

    const { inversePatches } = this.timeline[this.pointer];
    this.pointer = this.pointer - 1;
    return applyPatches(state, inversePatches);
  }

  redo(state) {
    if (!this.canRedo()) {
      return;
    }

    this.pointer = this.pointer + 1;
    const { patches } = this.timeline[this.pointer];
    return applyPatches(state, patches);
  }
}
