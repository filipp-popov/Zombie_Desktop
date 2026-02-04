'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'myApp.zCreation',
    'myApp.email',
    'myApp.labLogin',
    'myApp.emptyPage',
    'myApp.labCameras',
    'myApp.compose_email',
    'myApp.sent_emails',
    'myApp.girlEscape',
    'myApp.plans'
]).
    config(['$routeProvider', '$sceProvider', function ($routeProvider, $sceProvider) {
        $routeProvider.otherwise({
            redirectTo: '/main'
        });
        $sceProvider.enabled(false);
    }
    ])

    .run(['$rootScope', '$location', 'localizations', '$route', '$http', function ($rootScope, $location, localizations, $route, $http) {

        var relogin = function () {
            if ($location.path() !== '/login' && $location.path() !== '/girl_escape_observer' && $location.path() !== '/empty' && (!$rootScope.isLoggedIn || !$rootScope.game_started)) {
                localStorage.setItem("emailview", false);
                localStorage.setItem("camerasview", false);

                $location.search('redir', $location.path() === '/girl_escape' ? '/plans' : $location.path());
                $location.path('/login');
            }
        };

        var isUpdateInProgress = false;
        $rootScope.$watchGroup(['isLoggedIn', 'game_started'], function (newValues) {
            if ($location.path() === '/girl_escape_observer') {
                return;
            }
            if (newValues[0] && newValues[1] && !isUpdateInProgress) {
                isUpdateInProgress = true;
                $location.path($location.search().redir || '/main');
                $location.search('redir', null);
            }
        });


        $rootScope.$on('$routeChangeStart', relogin);

        $rootScope.$on('$routeChangeSuccess', function ($event, current, prev) {
            isUpdateInProgress = false;
            var emailview = localStorage.getItem("emailview") === 'true';
            var camerasview = localStorage.getItem("camerasview") === 'true';
            if(current.$$route.originalPath === '/email' || current.$$route.originalPath === '/main'){
                if(!emailview) {
                    emailview = true;
                } else if(!camerasview){
                    $location.path('/cameras');
                    console.log("No cameras found");
                }
            }
            if(current.$$route.originalPath === '/plans' || current.$$route.originalPath === '/cameras'){
                if(!camerasview) {
                    camerasview = true;
                } else if(!emailview){
                    $location.path('/main');
                    console.log("No email found");
                }
            }
            localStorage.setItem("emailview", emailview);
            localStorage.setItem("camerasview", camerasview);

            $http.post('/log', {
                event: "routeChanged",
                routeInfo: {
                    current: JSON.stringify({
                        params: JSON.stringify(current.params),
                        pathParams: JSON.stringify(current.pathParams),
                        loadedTemplateUrl: current.loadedTemplateUrl
                    }),
                    previous: JSON.stringify({
                        params: JSON.stringify((prev || {}).params),
                        pathParams: JSON.stringify((prev || {}).pathParams),
                        loadedTemplateUrl: (prev || {}).loadedTemplateUrl
                    })
                }
            });
        });

        $rootScope.game_started = false;
        $rootScope.isLoggedIn = false;
        $rootScope.girlEscapeStarted = false;

        $rootScope.$on('stateUpdated', function (evnt, eventObj) {
            if (eventObj.area === 'zombie' && eventObj.state) {
                if (eventObj.state.game_language !== ($rootScope.localization || {}).language) {
                    $rootScope.localization = localizations[eventObj.state.game_language];
                    $route.reload();
                }

                $rootScope.$applyAsync(function () {
                    $rootScope.game_started = eventObj.state.game_status === 'game_started';
                    $rootScope.isLoggedIn = $rootScope.game_started && eventObj.state.labState.loggedIn;

                    if (!$rootScope.game_started) {
                        $rootScope.girlEscapeStarted = false;
                        relogin();
                    }
                });

            }
        });
    }]);
