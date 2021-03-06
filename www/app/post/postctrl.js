
angular.module('PostCtrl', ['ngLogExt'])
.controller('PostController', [ '$log', '$scope', '$state', '$rootScope',
    '$stateParams', '$ionicScrollDelegate', 'ngLJService',
    'BookmarksService', 'AuthService', 'TextService', 'AvatarService',
    function($log, $scope, $state, $rootScope,
    $stateParams, $ionicScrollDelegate, ngLJService,
    BookmarksService, AuthService, TextService, AvatarService) {

    var log = $log.context('PstCtrl');

    $scope.journal = $stateParams.journalName;
    $scope.postId = $stateParams.postId;

    $scope.defaultAvatar = AvatarService.defaultAvatar;

    $scope.error = false;
    $scope.loading = {
        loaded: false,
        post: false,
        comments: false
    };
    $scope.show = {
        comments: false
    };
    $scope.post = null;
    $scope.child = {};

    $scope.editData = {
        loggedIn: false,
        userName: null,
        canDelete: false
    };

    $scope.setEditData = function() {
        $scope.editData.loggedIn = AuthService.get_logged_in();
        $scope.editData.userName = AuthService.get_username();
        if ($scope.editData.userName) {
            $scope.editData.userName = $scope.editData.userName.replace(/-/g, '_');
        }
        if ($scope.post && $scope.post.poster) {
            $scope.editData.canDelete = ($scope.post.poster == AuthService.get_username());
        }
    };
    $scope.setEditData();

    $scope.deleteComment = function(journal,ditemid,dtalkid) {
        log.debug('deleteComment');

        ngLJService.delete_comments(
            AuthService.get_username(),
            AuthService.get_authdata(),
            journal,
            ditemid,
            dtalkid
        ).then(function(response) {
            $scope.error = false;
        }, function(){$scope.error = true;});

        $scope.clearComments();
    };

    $scope.deleteEntry = function() {
        log.debug('deleteEntry');

        ngLJService.delete_event(
            AuthService.get_username(),
            AuthService.get_authdata(),
            $scope.journal,
            $scope.postId
        ).then(function(response) {
            $scope.error = false;
        }, function(){$scope.error = true;});

        $scope.$emit('blgUpdateJournal',{journalName: $scope.journal});
        $scope.loadJournal($scope.journal);
    };

    var postHeight = null
    $scope.getPostSpinnerHeight = function(){
        if(!postHeight){
            postHeight = (document.documentElement.clientHeight/2) - 200;
        }
        return postHeight;
    };

    var commentsHeight = null
    $scope.getPostCommentsHeight = function(){
        if(!commentsHeight) {
            var rect = ionic.DomUtil.getTextBounds(document.querySelector('.blg-card'));
            var commentsHeight = rect.top + rect.height;
        }
        return commentsHeight;
    };

    $scope.getPost = function() {
        log.debug('getPost');
        $scope.loading.loaded = false;
        $scope.loading.post = true;
        ngLJService.get_event(
            AuthService.get_username(),
            AuthService.get_authdata(),
            $scope.journal,
            $scope.postId
        ).then(function(response) {
            $scope.error = false;
            $scope.preProcessPost(response[0].events[0]);
            $scope.post = response[0].events[0];
            $scope.loading.loaded = true;
            $scope.loading.post = false;
            $scope.setEditData();
        }, function(){$scope.error = true;});
    };

    $scope.preProcessPost = function(post) {
        if(!post['poster']) {
            post['poster'] = $scope.journal;
        }
        TextService.convert(post, 'subject');
        AvatarService.getAvatar(post, post.poster);
        TextService.convert(post, 'event', true);

        if(post.props) {
            if(post.props.taglist) {
                TextService.convert(post.props, 'taglist');
            }
            if(post.props.current_location) {
                TextService.convert(post.props, 'current_location');
            }
            if(post.props.current_mood) {
                TextService.convert(post.props, 'current_mood');
            }
        }
    };

    $scope.getComments = function() {
        log.debug('getComments');
        $scope.loading.comments = true;
        ngLJService.get_comments(
            AuthService.get_username(),
            AuthService.get_authdata(),
            $scope.journal,
            $scope.postId
        ).then(function(response) {
            $scope.error = false;
            $scope.child.children = response[0].comments;
            $scope.loading.comments = false;
        }, function(){$scope.error = true;});
    };

    $scope.preProcessComments = function(child) {
        $scope.loadComments(child);
//        for (var i = 0; i < child.children.length; i++) {
//            TextService.convert(child.children[i], 'subject');
//            TextService.convert(child.children[i], 'body');
//            AvatarService.getAvatar(child.children[i], child.children[i].postername);
//        }
    };

    $scope.loadComments = function(child) {
        if (!child.$$last_index) {
            child.$$last_index = 0;
        }

        var count = 5; // Max number of comments to load

        for (var i = count; child.$$last_index < child.children.length; i--) {
            if (!i) {
                break;
            }
//            console.log(child.children[child.$$last_index]);
            child.children[child.$$last_index].$$load = true;
            TextService.convert(child.children[child.$$last_index], 'subject');
            TextService.convert(child.children[child.$$last_index], 'body');
            AvatarService.getAvatar(child.children[child.$$last_index], child.children[child.$$last_index].postername);
            child.$$last_index++;
        }

        if (child.$$last_index < (child.children.length - 1)) {
            child.$$load_more = true;
        }
        else {
            child.$$load_more = false;
        }

        $ionicScrollDelegate.resize();
    };

    $scope.update = function() {
        log.debug('update');
        $scope.getPost();
    };

    $scope.$on('$ionicView.loaded', function(){
        BookmarksService.read_data();
        $scope.update();
    });

    $rootScope.$on('blgNewComment', function() {
        $scope.clearComments();
    });

    $rootScope.$on('blgLoginOk', function() {
        $scope.setEditData();
    });

    $rootScope.$on('blgLogoutOk', function() {
        $scope.setEditData();
    });

    $scope.clearComments = function() {
        $scope.error = false;
        $scope.show.comments = false;
        $scope.child = {};
    };

    $scope.toggleComment = function(child) {
        child.$$show = !child.$$show;
        $ionicScrollDelegate.resize();
    };

    $scope.loadJournal = function(journalName) {
        $state.go('app.journal',{journalName:journalName});
    };

    $scope.loadPost = function(journalName,postId) {
        $state.go('app.post',{journalName:journalName,postId:postId});
    };

    $scope.loadURL = function(url) {

        // open the page in the inAppBrowser plugin. Falls back to a blank page if the plugin isn't installed
        var params = 'location=no,' +
        'enableViewportScale=yes,' +
        'toolbarposition=top,' +
        'closebuttoncaption=Done';
        var iab = window.open(url,'_blank',params);
        // cordova tends to keep these in memory after they're gone so we'll help it forget
//        iab.addEventListener('exit', function() {
//            iab.removeEventListener('exit', argument.callee);
//            iab.close();
//            iab = null;
//        });
    };

    $scope.processLink = function(e) {
        log.debug('processLink: ' + e.toElement.tagName);
        if(e.toElement.tagName == "A"){
            log.debug('processLink: ' + e.toElement.href);
            log.debug('hostname: ' + e.toElement.hostname);
            log.debug('pathname: ' + e.toElement.pathname);

            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            var host = e.toElement.hostname;
            host = host.split('.');

            if (host[1] && host[1] == 'livejournal') {
                if (host[0]) {
                    var post = e.toElement.pathname;
                    post = post.split('/');
                    post = post[1].split('.');
                    if (post[0]) {
                        post[0] = post[0]/256 | 0;
                        log.debug('Open journal: ' + host[0] + ' / post: ' + post[0]);
                        $scope.loadPost(host[0],post[0]);
                    }
                }
            }
            else {
                $scope.loadURL(e.toElement.href);
            }
        }
        else if (e.toElement.tagName == "IMG") {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            $scope.loadURL(e.toElement.src);
        }
    };

    $scope.showImages = function(instance) {
        log.debug('showImages');
        for (var i = 0; i < instance.images.length; i++) {
            instance.images[i].img.parentNode.className = '';
        }
    };

    $scope.imgLoadedEvents = {

        always: function(instance) {
            log.debug('imgLoadedEvents - all images are loaded');
            $scope.showImages(instance);
        },

        done: function(instance) {
            log.debug('imgLoadedEvents - done');
        },

        fail: function(instance) {
            log.debug('imgLoadedEvents - fail');
        },

        progress: function(instance, image) {
            var result = image.isLoaded ? 'loaded' : 'broken';
            log.debug('image is ' + result + ' for ' + image.img.src);
            $ionicScrollDelegate.resize();
        }
    };
}])
.directive('img', function () {
    return {
        restrict: 'E',
        link: function (scope, element, attr) {
            element.wrap('<div class="blg-img-wrap"></div>');
        }
    };
})
.directive('compile', ['$compile', function ($compile) {
    return function(scope, element, attrs) {
        scope.$watch(
            function(scope) {
                // watch the 'compile' expression for changes
                return scope.$eval(attrs.compile);
            },
            function(value) {
                // when the 'compile' expression changes
                // assign it into the current DOM
                element.html(value);

                // compile the new DOM and link it to the current
                // scope.
                // NOTE: we only compile .childNodes so that
                // we don't get into infinite loop compiling ourselves
                $compile(element.contents())(scope);
            }
        );
    };
}])
.directive('ljEmbed', ['$log', '$compile', 'ngLJService', function($log, $compile, ngLJService) {
    var log = $log.context('ljEmbed');

    function link(scope, element, attrs) {

        //console.log(scope.post);

        log.debug('link: journal - ' + scope.journal +
                  ', postId - ' + scope.post.ditemid +
                  ', embed - ' + attrs.id);

        ngLJService.get_embed(
            scope.journal,
            scope.post.ditemid,
            attrs.id
        ).then(function(response) {
            log.debug('link: data ' + response);

            element[0].outerHTML = response;
            $compile(element.contents())(scope);

        }, function(){});

    };

    return {
        restrict: 'E',
        template: '<div class="blg-embed-wrap"><ion-spinner></ion-spinner></div>',
        link: link
    };
}]);
