
interface MixerInfo {
  mixer: THREE.AnimationMixer, /* animation mixer to update */
  actions: Array<THREE.AnimationAction>, /* the animations themselves */
  index: number, /* starting animation index */
}

/**
 * @example
 * - const gAnimManager = new AnimationManager();
 * - gAnimManager.playNextAction(mixerinfo)
 * - gAnimManager.pushMixerInfo(mixerinfo)
 *
 */
export default class AnimationManager {
  private mixerInfos: Array<MixerInfo>;

  constructor() {
    this.mixerInfos = [];
  }

  playNextAction(mixerInfo: MixerInfo) {
    const {actions, index} = mixerInfo;
    const nextIndex = (index + 1) % actions.length;
    mixerInfo.index = nextIndex;
    actions.forEach((action, idx) => {
      const enabled = idx === index;
      action.enabled = enabled;
      if (enabled) {
        action.play();
      }
    });
  }

  push(mixerInfo: MixerInfo) {
    this.mixerInfos.push(mixerInfo);
  }

  mixers() {
    return this.mixerInfos;
  }

}
