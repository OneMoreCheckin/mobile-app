#import "GoogleAnalyticsPlugin.h"
// Dispatch period in seconds
static const NSInteger kGANDispatchPeriodSec = 2;
@implementation GoogleAnalyticsPlugin


- (void) trackerWithTrackingId:(CDVInvokedUrlCommand*)command
{
    NSString* accountId = [command.arguments objectAtIndex:0];
    [GAI sharedInstance].debug = NO;
    [GAI sharedInstance].dispatchInterval = kGANDispatchPeriodSec;
    [GAI sharedInstance].trackUncaughtExceptions = YES;
    [[GAI sharedInstance] trackerWithTrackingId:accountId];
}
- (void) trackEventWithCategory:(CDVInvokedUrlCommand*)command
{
    NSString* category = [command.arguments objectAtIndex:0];
    NSString* action = [command.arguments objectAtIndex:1];
    NSString* label = [command.arguments objectAtIndex:2];
    NSNumber* value = [command.arguments objectAtIndex:3];
    if (![[GAI sharedInstance].defaultTracker sendEventWithCategory:category
                                                          withAction:action
                                                           withLabel:label
                                                           withValue:value]) {
        // Handle error here
        NSLog(@"GoogleAnalyticsPlugin.trackEvent Error::");
        
    }
}

- (void) trackView:(CDVInvokedUrlCommand*)command
{
    NSString* pageUri = [command.arguments objectAtIndex:0];
    NSLog(@"track page view %@", pageUri);
    
    if (![[GAI sharedInstance].defaultTracker sendView:pageUri]) {
        // TODO: Handle error here
        NSLog(@"ERROR TRACK VIEW");
    }
}


@end