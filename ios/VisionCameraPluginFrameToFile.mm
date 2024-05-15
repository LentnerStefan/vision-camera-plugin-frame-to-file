#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>
#import <VisionCamera/Frame.h>

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
  // code goes here
  return @"cat";
}

VISION_EXPORT_FRAME_PROCESSOR(ToFileFrameProcessorPlugin, toFile)

@end
