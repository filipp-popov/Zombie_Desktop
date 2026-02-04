'use strict';

angular.module('myApp.labLogin', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/login', {
            templateUrl: 'views/login/login.html',
            controller: 'labLoginCtrl'
        });
    }
    ])
    .directive('clickOutside', ['$document',
        function($document) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {

                    var onClick = function() {
                        scope.$apply(function() {
                            scope.$eval(attrs.clickOutside);
                        });
                    };

                    $document.on('click', onClick);

                    scope.$on('$destroy', function() {
                        $document.off('click', onClick);
                    });
                }
            };
        }
    ])
    .controller('labLoginCtrl', ['$scope', '$rootScope', '$location', '$http', 'config', '$timeout',
            function ($scope, $rootScope, $location, $http, config, $timeout) {
                $scope.hasLoginError = false;
                var timeoutLogin;

                $scope.init = function(){
                    $('#password').popup({
                        on: 'focus',
                        position : 'bottom left',
                    });
                }
                
                $scope.$on('$destroy', function () {
                    $('#password').popup('destroy');
                });

                $scope.clickOutside = function(){
                    $scope.selectedUser = null;
                    console.log('text');
                };

                $scope.selectUser = function(name, $event){
                    $scope.selectedUser = name;
                    $event.stopPropagation();
                };

                $scope.isSelectedUser = function(name){
                    return $scope.selectedUser === name;
                };

                $scope.submit = function (login, password) {
                    $timeout.cancel(timeoutLogin);
                    $scope.loading = true;
                    $scope.hasLoginError = true;

                    timeoutLogin = $timeout(function () {
                        $scope.hasLoginError = false;
                        $scope.loading = false;
                    }, 3000);

                    if(login !== 'aschwartz'){
                        return;
                    }
                    if ((password || "").toLowerCase() !== (config.zombie.password || "").toLowerCase()) {
                        return;
                    }
                    $http({
                        method: 'POST',
                        url: '/labsiteloggedIn'
                    }).then(function () {
                        $scope.loading = false;
                        // todo - any processing?
                    });
                };
            }]);