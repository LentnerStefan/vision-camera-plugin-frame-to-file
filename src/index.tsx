import { useMemo } from 'react';
import { VisionCameraProxy, type Frame } from 'react-native-vision-camera';

export type Options = {
  resizedFrame: Uint8Array;
};

/**
 * An instance of the toFile plugin.
 */
export interface ToFilePlugin {
  toFile(frame: Frame, options?: Options): string;
}

function createToFilePlugin() {
  const toFilePlugin = VisionCameraProxy.initFrameProcessorPlugin('toFile', {});

  if (toFilePlugin == null) {
    throw new Error(
      'Cannot find react-native-vision-camera-plugin-frame-to-file! Did you install the native dependency properly?'
    );
  }

  return {
    toFile: (frame: Frame, options?: Options): string => {
      'worklet';
      const result = toFilePlugin.call(frame, options ?? {}) as string;
      return result;
    },
  };
}

/**
 * Use an instance of the toFile plugin.
 */
export function useToFilePlugin(): ToFilePlugin {
  return useMemo(() => createToFilePlugin(), []);
}
