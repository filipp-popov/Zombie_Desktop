angular.module('myApp')
    .factory('zCreationService', ['config', '$q', '$rootScope', '$timeout', 'sendCommandService',
        function (config, $q, $rootScope, $timeout, sendCommandService) {
            'use strict';

            var state = {};

            state.isFirstLoad = true;
            state.strainFound = false;
            state.identityConfirmed = false;
            state.processStarted = false;
			state.strain1 = "";
			state.strain2 = "";
			state.strain3 = "";

            state.tryLoadStrain = function (strain1, strain2, strain3) {
                state.strainLoading = true;
                state.isFirstLoad = false;

                $timeout(function () {
                    var strain = strain1 + '/' + strain2 + '-' + strain3;
                    var isStrainFound = (strain || "").toLowerCase() === (config.zombie.strainValue || "").toLowerCase();

                    if (!state.strainFound && isStrainFound) {
                        sendCommandService.sendPlaySoundRequest('strain_identified', 'zombie');
                    } else {
                        sendCommandService.sendPlaySoundRequest('strain_not_identified', 'zombie');
                    }

                    state.strainFound = isStrainFound;
                    state.strainLoading = false;

                }, 5000);
            };

            state.isFirstStageComplete = function () {
                return state.strainFound && state.catalystLoaded && state.reagentLoaded;
            };

            $rootScope.$on('stateUpdated', function (evnt, eventObj) {
                if (eventObj.area === 'zombie') {
                    if (!$rootScope.game_started || !$rootScope.isLoggedIn) {
                        state.strainFound = false;
                        state.isFirstLoad = true;
                        state.identityConfirmed = false;
                        state.processStarted = false;
                        state.strain = "";
						
						state.strain1 = "";
						state.strain2 = "";
						state.strain3 = "";

                        $rootScope.$digest();
                        
                        return;
                    }

                    var catalyst_placed = eventObj.state &&!!eventObj.state.final_box_catalyst_placed;
                    if (catalyst_placed && !state.catalystLoaded) {
                        if (!eventObj.state.sterilizer_lock_on) {
                            sendCommandService.sendPlaySoundRequest('catalyst_placed', 'zombie');
                        } else {
                            sendCommandService.sendPlaySoundRequest('reagent_placed', 'zombie');
                        }
                    }
                    state.catalystLoaded = catalyst_placed;

                    var reagent_placed = eventObj.state && !!eventObj.state.final_box_reagent_placed;
                    if (reagent_placed && !state.reagentLoaded) {
                        if (!eventObj.state.girl_air_tube_lock_on) {
                            sendCommandService.sendPlaySoundRequest('reagent_placed', 'zombie');
                        } else {
                            sendCommandService.sendPlaySoundRequest('catalyst_placed', 'zombie');
                        }
                    }
                    state.reagentLoaded = reagent_placed;
                    state.identityConfirmed = state.isFirstStageComplete() && eventObj.state && !!eventObj.state.final_box_identified;

                    $rootScope.$digest();
                }
            });

            state.startProcess = function () {
                state.processStarted = true;
                var url = sendCommandService.getRequestUrl('final_box_in_progress', true, 'zombie', sendCommandService.Targets.fromLocalToControlUnit);
                sendCommandService.sendRequestByUrl(url);
            };

            state.setEnabledCardReader = function (val) {
                var url = sendCommandService.getRequestUrl('final_box_card_active', val, 'zombie', sendCommandService.Targets.fromLocalToControlUnit);
                sendCommandService.sendRequestByUrl(url);
            };

            return { state: state };
        }
    ]);
