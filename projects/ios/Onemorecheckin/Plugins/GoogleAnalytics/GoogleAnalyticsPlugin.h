#import <Foundation/Foundation.h>
#import "GAI.h"
#import <Cordova/CDV.h>
@interface GoogleAnalyticsPlugin : CDVPlugin

- (void) trackerWithTrackingId:(CDVInvokedUrlCommand*)command;
- (void) trackEventWithCategory:(CDVInvokedUrlCommand*)command;
- (void) trackView:(CDVInvokedUrlCommand*)command;

@end