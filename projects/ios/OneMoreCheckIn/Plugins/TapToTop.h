//
//  TapToTop.h
//  OneMoreCheckIn
//
//  Created by Manu on 05/01/13.
//
//

#import <Cordova/CDVPlugin.h>

@interface TapToTop : CDVPlugin

@property (nonatomic, retain) NSString* callbackId;

-(void)install:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
@end
