angular.module('myApp')
    .factory('labEmailService', ['config', '$q', '$rootScope', '$timeout', '$interval', 'sendCommandService', '$http',
        function (config, $q, $rootScope, $timeout, $interval, sendCommandService, $http) {
            'use strict';
            var todayDayStr = '2023-05-22';
            var getToday = function () { return moment(todayDayStr, 'YYYY-MM-DD'); };
            var getNowMomentDate = function () { return moment(todayDayStr + ' ' + moment().format('h:mm A'), 'YYYY-MM-DD h:mm A'); };

            var algorythms = [];
            var currentDoorAlgorythmNumber;

            var maxEmailsBeforeWarning = 5;
            var emailsSentFromStart = 0;
            var isHintTooManyEmailsPlaying = false;

            var state = { emails: [], today: getToday(), sentEmails: [] };
            var isInited = false;
            var onStateUpdatedReset;

            $rootScope.$watch('game_started', function (newVal, oldVal) {
                if (!newVal) {
                    isInited = false;
                    currentDoorAlgorythmNumber = null;
                    if (onStateUpdatedReset) {
                        onStateUpdatedReset()
                    }
                }

                if (newVal && !isInited) {
                    init();
                }
            });

            return {
                state: state,
                emailSent: emailSent
            };

            function init() {
                isInited = true;
                state.emails.length = 0;
                state.sentEmails.length = 0;
                var isInitial = true;
                onStateUpdatedReset = $rootScope.$on('stateUpdated', function (evnt, eventObj) {
                    if (eventObj.area === 'zombie' && eventObj.state) {
                        onStateUpdated();
                    }

                    function onStateUpdated() {
                        handleDoorAlgorythmChanged(eventObj.state.prison_lock_active_algo_number, isInitial);
                        isInitial = false;
                        $rootScope.$digest();
                        checkIfPlayTooManyEmailWarning(eventObj.state);
                    }
                });


                algorythms = [
                    {
                        id: 1,
                        left: ['r-90', 'l-180', 'r-270', 'l-90', 'r-360'],
                        right: ['l-180', 'r-180', 'l-90', 'r-180', 'l-90']
                    },
                    {
                        id: 2,
                        left: ['r-180', 'l-90', 'r-270', 'l-90', 'r-360'],
                        right: ['l-90', 'r-90', 'l-180', 'r-180', 'l-270']
                    },
                    {
                        id: 3,
                        left: ['r-360', 'l-180', 'r-90', 'l-90', 'l-180'],
                        right: ['l-360', 'r-180', 'r-90', 'l-180', 'l-90']
                    },
                    {
                        id: 4,
                        left: ['l-270', 'r-180', 'l-360', 'r-180', 'r-270'],
                        right: ['l-180', 'r-90', 'r-180', 'r-90', 'l-180']
                    },
                    {
                        id: 5,
                        left: ['l-180', 'r-90', 'r-180', 'r-90', 'l-180'],
                        right: ['l-270', 'r-180', 'l-360', 'r-180', 'r-270']
                    }
                ];
                var initialEmail = $rootScope.localization.emails.initialEmail;
                state.emails.push({
                    title: initialEmail.title,
                    from: initialEmail.from,
                    to: initialEmail.to,
                    timestampMoment: getToday().subtract(2, 'days').add(12, 'hours').add(23, 'minutes'),
                    body: initialEmail.bodyStrings.join(''),
                    unread: false
                });

                var initialSentEmail = $rootScope.localization.emails.initialSentEmail;
                state.sentEmails.push({
                    title: initialSentEmail.title,
                    from: initialSentEmail.from,
                    to: initialSentEmail.to,
                    timestampMoment: getToday().subtract(2, 'days').add(7, 'hours').add(15, 'minutes'),
                    body: initialSentEmail.bodyStrings.join(''),
                    unread: false,
                    predefined: true
                });
            }

            function getAlgoChangedEmailBody(message, algoToBeAdded) {
                var replacements = [];

                algoToBeAdded.left.forEach(function (item, index) {
                    replacements.push({ src: 'l' + index, dest: item });
                });

                algoToBeAdded.right.forEach(function (item, index) {
                    replacements.push({ src: 'r' + index, dest: item });
                });

                return replacePlaceholders(message, replacements);

                function replacePlaceholders(template, replacements) {
                    var result = template;

                    replacements.forEach(function (replacement) {
                        var re = new RegExp('{' + replacement.src + '}', 'g');

                        result = result.replace(re, replacement.dest);
                    });
                    return result;
                }
            }

            function sendEmailAboutAlgorythm(newAlgoNumber, sendDate) {
                var emailTemplate = $rootScope.localization.emails.algorythmChanged;

                for (var i = 0; i < algorythms.length; i++) {
                    var algoToBeAdded = algorythms[i];
                    if (algoToBeAdded.id === newAlgoNumber) {
                        var email = {
                            title: emailTemplate.title,
                            from: emailTemplate.from,
                            to: emailTemplate.to,
                            timestampMoment: sendDate,
                            body: getAlgoChangedEmailBody(emailTemplate.bodyStrings.join(''), algoToBeAdded),
                            unread: true
                        };

                        state.emails.unshift(email);
                    }
                }

            }

            function handleDoorAlgorythmChanged(newAlgoNumber, isInitial) {
                if (newAlgoNumber !== currentDoorAlgorythmNumber) {
                    sendEmailAboutAlgorythm(parseInt(newAlgoNumber), isInitial ? getToday().add(1, 'minute') : getNowMomentDate());
                    currentDoorAlgorythmNumber = newAlgoNumber;

//                    if (state.emails.length > 2) {
//                        sendCommandService.sendRequestByParams('hint_new_email', true, 'zombie');
//                    }
                }
            }

            function emailSent(email) {
                state.sentEmails.unshift({
                    title: email.title,
                    from: '',
                    to: email.to,
                    timestampMoment: getNowMomentDate(),
                    body: email.text,
                    unread: false
                });

                if (!isHintTooManyEmailsPlaying) {
                    emailsSentFromStart = emailsSentFromStart + 1;
                    $http.get('/reloadState');
                }
            }

            function checkIfPlayTooManyEmailWarning(state) {
                if (state.game_status !== 'game_started') {
                    emailsSentFromStart = 0;
                }

                if (emailsSentFromStart >= maxEmailsBeforeWarning) {
                    sendCommandService.sendRequestByParams('hint_stop_emailing', true, 'zombie');
                    emailsSentFromStart = 0;
                    isHintTooManyEmailsPlaying = true;

                    $timeout(function () { isHintTooManyEmailsPlaying = false; }, 10000);
                }
            }
        }
    ]);
