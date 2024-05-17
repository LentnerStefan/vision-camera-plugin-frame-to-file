import * as React from 'react';
import { StyleSheet, View, Text, Image, Dimensions } from 'react-native';
import { useToFilePlugin } from 'react-native-vision-camera-plugin-frame-to-file';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
  runAtTargetFps,
  useCameraFormat,
} from 'react-native-vision-camera';
import { useResizePlugin } from 'vision-camera-resize-plugin';
import { useRunOnJS } from 'react-native-worklets-core';
import { getCenteredSquare, type Rectangle } from './utils';

const { height } = Dimensions.get('window');

// Toggle this to save the whole frame to disk or the resized frame
const SAVE_RESIZED_FRAME = true;

const RESIZE_FACTOR = 4;

const TARGET_TYPE = 'uint8' as const;
const TARGET_FORMAT = 'argb' as const;

export default function App() {
  // Toggle this to enable the cropping of the frame to a centered square, needs SAVE_RESIZED_FRAME to be true
  const CROP_TO_SQUARE = true;

  const device = useCameraDevice('back');
  const [path, setPath] = React.useState<string | null>(null);
  const [cropSquare, setCropSquare] = React.useState<Rectangle | null>(null);

  const { resize } = useResizePlugin();
  const { toFile } = useToFilePlugin();

  const format = useCameraFormat(device, [
    {
      videoResolution: 'max',
    },
    // We ideally want max fps, so  QR detection algorithm can run as fast as possible
    { fps: 'max' },
  ]);

  React.useEffect(() => {
    if (!format || !CROP_TO_SQUARE) return;

    setCropSquare(
      getCenteredSquare(
        Math.min(format.videoWidth, format.videoHeight) / RESIZE_FACTOR,
        {
          // inverted because format specified in landscape
          width: format.videoHeight,
          height: format.videoWidth,
        }
      )
    );
  }, [format, CROP_TO_SQUARE]);

  const updatePathFromFrameProcessor = useRunOnJS((newPath: string) => {
    setPath(newPath);
  }, []);

  const {
    hasPermission: hasCameraPermission,
    requestPermission: requestCameraPermission,
  } = useCameraPermission();

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
          console.log(`Full frame saved to disk in ${timeToSaveToDisk}ms;`);
          updatePathFromFrameProcessor(filePath);
          return;
        }
        // Or save the resized frame

        const resizeConfiguration =
          CROP_TO_SQUARE && !!cropSquare
            ? {
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
              }
            : {
                dataType: TARGET_TYPE,
                pixelFormat: TARGET_FORMAT,
                scale: {
                  width: frame.width / RESIZE_FACTOR,
                  height: frame.height / RESIZE_FACTOR,
                },
              };

        const startResize = performance.now();

        const resizedFrame = resize(frame, resizeConfiguration);

        const timeToResize = Math.round(performance.now() - startResize);
        const startSaveToDisk = performance.now();

        const filePath = toFile(frame, {
          resizedFrame: resizedFrame.buffer,
          resizedFrameProperties: {
            width: resizeConfiguration.scale.width,
            height: resizeConfiguration.scale.height,
            dataType: TARGET_TYPE,
            pixelFormat: TARGET_FORMAT,
          },
        });
        const timeToSaveToDisk = Math.round(
          performance.now() - startSaveToDisk
        );
        console.log(
          `Frame ${CROP_TO_SQUARE ? 'cropped' : 'resized'} from ${frame.width}x${frame.height} to ${resizeConfiguration.scale.width}x${resizeConfiguration.scale.height} in ${timeToResize}ms; Saved to disk in ${timeToSaveToDisk}ms;`
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

  if (!device || !format) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Camera
        style={styles.camera}
        enableFpsGraph
        isActive
        device={device}
        format={format}
        frameProcessor={fakeFrameProcessor}
        resizeMode="contain"
      />
      <View style={styles.filePreviewContainer}>
        {path !== null && (
          <Image
            source={{ uri: `file://${path}` }}
            style={{
              ...styles.filePreview,
              aspectRatio: !SAVE_RESIZED_FRAME
                ? format.videoHeight / format.videoWidth
                : cropSquare
                  ? cropSquare.height / cropSquare.width
                  : 1,
            }}
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
    borderWidth: 2,
    borderColor: '#CECFD1',
    borderRadius: 8,
  },
});
