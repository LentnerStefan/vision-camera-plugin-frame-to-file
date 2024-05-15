//
//  ImageSaver.m
//  DoubleConversion
//
//  Created by Stef on 15/05/2024.
//

#import "ImageSaver.h"

@implementation ImageSaver

+ (NSString *)saveImage:(UIImage *)image {
    NSString *uuidString = [[NSUUID UUID] UUIDString];
    NSString *fileName = [uuidString stringByAppendingPathExtension:@"png"];
    NSURL *url = [[NSFileManager defaultManager].temporaryDirectory URLByAppendingPathComponent:fileName];

    NSData *imageData = UIImagePNGRepresentation(image);
    NSError *error = nil;
    [imageData writeToURL:url options:NSDataWritingAtomic error:&error];

    if (error) {
        NSLog(@"Error saving image: %@", error.localizedDescription);
    }

    return url.path;
}
@end
