//
//  ToFileHelper.m
//
//  Created by Stef on 15/05/2024.
//

#import "ToFileHelper.h"

@implementation ToFileHelper

+ (NSString *)toFile:(UIImage *)image {
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
