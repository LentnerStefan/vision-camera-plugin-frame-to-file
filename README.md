# react-native-vision-camera-plugin-frame-to-file

react-native-vision-camera frame processor to save a frame to a file

## Installation

```sh
npm install react-native-vision-camera-plugin-frame-to-file
```

## Saved file format

The frame is saved as a PNG file, I'll add support for JPEG later on.

## Pixel format & data type

When saving a resized frame, only `uint8` data type, and `argb` are working right now. This means you have to use these for the resize plugin as well!

**These limitations do not apply when saving the entire frame**

## Usage

### Saving the full frame

```js
import { useToFilePlugin } from 'react-native-vision-camera-plugin-frame-to-file';

// ...
const frameProcessor = useFrameProcessor((frame) => {
  'worklet';
  const filePath = toFile(frame);
  console.log(filePath);
}, []);
```

### Saving a resized frame

You can use this plugin in combination with [vision-camera-resize-plugin](https://github.com/mrousavy/vision-camera-resize-plugin).
In order to save the resized frame, you have to provide it to the options of the `toFile`.
⚠️ You still have to provide the `frame` as a first parameter, but it will be ignore. [Idea came from this issue](https://github.com/mrousavy/vision-camera-resize-plugin/issues/38#issuecomment-1930466136)

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
  console.log(filePath);
}, []);
```

### Saving a resized and cropped frame

You can also leverage vision-camera-resize-plugin's [cropping feature](https://github.com/mrousavy/vision-camera-resize-plugin?tab=readme-ov-file#cropping)

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
  console.log(filePath);
}, []);
```

## Performance

TODO: Add my own benchmarking.

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
