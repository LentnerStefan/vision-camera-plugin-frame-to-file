#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>
#import <VisionCamera/Frame.h>
#import <VisionCamera/SharedArray.h>
#import "FrameToFileUtils.h"

@interface ToFileFrameProcessorPlugin : FrameProcessorPlugin
@end

@implementation ToFileFrameProcessorPlugin {
    VisionCameraProxyHolder* _proxy;
}

- (instancetype)initWithProxy:(VisionCameraProxyHolder*)proxy withOptions:(NSDictionary*)options {
    if (self = [super initWithProxy:proxy withOptions:options]) {
        _proxy = proxy;
    }
    return self;
}

- (id)callback:(Frame*)frame withArguments:(NSDictionary*)arguments {
    // Extract `resizedFrameBuffer` from arguments and cast it to SharedArray
    SharedArray *resizedFrameBuffer = [arguments objectForKey:@"resizedFrameBuffer"];
    // Extract the `resizedFrameProperties` from arguments and cast it to NSDictionary
    NSDictionary* resizedFrameProperties = arguments[@"resizedFrameProperties"];
    
    // No options are given, saving the full frame
    if (resizedFrameBuffer == nil && resizedFrameProperties == nil) {
        // Get the buffer from the frame
        CMSampleBufferRef buffer = frame.buffer;
        UIImageOrientation orientation = frame.orientation;
        
        // Convert CMSampleBufferRef to UIImage
        CVImageBufferRef imageBuffer = CMSampleBufferGetImageBuffer(buffer);
        CIImage *ciImage = [CIImage imageWithCVImageBuffer:imageBuffer];
        UIImage *image = [UIImage imageWithCIImage:ciImage scale:1.0 orientation:orientation];
        
        // Call toFile method from ToFileHelper
        NSString *savedImagePath = [FrameToFileUtils toFile:image];
        return savedImagePath;
    }
    
    // Verify validity of `resizedFrameBuffer`
    if (resizedFrameBuffer == nil || ![resizedFrameBuffer isKindOfClass:[SharedArray class]]) {
        @throw [NSException exceptionWithName:@"InvalidTypeException" reason:@"resizedFrameBuffer is either nil or not of type SharedArray" userInfo:nil];
    }

    // Verify validity of `resizedFrameProperties`
    if (resizedFrameProperties == nil || ![resizedFrameProperties isKindOfClass:[NSDictionary class]]) {
        @throw [NSException exceptionWithName:@"InvalidTypeException" reason:@"resizedFrameProperties is either nil or not of type NSDictionary" userInfo:nil];
    }

    // Extract the data from the frame
    uint8_t *data = (uint8_t *)resizedFrameBuffer.data;
    size_t dataLength = resizedFrameBuffer.size;
    
    if (data == nil || dataLength == 0) {
        @throw [NSException exceptionWithName:@"InvalidDataException" reason:@"resizedFrameBuffer has no data or data length is zero!" userInfo:nil];
    }
    
    NSNumber *widthNumber = resizedFrameProperties[@"width"];
    NSNumber *heightNumber = resizedFrameProperties[@"height"];

    size_t width = widthNumber.unsignedLongValue;
    size_t height = heightNumber.unsignedLongValue;

    // Validate width and height
    if (width == 0 || height == 0) {
        @throw [NSException exceptionWithName:@"InvalidSizeException" reason:@"Width or height is zero!" userInfo:nil];
    }

    // TODO: Support more data types & pixel formats
    // Number of bits per component (RGBA = 4 components, 8 bits each = 32 bits total)
    size_t bitsPerComponent = 8;
    // Number of bytes per pixel (RGBA = 4 bytes per pixel)
    size_t bytesPerPixel = 4;
    // Number of bytes per row (width * bytes per pixel)
    size_t bytesPerRow = width * bytesPerPixel;

    // Log the parameters being passed to CGContextCreate
    NSLog(@"Creating context with width: %zu, height: %zu, bitsPerComponent: %zu, bytesPerRow: %zu, colorSpace: DeviceRGB", width, height, bitsPerComponent, bytesPerRow);

    CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
    CGContextRef context = CGBitmapContextCreate(data, width, height, bitsPerComponent, bytesPerRow, colorSpace, kCGImageAlphaPremultipliedFirst);
    
    if (!context) {
        CGColorSpaceRelease(colorSpace);
        @throw [NSException exceptionWithName:@"ContextException" reason:@"Could not create context." userInfo:nil];
    }
    
    CGImageRef imageRef = CGBitmapContextCreateImage(context);
    if (!imageRef) {
        CGContextRelease(context);
        CGColorSpaceRelease(colorSpace);
        @throw [NSException exceptionWithName:@"ImageCreationException" reason:@"Could not create image." userInfo:nil];
    }
    
    UIImage *image = [UIImage imageWithCGImage:imageRef];
    CGColorSpaceRelease(colorSpace);
    CGContextRelease(context);
    CGImageRelease(imageRef);

    // Call toFile method from ToFileHelper
    NSString *savedImagePath = [FrameToFileUtils toFile:image];
    return savedImagePath;
}

VISION_EXPORT_FRAME_PROCESSOR(ToFileFrameProcessorPlugin, toFile)

@end
