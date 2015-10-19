// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
(function () {
    "use strict";

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);


        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
    };

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    };

});


function testarCliente() {
    var iaziUsuario = localStorage.getItem("iaziUser");
    if (iaziUsuario != null) {
        getToken();
    } else {
        addButtons();
    }

}


function addButtons() {
   
    $(document.createElement('div'))
               .attr("id", 'divLogin')
               .after().html('<div onclick="login()" modifier="large" class="login-button"> <a onclick="login()">login</a></div>')
               .appendTo("#divButtons");

    $(document.createElement('div'))
               .attr("id", 'divCadastrar')
               .after().html('<div onclick="cadastrar()" modifier="large" class="login-button"> <a onclick="cadastrar()">cadastrar</a></div>')
               .appendTo("#divButtons");

    $(document.createElement('div'))
               .attr("id", 'divFacebook')
               .after().html('<div modifier="large" class="facebook-button"> <a id="btnFacebook">entrar com facebook</a></div>')
               .appendTo("#divButtons");

}


function login() {

}

function cadastrar() {
    window.open("Cadastro.html", "_self");
};


