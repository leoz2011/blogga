
angular.module('PostCtrl', [])
.controller('PostController', function($scope, $stateParams, $sce,
                                        JournalService, PostService,
                                        AvatarService, LJService) {

    $scope.journalData = JournalService;
    $scope.postData = PostService;
    $scope.avatarData = AvatarService;

    $scope.journalId = $stateParams.journalId;
    $scope.postId = $stateParams.postId;
    
    $scope.title = '';
    $scope.content = '';
    
    $scope.post = {};
    
    $scope.child = {
    	children: []
    };    
    
    $scope.contents = [];
    
    $scope.load_post = function() {
    
        $scope.post = $scope.postData.get_post($scope.postId);
        
	    LJService.array_buffer_to_string($scope.post.subject).then(
	        function (v) {
	            $scope.title = v;
	        });
	    LJService.array_buffer_to_string($scope.post.event).then(
	        function (v) {
	            $scope.content = $sce.trustAsHtml(v);
	        });
	    
        LJService.get_userpics($scope.post.poster,cbGoodUserpic,cbFailUserpic,null);    
        
    };   
    
    $scope.get_journal_title = function() {
        return $scope.journalData.get_journal($scope.journalId).title;
    };    
    
    $scope.get_post_comments = function() {
    
        console.log('get_post_comments');
       
        LJService.get_comments($scope.post.itemid,
                               $scope.post.anum,
                               $scope.get_journal_title(),
                               cbGoodComments,cbFailComments,$scope.post.poster);
    };    
    
    cbGoodComments = function(data,id) {
        console.log('cbGoodComments for ' + id);
        $scope.child.children = data[0].comments;
    };
    
    cbFailComments = function(id) {
        console.log('cbFailComments for ' + id);
    };    

    $scope.get_content = function(content,id) {
//        console.log('get_content for ' + id);
		if (!$scope.contents.hasOwnProperty(id)) {		    
		    LJService.array_buffer_to_string(content).then(
		        function (v) {
//		            console.log('test: ' + v);
		            $scope.contents[id] = $sce.trustAsHtml(v);
		        });    
        }
    };    
});

