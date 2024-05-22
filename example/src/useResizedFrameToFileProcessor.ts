import { useFrameProcessor } from 'react-native-vision-camera';
import { useToFilePlugin } from 'react-native-vision-camera-plugin-frame-to-file';
import { useResizePlugin } from 'vision-camera-resize-plugin';
import { TARGET_TYPE, TARGET_FORMAT, RESIZE_FACTOR } from './contants';

export const useResizedFrameToFileProcessor = (
  onPathUpdated: (path: string) => void
) => {
  const { toFile } = useToFilePlugin();
  const { resize } = useResizePlugin();

  return useFrameProcessor(
    (frame) => {
      'worklet';
      const startResize = performance.now();
      const resizeOptions = {
        dataType: TARGET_TYPE,
        pixelFormat: TARGET_FORMAT,
        scale: {
          width: frame.width / RESIZE_FACTOR,
          height: frame.height / RESIZE_FACTOR,
        },
      };
      const resizedFrame = resize(frame, resizeOptions);
      const timeToResize = Math.round(performance.now() - startResize);
      const startSaveToDisk = performance.now();
      const filePath = toFile(frame, {
        resizedFrameBuffer: resizedFrame.buffer,
        resizedFrameProperties: {
          width: resizeOptions.scale.width,
          height: resizeOptions.scale.height,
          dataType: TARGET_TYPE,
          pixelFormat: TARGET_FORMAT,
        },
      });
      const timeToSaveToDisk = Math.round(performance.now() - startSaveToDisk);
      console.log(
        `Frame resized from ${frame.width}x${frame.height} to ${resizeOptions.scale.width}x${resizeOptions.scale.height} in ${timeToResize}ms; Saved to disk in ${timeToSaveToDisk}ms;`
      );
      onPathUpdated(filePath);
    },
    [toFile, onPathUpdated]
  );
};
