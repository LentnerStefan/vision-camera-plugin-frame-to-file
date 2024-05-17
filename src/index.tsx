import { useMemo } from 'react';
import { VisionCameraProxy, type Frame } from 'react-native-vision-camera';

export type DataType = 'uint8' | 'float32';

/** When the options are provided, will save the "resizedFrame" given and will completly ignore the "frame" first parameter */
export type Options = {
  /** The buffer of the resized frame returned by the resize plugin */
  resizedFrameBuffer: ArrayBufferLike;
  /** Extra properties needed to ensure file is saved correcty */
  resizedFrameProperties: {
    /** Width cannot be deduced from the ArrayBufferLike, so we need to explicitly provide it */
    width: number;
    /** Height cannot be deduced from the ArrayBufferLike, so we need to explicitly provide it */
    height: number;
    /** Only "argb" pixel format is supported for now, make sure you use it in the resize plugin as well */
    pixelFormat: 'argb';
    /** Only "uint8" data type is supported for now, make sure you use it in the resize plugin as well */
    dataType: 'uint8';
  };
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
