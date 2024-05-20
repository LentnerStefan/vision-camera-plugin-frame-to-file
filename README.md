# react-native-vision-camera-plugin-frame-to-file

A [react-native-vision-camera](https://github.com/mrousavy/react-native-vision-camera) frame processor to save a frame to a file. Can be used to send frames to a server performing some remote image processing.

## Installation

```sh
npm install react-native-vision-camera-plugin-frame-to-file
```

## Saved file format

The frame is saved as a PNG file. Support for JPEG might come later on.

## Usage

> [!WARNING]
> - Only **IOS** is supported for now !
> - Saving an entire 3024x4032 frame produces a heavy files **~10/20mb**. Consider using [`runAtTargetFps`](https://react-native-vision-camera.com/docs/api/#runattargetfps)
> - Saving resized/cropped frames in combination with [react-native-resize-plugin](https://github.com/mrousavy/vision-camera-resize-plugin) can also be a good idea. **However only the `uint8` dataFormat & `argb` pixel format are supported.**


### Saving the full frame

```js
import { useToFilePlugin } from 'react-native-vision-camera-plugin-frame-to-file';

// ...
const frameProcessor = useFrameProcessor((frame) => {
  'worklet';
  const filePath = toFile(frame);
  // Do something with the saved file's path
  console.log(filePath);
}, []);
```

### Saving a resized frame using [react-native-resize-plugin](https://github.com/mrousavy/vision-camera-resize-plugin)

> [!IMPORTANT]
> - You still have to provide the `frame` as a first parameter, but it will be ignored. [Idea came from this issue](https://github.com/mrousavy/vision-camera-resize-plugin/issues/38#issuecomment-1930466136)

```js
import { useToFilePlugin } from 'react-native-vision-camera-plugin-frame-to-file';
import { useResizePlugin } from 'vision-camera-resize-plugin';

// ...
const RESIZE_FACTOR = 4;
const TARGET_TYPE = 'uint8' as const;
const TARGET_FORMAT = 'argb' as const;

// ...
const frameProcessor = useFrameProcessor((frame) => {
  'worklet';
  const resizedFrame = resize(frame, {
    dataType: TARGET_TYPE,
    pixelFormat: TARGET_FORMAT,
    scale: {
      width: frame.width / RESIZE_FACTOR,
      height: frame.height / RESIZE_FACTOR,
    },
  });
  const filePath = toFile(frame, {
    resizedFrameBuffer: resizedFrame.buffer,
    resizedFrameProperties: {
      width: frame.width / RESIZE_FACTOR,
      height: frame.height / RESIZE_FACTOR,
      dataType: TARGET_TYPE,
      pixelFormat: TARGET_FORMAT,
    },
  });
  // Do something with the saved file's path
  console.log(filePath);
}, []);
```

### Saving a resized/cropped frame using [vision-camera-resize-plugin's cropping feature](https://github.com/mrousavy/vision-camera-resize-plugin?tab=readme-ov-file#cropping)

> [!IMPORTANT]
> - You still have to provide the `frame` as a first parameter, but it will be ignored. [Idea came from this issue](https://github.com/mrousavy/vision-camera-resize-plugin/issues/38#issuecomment-1930466136)

```js
import { useToFilePlugin } from 'react-native-vision-camera-plugin-frame-to-file';
import { useResizePlugin } from 'vision-camera-resize-plugin';

// ...
const RESIZE_FACTOR = 4;
const TARGET_TYPE = 'uint8' as const;
const TARGET_FORMAT = 'argb' as const;

// This crop square is for you to adjust/determine
const cropSquare = {
    width: 0,
    height: 0,
    x: 100,
    y: 100
}

// ...
const frameProcessor = useFrameProcessor((frame) => {
  'worklet';
  const resizedFrame = resize(frame, {
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
  });
  const filePath = toFile(frame, {
    resizedFrameBuffer: resizedFrame.buffer,
    resizedFrameProperties: {
      width: cropSquare.width,
      height: cropSquare.height,
      dataType: TARGET_TYPE,
      pixelFormat: TARGET_FORMAT,
    },
  });
  // Do something with the saved file's path
  console.log(filePath);
}, []);
```

## Performance

### Saving the full frame

| iPhone 11  | Iphone 13 Pro |
| ------------- | ------------- |
| <img width="325" alt="Screenshot 2024-05-20 at 13 55 54" src="https://github.com/LentnerStefan/vision-camera-plugin-frame-to-file/assets/18282455/d618485b-b806-4c8c-ac84-47d159152437">  | <img width="316" alt="Screenshot 2024-05-20 at 12 09 52" src="https://github.com/LentnerStefan/vision-camera-plugin-frame-to-file/assets/18282455/ad01ff53-4288-4c30-9983-84adabb74806">  |


### Saving the resized frame

| iPhone 11  | Iphone 13 Pro |
| ------------- | ------------- |
| <img width="548" alt="Screenshot 2024-05-20 at 13 57 01" src="https://github.com/LentnerStefan/vision-camera-plugin-frame-to-file/assets/18282455/27148275-791f-43e6-9d25-cffef942be25">  | <img width="547" alt="Screenshot 2024-05-20 at 12 11 09" src="https://github.com/LentnerStefan/vision-camera-plugin-frame-to-file/assets/18282455/5fb306ca-388e-4158-bb99-0aa218bdc038">  |

### Saving a resized/cropped frame

| iPhone 11  | Iphone 13 Pro |
| ------------- | ------------- |
| <img width="534" alt="Screenshot 2024-05-20 at 13 57 28" src="https://github.com/LentnerStefan/vision-camera-plugin-frame-to-file/assets/18282455/699b5a7e-3676-44b2-bb57-92e66377c96c">  | <img width="534" alt="Screenshot 2024-05-20 at 12 13 16" src="https://github.com/LentnerStefan/vision-camera-plugin-frame-to-file/assets/18282455/55413ea1-5091-4302-9e2c-8c015915111e">  |

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
