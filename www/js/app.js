
// Blogga LiveJournal client

angular.module('blogga', ['ionic', 'ngLiveJournal', 'MainRoute', 'MainCtrl', 'JournalCtrl', 'PostCtrl',
                          'JournalSrvc', 'PostSrvc', 'AvatarSrvc', 'StorageSrvc',
                          'DateFormatFilter', 'TimeFormatFilter', 'UnixFormatFilter'
                         ],
function($rootScopeProvider) {
	$rootScopeProvider.digestTtl(Infinity);
}).run(function($ionicPlatform) {

    // ImgCache
    ImgCache.options.debug = true;
    ImgCache.options.chromeQuota = 50*1024*1024;
   
    $ionicPlatform.ready(function() {

        // Splash Screen
        // Need following plug-ins:
		// cordova plugin add org.apache.cordova.splashscreen
        if(navigator && navigator.splashscreen) {
			setTimeout(function() {
				navigator.splashscreen.hide();
			}, 100);
		}
    
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if(window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
        
        // ImgCache
        // Need following plug-ins:
        // cordova plugin add org.apache.cordova.file
        // cordova plugin add org.apache.cordova.file-transfer        
        ImgCache.init(function() {
            console.log('ImgCache init: success!');
        }, function(){
            console.log('ImgCache init: error! Check the log for errors');
        });
        
    });
}).directive('ngCache', function() {
    return {
        restrict: 'A',
        link: function(scope, el, attrs) {

            attrs.$observe('ngSrc', function(src) {

                ImgCache.isCached(src, function(path, success) {
                    if (success) {
                        ImgCache.useCachedFile(el);
                    } else {
                        ImgCache.cacheFile(src, function() {
                            ImgCache.useCachedFile(el);
                        });
                    }
                });
            });
        }
    };
});



