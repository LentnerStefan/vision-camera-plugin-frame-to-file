import { useFrameProcessor } from 'react-native-vision-camera';
import { useToFilePlugin } from 'react-native-vision-camera-plugin-frame-to-file';

export const useFrameToFileProcessor = (
  onPathUpdated: (path: string) => void
) => {
  const { toFile } = useToFilePlugin();
  return useFrameProcessor(
    (frame) => {
      'worklet';
      const startSaveToDisk = performance.now();

      const filePath = toFile(frame);
      const timeToSaveToDisk = Math.round(performance.now() - startSaveToDisk);
      console.log(
        `Frame ${frame.width}x${frame.height} saved to disk in ${timeToSaveToDisk}ms;`
      );
      onPathUpdated(filePath);
    },
    [toFile, onPathUpdated]
  );
};
