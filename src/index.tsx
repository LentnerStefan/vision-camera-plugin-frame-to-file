import { useMemo } from 'react';
import { VisionCameraProxy, type Frame } from 'react-native-vision-camera';

/**
 * An instance of the toFile plugin.
 */
export interface ToFilePlugin {
  toFile(frame: Frame): string;
}

function createToFilePlugin() {
  const toFilePlugin = VisionCameraProxy.initFrameProcessorPlugin('toFile', {});

  if (toFilePlugin == null) {
    throw new Error(
      'Cannot find vision-camera-plugin-to-frame! Did you install the native dependency properly?'
    );
  }

  return {
    toFile: (frame: Frame): string => {
      'worklet';
      const result = toFilePlugin.call(frame) as string;
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
