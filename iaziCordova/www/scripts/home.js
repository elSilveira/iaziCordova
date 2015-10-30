
function getUserInfo() {
    usuario = JSON.parse(localStorage.getItem('iaziUser'));
}

function callPage(page) {

    var options = {
        animation: 'slide', // What animation to use
        onTransitionEnd: function () { } // Called when finishing transition animation
    };
    myNavigator.pushPage(page, options);
}


function Page1Controller($scope, Data) { 
    $scope.items = JSON.parse(localStorage.getItem('iaziCategorias')); 

    $scope.showDetail = function (index) { // 3
        var selectedItem = Data.items[index];
        Data.selectedItem = selectedItem;
        $scope.ons.navigator.pushPage('index.html', selectedItem.title);
    }
}

