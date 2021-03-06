angular.module('InstaPark').controller('GarageController', ['$http', '$scope','$q', '$mdDialog', 'parkingFactory', function($http, $scope, $q, $mdDialog, parkingFactory) {

    var garage = this;
    garage.EastObjectArray = null;
    garage.WestObjectArray = null;
    $scope.EastCarArray = []; //16-29 NE, 30-46 SE
    $scope.WestCarArray = []; //1-15 NW, 47-63 SW

    //DATA CONTROLLER STUFF
    garage.data = "";
    garage.displayNewReservationButton = false;
    garage.displayDeleteButton = false;

    //WRITE COMMENTS
    garage.getParkingData = function(section) {
        if (section === 'EAST') {
            $scope.EastCarArray = [];

            $http({
              method: 'POST',
              url: '/parkingSpot',
              data: {
                parkingArea: 'EAST',
                viewDate: parkingFactory.getDateSelected()
              }
            })
            .then(function transferData(response) {
              var neseArray = response.data.theData;

              console.log(neseArray);

              garage.EastObjectArray = neseArray;
              parkingFactory.setEastCars(garage.EastObjectArray); 
            })
            .then(function showCars() {
              var theArray = [];
              for (var i=0; i<garage.EastObjectArray.length; i++) {
                if (garage.EastObjectArray[i].parkingSpot >= 16 && garage.EastObjectArray[i].parkingSpot <= 29) {
                  if (garage.EastObjectArray[i].type === 'default') {
                    theArray.push('/images/redCarFacingDown.png');
                  } else if (garage.EastObjectArray[i].type === 'reservation') {
                    theArray.push('/images/yellowCarFacingDown.png');
                  } else if (garage.EastObjectArray[i].type === 'empty') {
                    theArray.push('/images/greenCarFacingDown.png');
                  }
                } else {
                  if (garage.EastObjectArray[i].type === 'default') {
                    theArray.push('/images/redCarFacingUp.png');
                  } else if (garage.EastObjectArray[i].type === 'reservation') {
                    theArray.push('/images/yellowCarFacingUp.png');
                  } else if (garage.EastObjectArray[i].type === 'empty') {
                    theArray.push('/images/greenCarFacingUp.png');
                  }
                }
              }

              $scope.EastCarArray = theArray;
            })
        } else if (section === 'WEST') {

            $scope.WestCarArray = [];

            $http({
              method: 'POST',
              url: '/parkingSpot',
              data: {
                parkingArea: 'WEST',
                viewDate: parkingFactory.getDateSelected()
              }
            })
            .then(function transferData(response) {
              var nwswArray = response.data.theData;

              garage.WestObjectArray = nwswArray;
              parkingFactory.setWestCars(garage.WestObjectArray);
              console.log(garage.WestObjectArray);  
            })
            .then(function showCars() {
              var theArray = [];
              for (var i=0; i<garage.WestObjectArray.length; i++) {
                if (garage.WestObjectArray[i].parkingSpot >= 1 && garage.WestObjectArray[i].parkingSpot <=15) {
                  if (garage.WestObjectArray[i].type === 'default') {
                    theArray.push('/images/redCarFacingDown.png');
                  } else if (garage.WestObjectArray[i].type === 'reservation') {
                    theArray.push('/images/yellowCarFacingDown.png');
                  } else if (garage.WestObjectArray[i].type === 'empty') {
                    theArray.push('/images/greenCarFacingDown.png');
                  }
                } else {
                  if (garage.WestObjectArray[i].type === 'default') {
                    theArray.push('/images/redCarFacingUp.png');
                  } else if (garage.WestObjectArray[i].type === 'reservation') {
                    theArray.push('/images/yellowCarFacingUp.png');
                  } else if (garage.WestObjectArray[i].type === 'empty') {
                    theArray.push('/images/greenCarFacingUp.png');
                  }
                }
              }

              $scope.WestCarArray = theArray;
              //console.log($scope.WestCarArray);
            })
        }
    }

    garage.getDefaultData = function() {
        $http({
            method: 'POST',
            url: '/getDefault'
        })
        .then(function transferData(response) {
            var array = response.data.theDefaultData
            parkingFactory.setDefaultCars(array);
        })
    }

    garage.removeAddReservations = function(viewDate) {
        var tempDate = new Date(viewDate);
        var todaysDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate(), 0, 0, 0, 0);

        $http({
            method: 'POST',
            url: '/removeAddReservations',
            data: {
                viewDate: todaysDate
            }
        }).then(function getparking(response) {
            garage.getParkingData('EAST');
            garage.getParkingData('WEST');
        })
    }

    garage.changeDate = function() {
        garage.removeAddReservations(parkingFactory.getDateSelected());
    }

    garage.showAdvanced = function(ev) {
      $mdDialog.show({
        controller: ReservationController,
        templateUrl: '/templates/reservation.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true
      })
      .then(function(result) { 
        garage.createReservation({
            parkerName: result.parkerName,
            beginParkDate: result.beginParkDate,
            endParkDate: result.endParkDate,
            reason: result.reason
        })
      });
    }

    garage.createReservation = function(data, callback) {
        var todaysDate = new Date();
        var parkingSpot = parkingFactory.getCarSelected();
        $http({
            method: 'POST',
            url: '/createReservation',
            data: {
                requestingUserId: 1,
                parkingSpotId: parkingSpot,
                requestDate: todaysDate.getFullYear() + '-' + twoDigitMonth(todaysDate.getMonth()) + '-' + twoDigitDay(todaysDate.getDate()),
                reason: data.reason,
                beginParkDate: data.beginParkDate.getFullYear() + '-' + twoDigitMonth(data.beginParkDate.getMonth()) + '-' + twoDigitDay(data.beginParkDate.getDate()),
                endParkDate: data.endParkDate.getFullYear() + '-' + twoDigitMonth(data.endParkDate.getMonth()) + '-' + twoDigitDay(data.endParkDate.getDate()),
                parkerName: data.parkerName,
                garageLoc:  parkingFactory.getGarageLoc()
            }
        }).then(function (result) {
          garage.getParkingData('EAST');
          garage.getParkingData('WEST');

          var newReservationData = result.config.data;
          var scrambledRequestDate = newReservationData.requestDate;
          var scrambledBeginParkDate = newReservationData.beginParkDate;
          var scrambledEndParkDate = newReservationData.endParkDate;

          garage.data = 'Parking Spot #' + newReservationData.parkingSpotId + '\n' + 
                   'Garage Location: ' + newReservationData.garageLoc + '\n' + 
                   'Status: Reserved' + '\n' +
                   'Request Date: ' + scrambledRequestDate.substring(5,scrambledRequestDate.length) + '-' + scrambledRequestDate.substring(0,4)  + '\n' +
                   'Begin Park Date: ' + scrambledBeginParkDate.substring(5,scrambledBeginParkDate.length) + '-' + scrambledBeginParkDate.substring(0,4)  + '\n' +
                   'End Park Date: ' + scrambledEndParkDate.substring(5,scrambledEndParkDate.length) + '-' + scrambledEndParkDate.substring(0,4)  + '\n' +
                   'Parker: ' + newReservationData.parkerName + '\n' +
                   'Reason: ' + newReservationData.reason;

          garage.displayNewReservationButton = false;
          garage.displayDeleteButton = true;
    })
  }

    function ReservationController($scope, $mdDialog) {
      $scope.parkerName = "";
      $scope.beginParkDate = parkingFactory.getDateSelected();
      $scope.endParkDate = parkingFactory.getDateSelected();
      $scope.reason = "";
      $scope.parkingSpot = parkingFactory.getCarSelected();
      $scope.invalid;

      $scope.changeDate = function() {
        $scope.endParkDate = $scope.beginParkDate;
      }

      $scope.checkValid = function(isValid) {
        if (isValid) {
          $scope.submit();
          $scope.invalid = false;
        } else {
          $scope.invalid = true;
        }
      }

      $scope.hide = function() {
        $mdDialog.hide();
      };

      $scope.cancel = function() {
        $mdDialog.cancel();
      };

      $scope.submit = function() {
        var info = {
            parkerName: $scope.parkerName,
            beginParkDate: $scope.beginParkDate,
            endParkDate: $scope.endParkDate,
            reason: $scope.reason,
            isValid: $scope.parkerName.$valid
        }
        $mdDialog.hide(info);
      };
    }

    var twoDigitMonth = function(month) {
        var theMonth = month+1; 
        if (theMonth < 10) {
            return "0" + theMonth;
        }

        return theMonth;
    };

    var twoDigitDay = function(day) {
        if (day < 10) {
            return "0" + day;
        }

        return day;
    };

    garage.deleteReservation = function() {
      //16-29 NE, 30-46 SE
      //1-15 NW, 47-63 SW
      var parkingSpot = parkingFactory.getCarSelected();
      var carObject;
      var beginParkDate;
      var endParkDate;

      if (parkingSpot>=16 && parkingSpot<=46) {
        carObject = parkingFactory.getEastCars(parkingSpot-16);
      } else if (parkingSpot>=1 && parkingSpot<=15) {
        carObject = parkingFactory.getWestCars(parkingSpot-1);
      } else {
        carObject = parkingFactory.getWestCars(parkingSpot-32);
      }

      theBeginParkDate = carObject.beginParkDateYear+''+twoDigitMonth(carObject.beginParkDateMonth-1)+''+twoDigitDay(carObject.beginParkDateDay);
      theEndParkDate = carObject.endParkDateYear+''+twoDigitMonth(carObject.endParkDateMonth-1)+''+twoDigitDay(carObject.endParkDateDay);
      console.log(theBeginParkDate + " " + theEndParkDate);

      $http({
            method: 'POST',
            url: '/cancelReservation',
            data: {
              parkingSpot: parkingSpot,
              beginParkDate: theBeginParkDate,
              endParkDate: theEndParkDate
            }
        })
        .then(function successfulDelete(response) {
            garage.changeDate();
            garage.clearText();
        }, function failed() {
            console.log('error');
        })
    }

    garage.showConfirm = function(ev) {
      var confirm = $mdDialog.confirm()
            .title('Would you like to delete this reservation?')
            //.textContent('Reservsation for spot #' + garage.currentSpot + ' for ' + formattedBeginDate + ' - ' + formattedEndDate + ' will be deleted')
            .targetEvent(ev)
            .ok('Delete Reservation')
            .clickOutsideToClose(true)
            .cancel('Cancel');
      $mdDialog.show(confirm).then(function() {
        garage.deleteReservation();
      });
    };

    garage.clearText = function() {
      garage.data = "";
      garage.displayNewReservationButton = false;
      garage.displayDeleteButton = false;
    };

    garage.showEastData = function(num) {     
      var data = parkingFactory.getEastCars(num-16);
      garage.displayData(data);
      parkingFactory.setCarSelected(num);
      parkingFactory.setGarageLoc('EAST');
    }

    garage.showWestData = function(num, area) {
      var spotNum;

      if (area === 'SW') {
        spotNum = num-32;
      } else {
        spotNum = num-1;
      }

      var data = parkingFactory.getWestCars(spotNum);
      garage.displayData(data);
      parkingFactory.setCarSelected(num);
      parkingFactory.setGarageLoc('WEST');
    }  

    garage.displayData = function(data) {
      if (data.type === 'reservation') {
        garage.data = 'Parking Spot #' + data.parkingSpot + '\n' + 
                   'Garage Location: ' + data.garageLoc + '\n' + 
                   'Status: Reserved' + '\n' +
                   'Request Date: ' + twoDigitMonth(data.requestDateMonth-1) + '-' + twoDigitDay(data.requestDateDay) + '-' + data.requestDateYear + '\n' +
                   'Begin Park Date: ' + twoDigitMonth(data.beginParkDateMonth-1) + '-' + twoDigitDay(data.beginParkDateDay) + '-' + data.beginParkDateYear + '\n' + 
                   'End Park Date: ' + twoDigitMonth(data.endParkDateMonth-1) + '-' + twoDigitDay(data.endParkDateDay) + '-' + data.endParkDateYear + '\n' +
                   'Parker: ' + data.parkerName + '\n' +
                   'Reason: ' + data.reason;

        garage.displayDeleteButton = true;
        garage.displayNewReservationButton = false;
      } else if (data.type === 'default') {
        garage.data = 'Parking Spot #' + data.parkingSpot + '\n' + 
                   'Garage Location: ' + data.garageLoc + '\n' +
                   'Status: Default' + '\n' +
                   'Parker: ' + data.parkerName;

        garage.displayDeleteButton = false;
        garage.displayNewReservationButton = true;
      } else if (data.type === 'empty') {
        garage.data = 'Parking Spot #' + data.parkingSpot + '\n' +
                   'Garage Location: ' + data.garageLoc + '\n' +
                   'Agency: ' + data.description + '\n' +
                   'Status: Empty';

        garage.displayDeleteButton = false;
        garage.displayNewReservationButton = true;
      } else {
        garage.data = 'error';
      }
    }

    garage.changeDate();
    garage.getDefaultData();
}]);

angular.module('InstaPark').directive("eastSection", function() {
    return {
        restrict: "E",
        templateUrl: "../templates/sections/east.html"
    };
});

angular.module('InstaPark').directive("westSection", function() {
    return {
        restrict: "E",
        templateUrl: "../templates/sections/west.html"
    };
});

