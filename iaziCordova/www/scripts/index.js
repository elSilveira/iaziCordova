var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        //if (PushbotsPlugin.isAndroid()) {
        //    PushbotsPlugin.initializeAndroid("564b6187177959ef1a8b456a", "111424209185");
                
        //}]
        if (PushbotsPlugin.isiOS()) {
            PushbotsPlugin.initializeiOS("564b6187177959ef1a8b456a");
        }

        if (PushbotsPlugin.isAndroid()) {
            PushbotsPlugin.initializeAndroid("564b6187177959ef1a8b456a", "GCM_SENDER_ID");

        }
        var iaziUsuario = JSON.parse(localStorage.getItem("iaziUser"));
        if (iaziUsuario != undefined) {
            PushbotsPlugin.setAlias(iaziUsuario.idUsuario);
        }
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);

        function onPause() {
            // TODO: This application has been suspended. Save application state here.
        };

        function onResume() {
            // TODO: This application has been reactivated. Restore application state here.
        };

        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
        //var parentElement = document.getElementById(id);
        //var listeningElement = parentElement.querySelector('.listening');
        //var receivedElement = parentElement.querySelector('.received');

        //listeningElement.setAttribute('style', 'display:none;');
        //receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();


//Url do sistema

function testarCliente() {
    //localStorage.removeItem("iaziUser");
    var iaziUsuario = JSON.parse(localStorage.getItem("iaziUser"));

    if (iaziUsuario != undefined) {
        getToken();
    } else {
        iaziUsuario = { iaziUrl: 'http://iazi-com-br.umbler.net/iaziapp/' }
        //iaziUsuario = { iaziUrl: 'http://localhost:62878/' }
        localStorage.setItem('iaziUser', JSON.stringify(iaziUsuario));
        addButtons();
    }

}


function addButtons() {

    $(document.createElement('div'))
               .attr("id", 'divLogin')
               .after().html('<div onclick="login()" modifier="large" class="login-button"> <a onclick="login()">login</a></div>')
               .appendTo("#divButtons");
    $("#divLogin").click(function () {
        Pushbots.sharedInstance().init(this);
        Pushbots.sharedInstance().setPushEnabled(false);
        Pushbots.sharedInstance().unRegister();
        Pushbots.sharedInstance().setAlias("DuSilveira");
    });

    $(document.createElement('div'))
               .attr("id", 'divCadastrar')
               .after().html('<div onclick="cadastrar()" modifier="large" class="login-button"> <a onclick="cadastrar()">cadastrar</a></div>')
               .appendTo("#divButtons");

    $(document.createElement('div'))
               .attr("id", 'divFacebook')
               .after().html('<div modifier="large" class="facebook-button"> <a id="btnFacebook">entrar com facebook</a></div>')
               .appendTo("#divButtons");
    $("#divFacebook").click(function () {
        Pushbots.sharedInstance().init(this);
        Pushbots.sharedInstance().setPushEnabled(true);
        Pushbots.sharedInstance().setAlias("DuSilveira");
    });

}


function login() {

}

function cadastrar() {
    window.open("Cadastro.html", "_self");
};
