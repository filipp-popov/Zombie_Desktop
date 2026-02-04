angular.module('myApp').filter('localized', [
    '$rootScope', function($rootScope) {
        'use strict';
        
        return function(key, params) {
            
            if (!$rootScope.localization) {
                return '[NOT LOCALIZED]';
            }
            var localizedString = ($rootScope.localization.strings || {})[key] || '';
            if (!!params) {
               localizedString =  applyTemplate(localizedString, params);
            }
            return localizedString;
        };
        
        
        function applyTemplate(str, params) {
            if (!Array.isArray(params)) {
                params = [params];
            }
            
            params.forEach(function(param, ind) {
                var re = new RegExp('\\{' + ind + '\\}', 'g');
                str = str.replace(re, param);
            });
            
            return str;
        }
    }
]);