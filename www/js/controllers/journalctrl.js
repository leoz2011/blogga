
angular.module('JournalCtrl', [])
.controller('JournalController', function($scope, $stateParams, $sce,
                                           JournalService, PostService,
                                           AvatarService, ngLJService) {
    
    $scope.journalData = JournalService;
    $scope.postData = PostService;
    $scope.avatarData = AvatarService;

    $scope.journalName = $stateParams.journalName;
    
    $scope.journalData.set_current($scope.journalName);
        
    $scope.refresh_posts = function() {
    	$scope.postData.reset_posts();
    	$scope.postData.set_title($scope.journalName);
    	$scope.postData.load_posts(cbLoadPosts);
    };
    
    $scope.load_posts = function() {
    	$scope.postData.load_posts(cbLoadPosts);
    };
    
    $scope.can_load_posts = function() {
    	return $scope.postData.can_load_more();
    };
        
    cbLoadPosts = function() {
        $scope.$broadcast('scroll.refreshComplete');
    	$scope.$broadcast('scroll.infiniteScrollComplete');
    };
    
	$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if (fromParams && fromParams.journalName &&
            toParams && toParams.journalName &&
            toParams.journalName == fromParams.journalName) {
            // DO NOTHING
		}
		else {
		    $scope.load_posts();
		}
	});
    
    $scope.get_title = function(post) {
		if (!post.$$title) {		    
		    ngLJService.array_buffer_to_string(post.subject).then(
		        function (v) {
		            post.$$title = v;
		        });    
        }
    };
    
    $scope.get_content = function(post) {
		if (!post.$$content) {		    
		    ngLJService.array_buffer_to_string(post.event).then(
		        function (v) {
		            post.$$content = $sce.trustAsHtml(v);
		        });    
        }
    };

    $scope.toggle_show = function(i) {
        console.log(i + ' toggle_show');
        $scope.postData.posts[i].m_show = !$scope.postData.posts[i].m_show;
    };
    
})
.directive('stopEvent', function () {
	return {
		restrict: 'A',
		link: function (scope, element, attr) {
			element.bind(attr.stopEvent, function (e) {
				e.stopPropagation();
			});
		}
	};
});

