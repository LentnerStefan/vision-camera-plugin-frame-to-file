import * as React from 'react';
import { StyleSheet, View, Text, Image, Dimensions } from 'react-native';
import { useToFilePlugin } from 'react-native-vision-camera-plugin-frame-to-file';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
  runAtTargetFps,
} from 'react-native-vision-camera';
import { useResizePlugin } from 'vision-camera-resize-plugin';
import { useRunOnJS } from 'react-native-worklets-core';

const { height } = Dimensions.get('window');

// Toggle this to save the whole frame to disk or the resized frame
const SAVE_RESIZED_FRAME = true;

const RESIZE_FACTOR = 4;

const TARGET_TYPE = 'uint8' as const;
const TARGET_FORMAT = 'argb' as const;

export default function App() {
  const device = useCameraDevice('back');
  const [path, setPath] = React.useState<string | null>(null);
  const { resize } = useResizePlugin();

  const { toFile } = useToFilePlugin();

  const updatePathFromFrameProcessor = useRunOnJS((newPath: string) => {
    setPath(newPath);
  }, []);

  const {
    hasPermission: hasCameraPermission,
    requestPermission: requestCameraPermission,
  } = useCameraPermission();

  // Triggers the opening of the device settings if the user denies the permission request.
  const handleCameraPermissionRequest = async () => {
    await requestCameraPermission();
  };

  const fakeFrameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';

      runAtTargetFps(1, () => {
        'worklet';
        // Save the whole frame to disk
        if (!SAVE_RESIZED_FRAME) {
          const startSaveToDisk = performance.now();

          const filePath = toFile(frame);
          const timeToSaveToDisk = Math.round(
            performance.now() - startSaveToDisk
          );
          console.log(`Frame saved to disk in ${timeToSaveToDisk}ms;`);
          updatePathFromFrameProcessor(filePath);
          return;
        }
        // Or save the resized frame

        const targetDimensions = {
          width: frame.width / RESIZE_FACTOR,
          height: frame.height / RESIZE_FACTOR,
        };

        const startResize = performance.now();
        const resizedFrame = resize(frame, {
          dataType: TARGET_TYPE,
          pixelFormat: TARGET_FORMAT,
          scale: targetDimensions,
        });

        const timeToResize = Math.round(performance.now() - startResize);
        const startSaveToDisk = performance.now();

        const filePath = toFile(frame, {
          resizedFrame: resizedFrame.buffer,
          resizedFrameProperties: {
            width: targetDimensions.width,
            height: targetDimensions.height,
            dataType: TARGET_TYPE,
            pixelFormat: TARGET_FORMAT,
          },
        });
        const timeToSaveToDisk = Math.round(
          performance.now() - startSaveToDisk
        );
        console.log(
          `Frame resized from ${frame.width}x${frame.height} to ${targetDimensions.width}x${targetDimensions.height} in ${timeToResize}ms; Saved to disk in ${timeToSaveToDisk}ms;`
        );
        updatePathFromFrameProcessor(filePath);
      });
    },
    [resize, toFile]
  );

  if (!hasCameraPermission) {
    return (
      <View
        style={styles.container}
        onTouchStart={handleCameraPermissionRequest}
      >
        <Text>Missing permission! Press here</Text>
      </View>
    );
  }
  if (!device) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Camera
        style={styles.camera}
        enableFpsGraph
        isActive
        device={device}
        frameProcessor={fakeFrameProcessor}
        resizeMode="contain"
      />
      <View style={styles.filePreviewContainer}>
        {path !== null && (
          <Image
            source={{ uri: `file://${path}` }}
            style={styles.filePreview}
            resizeMode="contain"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  filePreviewContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 24,
  },
  filePreview: {
    height: height / 3.5,
    aspectRatio: 9 / 16,
    borderWidth: 2,
    borderColor: '#CECFD1',
    borderRadius: 8,
  },
});
