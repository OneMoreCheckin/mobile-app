<!--
#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
# 
# http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#  KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#
-->
# Cordova Plugin Upgrade Guide #

This document is for developers who need to upgrade their Cordova  plugins to a newer Cordova version. Starting with Cordova 1.5.0, some classes have been renamed, which will require the plugin to be upgraded. Make sure your project itself has been upgraded using the "Cordova Upgrade Guide" document.

## Upgrading older Cordova plugins to 2.1.0 ##

1. **Install** Cordova 2.1.0
2. Follow the **"Upgrading older Cordova plugins to 2.0.0"** section, if necessary
3. **Change** in the method signature of the **CordovaLib's JSONKit method categories**, they are prefixed with "cdvjk_" now:

    e.g.
    
        [myDict cdvjk_JSONString];
        
   instead of:
   
        [myDict JSONString];
        
4. **Support** a new plugin method signature (old signature is deprecated):

    The **new** signature is:

        - (void) myMethod:(CDVInvokedUrlCommand*)command;

    The **old (deprecated**) signature is:

        - (void) myMethod:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

    Basically, the options dictionary has been removed for the new signature, and the callbackId is not the 0th index item for the arguments array, but it is now in a separate property. View [CDVInvokedUrlCommand.h](https://github.com/apache/incubator-cordova-ios/blob/master/CordovaLib/Classes/CDVInvokedUrlCommand.h)
    
## Upgrading older Cordova plugins to 2.0.0 ##

1. **Install** Cordova 2.0.0
2. Follow the **"Upgrading older Cordova plugins to 1.9.0"** section, if necessary
3. No changes in plugin structure from 1.9.x
4. Change in import header use: in 2.0.0, Cordova projects use the CordovaLib project as a subproject, it now uses the CORDOVA_FRAMEWORK styled import like this:

        #import <Cordova/CDV.h>
        
   instead of like this:
   
        #import "CDV.h"
        
    So now in 2.0.0, Cordova import headers are unified.
    
**NOTE:** The deprecated for 2.0.0 CDVPlugin methods **verifyArguments** and **appViewController** have been removed.

## Upgrading older Cordova plugins to 1.9.0 ##

1. **Install** Cordova 1.9.0
2. Follow the **"Upgrading older Cordova plugins to 1.8.0"** section, if necessary
3. No changes in plugin structure from 1.8.x


## Upgrading older Cordova plugins to 1.8.0 ##

1. **Install** Cordova 1.8.0
2. Follow the **"Upgrading older Cordova plugins to 1.7.0"** section, if necessary
3. No changes in plugin structure from 1.7.x

## Upgrading older Cordova plugins to 1.7.0 ##

1. **Install** Cordova 1.7.0
2. Follow the **"Upgrading older Cordova plugins to 1.6.0"** section, if necessary
3. No changes in plugin structure from 1.6.x


## Upgrading older Cordova plugins to 1.6.x ##

1. **Install** Cordova 1.6.x
2. Follow the **"Upgrading older Cordova plugins to 1.5.0"** section, if necessary
3. See the **1.6.0 Plugin Notes** section for new functionality available to plugins
4. The global **"Cordova"** (upper-case C) was renamed to **"cordova"** (lower-case c) to match the cordova-js Android implementation in 1.5.0 that is now common to Android, BlackBerry and iOS. Please rename your calls to reflect the new lower-case **c**, or you can add a shim (which will support older versions) like so:

    a. Wrap your plugin JavaScript in a temporary scope (self-executing function) - see ["Temporary Scope"](http://ejohn.org/apps/learn/#57) or [this](https://github.com/phonegap/phonegap-plugins/wiki/Wrapping-your-Plugin's-JavaScript)
    
    b. Inside your temporary scope, set a **local var** to the global PhoneGap/Cordova/cordova object, for the exec function
    
            var cordovaRef = window.PhoneGap || window.Cordova || window.cordova; // old to new fallbacks
        
    c. Replace any **PhoneGap** or **Cordova** or **cordova** in your plugin JavaScript (within the temporary scope), with **cordovaRef** above
        


## Upgrading older Cordova plugins to 1.5.0 ##

1. **Install** Cordova 1.5.0
2. Replace macro occurrences of **"PHONEGAP\_FRAMEWORK"** with **"CORDOVA\_FRAMEWORK"**
3. Replace import occurrences of **"&lt;PhoneGap/"** with **"&lt;Cordova/"**
4. Replace class prefixes of **PG** with **CDV** (for example **PG**Plugin becomes **CDV**Plugin)
5. Replace occurrences of **[self appViewController]** with **self.viewController**. 
6. See the **1.5.0 Plugin Notes** section for new functionality available to plugins

## 1.6.0 Plugin Notes ##

1. There is a new CDVCommandDelegate protocol method available:

        - (void) registerPlugin:(CDVPlugin*)plugin withClassName:(NSString*)className;
    
    You use this in your plugin to initialize another plugin that your plugin needs to be available and running (dependency), and all plugins can access the registered plugin from the **getCommandInstance** method of the CDVCommandDelegate. This is a substitute for listing a plugin your plugin depends on, in **Cordova.plist/Plugins**.
2. There is a new **IsAtLeastiOSVersion** macro available in **CDVAvailability.h**:

        // Returns YES if it is at least version specified as NSString(X)
        if (IsAtLeastiOSVersion(@"5.1")) {
            // do something for iOS 5.1 or greater
        }
3. There are **Compatibility headers** available for versions 0.9.6 and 1.5.0, in **~/Documents/CordovaLib/Classes/compatibility** (where ~ signifies your Home folder). See the **"README.txt"** in that folder for instructions. 
    
    Note that including these headers are all or nothing - you can't have a mix and match of plugin versions, if you include the 0.9.6 compatibility header - all your plugins must be of the same "version". It is highly recommended that you upgrade your plugins to the current version instead of using these stop-gap headers. 
    
    The 1.5.0 header shouldn't be used - this is included for the [LocalStorage patch](https://issues.apache.org/jira/browse/CB-330) and is for using core plugins as general plugins that easily support multiple versions, and may be removed in the future.


## 1.5.0 Plugin Notes ##

1. The UIViewController returned from the **viewController property** will be a CDVViewController subclass.
2. The **appDelegate method** basically returns an (id) now, and is the same as calling **[[UIApplication sharedApplication] delegate]**. In the past it returned a PhoneGapDelegate class.
3. There is a new **commandDelegate property** now, which gives access to the [CDVCommandDelegate protocol](https://github.com/apache/incubator-cordova-ios/blob/master/CordovaLib/Classes/CDVCommandDelegate.h) used by the app
4. There is a new header file **CDVAvailability.h** that defines Cordova versions during compile time - to check for the current version during run-time, call **[CDVViewController cordovaVersion]**


