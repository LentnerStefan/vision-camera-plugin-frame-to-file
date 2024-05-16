#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>
#import <VisionCamera/Frame.h>
#import <VisionCamera/SharedArray.h>
#import <vision-camera-resize-plugin/FrameBuffer.h>
#import "ToFileHelper.h"


@interface ToFileFrameProcessorPlugin : FrameProcessorPlugin
@end

@implementation ToFileFrameProcessorPlugin{
    VisionCameraProxyHolder* _proxy;
}

- (instancetype)initWithProxy:(VisionCameraProxyHolder*)proxy withOptions:(NSDictionary*)options {
  if (self = [super initWithProxy:proxy withOptions:options]) {
    _proxy = proxy;
  }
  return self;
}

- (id)callback:(Frame*)frame withArguments:(NSDictionary*)arguments {
    CMSampleBufferRef buffer = frame.buffer;
    UIImageOrientation orientation = frame.orientation;
    
    
    // Extract `resizedFrame` from arguments and cast it to SharedArray
    FrameBuffer *resizedFrame = [arguments objectForKey:@"resizedFrame"];
    
    
    if (![resizedFrame isKindOfClass:[FrameBuffer class]]) {
        CMSampleBufferRef buffer = frame.buffer;
        UIImageOrientation orientation = frame.orientation;

        // Convert CMSampleBufferRef to UIImage
        CVImageBufferRef imageBuffer = CMSampleBufferGetImageBuffer(buffer);
        CIImage *ciImage = [CIImage imageWithCVImageBuffer:imageBuffer];
        UIImage *image = [UIImage imageWithCIImage:ciImage scale:1.0 orientation:orientation];

        // Call toFile method from ToFileHelper
        NSString *savedImagePath = [ToFileHelper toFile:image];

        // Return the saved image path or handle the result as needed
        if (savedImagePath) {
            return savedImagePath;
        } else {
            // Handle the error case, e.g., return nil or an error message
            return @"Error saving image";
        }
    }
    
    
    
    // New logic using smallFrame.data
    uint8_t *data = (uint8_t *)resizedFrame.sharedArray.data;

    if (data) {
        size_t width = resizedFrame.width;
        size_t height =  resizedFrame.height;
        size_t bitsPerComponent = resizedFrame.bytesPerChannel * 8;
        size_t bytesPerRow = resizedFrame.width * resizedFrame.bytesPerPixel;

        CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
        CGContextRef context = CGBitmapContextCreate(data, width, height, bitsPerComponent, bytesPerRow, colorSpace, kCGBitmapByteOrder32Big | kCGImageAlphaPremultipliedLast);
        CGImageRef imageRef = CGBitmapContextCreateImage(context);
        UIImage *image = [UIImage imageWithCGImage:imageRef];

        CGColorSpaceRelease(colorSpace);
        CGContextRelease(context);
        CGImageRelease(imageRef);

        // Call toFile method from ToFileHelper
        NSString *savedImagePath = [ToFileHelper toFile:image];

        // Return the saved image path or handle the result as needed
        if (savedImagePath) {
            return savedImagePath;
        } else {
            // Handle the error case, e.g., return nil or an error message
            return @"Error saving image";
        }
    } else {
        // Handle the case where data is not available
        return @"Error: No valid image data available.";
    }
}

VISION_EXPORT_FRAME_PROCESSOR(ToFileFrameProcessorPlugin, toFile)

@end
