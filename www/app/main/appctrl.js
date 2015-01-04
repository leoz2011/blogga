
angular.module('AppCtrl', [])
.controller('AppController', function($scope, $ionicModal, TextService, AuthService, AvatarService, FriendsService, GroupsService) {

    $scope.loggedIn = false;
    $scope.activeList = 'bookmarks';
    $scope.loginData = {};

    $scope.user = {
        username: '',
        password : ''
    };

    $ionicModal.fromTemplateUrl('app/main/login.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });

    $scope.closeLogin = function() {
        $scope.modal.hide();
        $scope.loginData.$$error = null;
//        AuthService.clear_credentials();
//        $scope.loggedIn = false;
    };

    $scope.login = function() {
        $scope.modal.show();
    };

    $scope.doLogin = function() {
        console.log('Doing login ', $scope.loginData);
        $scope.loginData.$$error = null;
        AuthService.set_credentials($scope.loginData.username,$scope.loginData.password);
        GroupsService.read_groups($scope.cbLoginOk,$scope.cbLoginFailed);
    };

    $scope.cbLoginOk = function() {
        console.log('Login OK');
        $scope.loginData.$$error = null;
        AvatarService.getAvatar($scope.loginData, $scope.loginData.username);
        FriendsService.read_friends();
        $scope.loggedIn = true;
        $scope.closeLogin();
    };

    $scope.cbLoginFailed = function(reason) {
        console.log('Login Failed');
        TextService.convert(reason, 'message');
        console.log(reason);
        $scope.loginData.$$error = reason;
        AuthService.clear_credentials();
        $scope.loggedIn = false;
    };

    $scope.logout = function() {
        AuthService.clear_credentials();
        $scope.loggedIn = false;
        $scope.activeList = 'bookmarks';
    };

    $scope.isLoggedIn = function() {
        return $scope.loggedIn;
    };

    $scope.getList = function() {
        return $scope.activeList;
    };

    $scope.setList = function(list) {
        return $scope.activeList = list;
    };

    $scope.getTop = function() {
        var offset = ionic.Platform.isIOS() ? 20 : 0;
        return (($scope.isLoggedIn() ? 272 : 134) + offset) + 'px';
    }
});
