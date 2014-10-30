
angular.module('PostCtrl', [])
.controller('PostController', function($scope, $stateParams, $sce,
                                        AvatarService, ngLJService, LoginService) {

    $scope.avatarData = AvatarService;
    $scope.loginData = LoginService;

    $scope.journalName = $stateParams.journalName;
    $scope.postId = $stateParams.postId;
    
    $scope.post = {};
    
    $scope.child = {
    	children: []
    };
    
    $scope.load_post = function() {
    
        ngLJService.get_event($scope.journalName,
                              $scope.postId,
                              cbGoodPost,cbFailPost,$scope.postId,
                              $scope.loginData.get_username(),
                              $scope.loginData.get_password());
	                
    };
    
    cbGoodPost = function(data,id) {
    
        console.log('cbGoodPost for ' + id);
        
        $scope.post = data[0].events[0];
	        
	    $scope.get_title($scope.post);
	    
	    $scope.get_content($scope.post);
	        
	    $scope.avatarData.load_avatar($scope.post);
	        
	    $scope.get_post_comments();    
        
    };
    
    cbFailPost = function(id) {
        console.log('cbFailPost for ' + id);
    };
        
    $scope.get_post_comments = function() {
    
        console.log('get_post_comments');
       
        ngLJService.get_comments($scope.post.itemid,
                               $scope.post.anum,
                               $scope.journalName,
                               cbGoodComments,cbFailComments,$scope.post.poster,
                               $scope.loginData.get_username(),
                               $scope.loginData.get_password());
    };    
    
    cbGoodComments = function(data,id) {
        console.log('cbGoodComments for ' + id);
        $scope.child.children = data[0].comments;
    };
    
    cbFailComments = function(id) {
        console.log('cbFailComments for ' + id);
    };
    
    $scope.get_title = function(post) {
		if (!post.$$title) {
            post.$$title = ngLJService.decode_array_buffer(post.subject); 
        }
    };
    
    $scope.get_content = function(post) {
		if (!post.$$content) {
            post.$$content = $sce.trustAsHtml(ngLJService.decode_array_buffer(post.event));   
        }
    };    
    
    $scope.get_body = function(child) {
		if (!child.$$body) {
            child.$$body = $sce.trustAsHtml(ngLJService.decode_array_buffer(child.body));  
        }
    };    
});

