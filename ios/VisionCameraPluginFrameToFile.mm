#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>
#import <VisionCamera/Frame.h>
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

VISION_EXPORT_FRAME_PROCESSOR(ToFileFrameProcessorPlugin, toFile)

@end
