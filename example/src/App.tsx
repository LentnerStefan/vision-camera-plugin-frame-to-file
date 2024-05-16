import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useToFilePlugin } from 'react-native-vision-camera-plugin-frame-to-file';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
  runAtTargetFps,
} from 'react-native-vision-camera';
import { useResizePlugin, type Options } from 'vision-camera-resize-plugin';

type PixelFormat = Options<'uint8'>['pixelFormat'];

const WIDTH = 480;
const HEIGHT = 640;
const TARGET_TYPE = 'uint8' as const;
const TARGET_FORMAT: PixelFormat = 'rgb';

export default function App() {
  const device = useCameraDevice('back');
  const { resize } = useResizePlugin();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { toFile: _toFile } = useToFilePlugin();

  const {
    hasPermission: hasCameraPermission,
    requestPermission: requestCameraPermission,
  } = useCameraPermission();

  // Triggers the opening of the device settings if the user denies the permission request.
  const handleCameraPermissionRequest = async () => {
    await requestCameraPermission();
  };

  const fakeFrameProcessor = useFrameProcessor((frame) => {
    'worklet';
    runAtTargetFps(1, () => {
      'worklet';
      const startResize = performance.now();
      const resizedFrame = resize(frame, {
        dataType: TARGET_TYPE,
        pixelFormat: TARGET_FORMAT,
        scale: {
          width: WIDTH,
          height: HEIGHT,
        },
      });
      const timeToResize = Math.round(performance.now() - startResize);
      console.log(
        `Frame resized from ${frame.width}x${frame.height} to ${resizedFrame.byteLength / HEIGHT / 3}x${resizedFrame.byteLength / WIDTH / 3} in ${timeToResize}ms`
      );
      // const filePath = toFile(frame);
    });
  }, []);

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
        isActive
        device={device}
        frameProcessor={fakeFrameProcessor}
      />
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
});
