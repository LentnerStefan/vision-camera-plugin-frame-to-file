import * as React from 'react';
import {
  StyleSheet,
  View,
  Switch,
  Text,
  Image,
  Dimensions,
} from 'react-native';
import { useToFilePlugin } from 'react-native-vision-camera-plugin-frame-to-file';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
  useCameraFormat,
} from 'react-native-vision-camera';
import { useResizePlugin } from 'vision-camera-resize-plugin';
import { useRunOnJS } from 'react-native-worklets-core';
import { getCenteredSquare, type Rectangle } from './utils';

const { height } = Dimensions.get('window');

// The resize factor for the frame
const RESIZE_FACTOR = 4;

const TARGET_TYPE = 'uint8' as const;
const TARGET_FORMAT = 'argb' as const;

export default function App() {
  // The device used
  const device = useCameraDevice('back');

  // The path of the saved file
  const [path, setPath] = React.useState<string | null>(null);
  // Toggle this to save the whole frame to disk or the resized frame
  const [resizeFrame, setResizeFrame] = React.useState(false);
  // Toggle this to enable the cropping of the frame to a centered square, needs SAVE_RESIZED_FRAME to be true
  const [cropToSquare, setCropToSquare] = React.useState(false);
  // The crop square coordinates, if needed.
  const [cropSquare, setCropSquare] = React.useState<Rectangle | null>(null);

  const handleSetResizeFrame = (value: boolean) => {
    setCropToSquare(false);
    setResizeFrame(value);
  };

  const handleSetCropToSquare = (value: boolean) => {
    if (!format) {
      throw new Error('Format is not set yet!');
    }
    // Manually set the crop square to the center of the frame, once.
    if (cropSquare === null) {
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
    }
    setCropToSquare(value);
  };

  // Video format, we use the max resolution to determine performance
  const format = useCameraFormat(device, [
    {
      videoResolution: 'max',
    },
    // We ideally want max fps as well
    { fps: 'max' },
  ]);

  // Plugins
  const { resize } = useResizePlugin();
  const { toFile } = useToFilePlugin();

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

      // Save the whole frame to disk
      if (!resizeFrame) {
        const startSaveToDisk = performance.now();

        const filePath = toFile(frame);
        const timeToSaveToDisk = Math.round(
          performance.now() - startSaveToDisk
        );
        console.log(
          `Frame ${frame.width}x${frame.height} saved to disk in ${timeToSaveToDisk}ms;`
        );
        updatePathFromFrameProcessor(filePath);
        return;
      }
      // Save the resized frame to disk
      if (!cropToSquare) {
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
          resizedFrame: resizedFrame.buffer,
          resizedFrameProperties: {
            width: resizeOptions.scale.width,
            height: resizeOptions.scale.height,
            dataType: TARGET_TYPE,
            pixelFormat: TARGET_FORMAT,
          },
        });
        const timeToSaveToDisk = Math.round(
          performance.now() - startSaveToDisk
        );
        console.log(
          `Frame resized from ${frame.width}x${frame.height} to ${resizeOptions.scale.width}x${resizeOptions.scale.height} in ${timeToResize}ms; Saved to disk in ${timeToSaveToDisk}ms;`
        );
        updatePathFromFrameProcessor(filePath);
        return;
      }
      // Save the resized + cropped frame to disk
      if (!cropSquare) {
        throw new Error('Crop square is not set yet!');
      }
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
        resizedFrame: resizedFrame.buffer,
        resizedFrameProperties: {
          width: resizeOptions.scale.width,
          height: resizeOptions.scale.height,
          dataType: TARGET_TYPE,
          pixelFormat: TARGET_FORMAT,
        },
      });
      const timeToSaveToDisk = Math.round(performance.now() - startSaveToDisk);
      console.log(
        `Frame cropped from ${frame.width}x${frame.height} to ${resizeOptions.scale.width}x${resizeOptions.scale.height} in ${timeToResize}ms; Saved to disk in ${timeToSaveToDisk}ms;`
      );
      updatePathFromFrameProcessor(filePath);
    },
    [resize, toFile, cropToSquare, resizeFrame]
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
            style={styles.filePreview}
            resizeMode="contain"
          />
        )}
      </View>
      <View style={styles.toggleContainer}>
        <View style={styles.toggleWithLabel}>
          <Text style={styles.toggleLabel}>Resize frame</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#3e3e3e"
            onValueChange={handleSetResizeFrame}
            value={resizeFrame}
          />
        </View>
        <View style={styles.toggleWithLabel}>
          <Text style={styles.toggleLabel}>Crop frame</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={resizeFrame === false ? '#808080' : '#FFFFFF'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={handleSetCropToSquare}
            value={cropToSquare}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
    backgroundColor: 'black',
  },
  toggleContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: 96,
  },
  toggleWithLabel: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    color: 'white',
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
    aspectRatio: 1,
  },
});
