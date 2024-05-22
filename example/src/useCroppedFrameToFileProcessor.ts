import { useFrameProcessor } from 'react-native-vision-camera';
import { useToFilePlugin } from 'react-native-vision-camera-plugin-frame-to-file';
import { useResizePlugin } from 'vision-camera-resize-plugin';
import { TARGET_TYPE, TARGET_FORMAT, RESIZE_FACTOR } from './contants';

export const useCroppedFrameToFileProcessor = (
  onPathUpdated: (path: string) => void
) => {
  const { toFile } = useToFilePlugin();
  const { resize } = useResizePlugin();

  return useFrameProcessor(
    (frame) => {
      'worklet';
      const side = Math.min(frame.width, frame.height) / RESIZE_FACTOR;
      const centerPoint = {
        x: frame.width / 2,
        y: frame.height / 2,
      };
      const cropSquare = {
        x: Math.round(centerPoint.x - side / 2),
        y: Math.round(centerPoint.y - side / 2),
        width: side,
        height: side,
      };

      const resizeOptions = {
        dataType: TARGET_TYPE,
        pixelFormat: TARGET_FORMAT,
        scale: {
          width: cropSquare.width,
          height: cropSquare.height,
        },
        crop: {
          x: cropSquare.x,
          y: cropSquare.y,
          width: cropSquare.width,
          height: cropSquare.height,
        },
      };
      const startResize = performance.now();
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
        `Frame cropped from ${frame.width}x${frame.height} to ${cropSquare.width}x${cropSquare.height} in ${timeToResize}ms; Saved to disk in ${timeToSaveToDisk}ms;`
      );
      onPathUpdated(filePath);
    },
    [toFile, onPathUpdated]
  );
};
