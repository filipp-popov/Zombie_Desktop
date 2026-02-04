angular.module('myApp')
	.directive('pipeSector', ['$rootScope', function ($rootScope) {
		'use strict';

		return {
			restrict: 'A',
			transclude: true,
			templateUrl: 'components/pipe_sector/pipe_sector.html',
			scope: {
				isGirlInside: '=',
				xCoord: '=',
				yCoord: '=',
				cellWidth: '=',
				cellHeight: '=',
				girlDotRadius: '='
			},
			link: function (scope) {
				var height = scope.cellHeight;
				var width = scope.cellWidth;
				var girlsDotRadius = scope.girlDotRadius;

                scope.switch = function() {
                    $rootScope.$broadcast("switched", [scope.xCoord, scope.yCoord]);
                }

                scope.mouseLeave = function() {
                    $rootScope.$broadcast("mouseLeave", [scope.xCoord, scope.yCoord]);
                }
                
                scope.mouseEnter = function() {
                    $rootScope.$broadcast("mouseEnter", [scope.xCoord, scope.yCoord]);
                }                

				var toUnlink = scope.$on('stateUpdated', function (event, eventObj) {
					if (eventObj.area !== 'zombie') {
						return;
					}

					var newState = eventObj.state.girl_escape_state;
					var cell = null;
					for (var i = 0; i < newState.cells.length; i++) {
						var foundCell = newState.cells[i];
						if (scope.xCoord === foundCell.coords[0] && scope.yCoord === foundCell.coords[1]) {
							cell = foundCell;
							break;
						}
					}

					if (!cell) {
						return;
					}

					scope.fanHere = cell.hasFan;
					scope.fanStopped = cell.hasFan && !cell.hasEnergy;
					scope.powered = cell.hasEnergy;
					scope.lightIntensity = cell.light;
					scope.hasLighter = cell.hasLighter;

					scope.fanUrl = scope.powered ? 'img/textures/working-fan.gif' : 'img/textures/stop-fan.png';

					var bkColor = 'gray';

					if (scope.lightIntensity > 0) {
						bkColor = '#999E41';
					}

					if (scope.lightIntensity > 2) {
						bkColor = '#BCC423';
					}

					if (scope.lightIntensity > 4) {
						bkColor = '#DEE820';
					}

					if (scope.lightIntensity > 6) {
						bkColor = '#E5F01D';
					}

					if (scope.lightIntensity > 8) {
						bkColor = '#FFF700';
					}

					scope.style = {
						position: 'absolute',
						opacity: 0.5,
						top: scope.yCoord * height,
						left: scope.xCoord * width,
						width: width,
						height: height,
						'background-color': bkColor,
                        cursor: 'pointer'
					};

					scope.lighterStyle = {
						position: 'absolute',
						opacity: 0.5,
						'border-radius': '50%',
						border: 'solid',
						top: (height / 2 - (girlsDotRadius + 10) / 2),
						left: (width / 2 - (girlsDotRadius + 10) / 2),
						width: girlsDotRadius + 10,
						height: girlsDotRadius + 10,
						'border-color': scope.powered ? 'black' : 'white'
					};
					scope.$digest();
				});
				scope.girlStyle = {
					position: 'absolute',
					'border-radius': '50%',
					top: (height / 2 - girlsDotRadius / 2),
					left: (width / 2 - girlsDotRadius / 2),
					width: girlsDotRadius,
					height: girlsDotRadius,
					'background-color': 'green'
				};
                
                scope.$on('$destroy', function() {toUnlink();});
			}
		};
	}
	]);
