var latitude = 0;
var longitude = 0;

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(createDiv, showError, { maximumAge: 60000, timeout: 5000, enableHighAccuracy: true });
    }
    else {
        x.innerHTML = "Geolocalização não é suportada.";
    }
}

function showError(error) {
    if ($("#chkGps").prop('checked')) {
        popUps('Habilite o gps para utilizar.', '#chkGps');
        $("#chkGps").prop('checked', false);
        chamarGps();
    }
}

function createDiv(position) {
    $(document.createElement('div'))
               .attr("id", 'divMap')
               .after().html('<div id="mapholder" style="height:100px; width:100%; margin:auto" />')
               .appendTo("#formEndereco");

    showPosition(position);
}

function showPosition(position) {

    latitude = position.coords.latitude;
    longitude = position.coords.longitude;

    latlon = new google.maps.LatLng(latitude, longitude)

    var myOptions = {
        center: latlon, zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        navigationControlOptions: { style: google.maps.NavigationControlStyle.SMALL }
    };
    var map = new google.maps.Map(document.getElementById("mapholder"), myOptions);
    var marker = new google.maps.Marker({ position: latlon, map: map, title: "Você está Aqui!" });

}

function chamarGps() {

    if ($("#chkGps").prop('checked')) {
        $("#divCidade").remove();
        $("#divEstado").remove();

        getLocation();

    } else {
        $(document.createElement('div'))
        .attr("id", 'divCidade')
        .after().html('<input type="text" class="text-input--underbar width-full" placeholder="Cidade" value="" id="txtCidadeCliente" required />')
        .appendTo("#formEndereco");

        $(document.createElement('div'))
        .attr("id", 'divEstado')
        .after().html('<input type="text" class="text-input--underbar width-full" placeholder="Estado" value="" id="txtEstadoCliente" required />')
        .appendTo("#formEndereco");

        if ($("#divMap") != null) {
            $("#divMap").remove();
        }
    }
}

function validate() {
    var filtroEmail = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;


    if ($.trim($('#txtNomeCliente').val()) === '') {
        popUps('Informe o nome.', '#txtNomeCliente');
    }
    else if ($.trim($('#txtSobrenomeCliente').val()) === '') {
        popUps('Informe o sobrenome.', '#txtSobrenomeCliente');
    }
    else if ($.trim($('#txtSenha').val()) === '') {
        popUps('Informe a senha.', '#txtSenha');
    }
    else if ($.trim($('#txtSenha2').val()) === '') {
        popUps('Informe a senha.', '#txtSenha2');
    }
    else if ($.trim($('#txtSenha').val()) != $.trim($('#txtSenha2').val())) {
        popUps('As senhas devem ser iguais.', '#txtSenha2');
    }
    else if ($.trim($('#txtTelefoneCliente').val()) === '') {
        popUps('Informe o telefone.', '#txtTelefoneCliente');
    }
    else if ($.trim($('#txtEmailCliente').val()) === '') {
        popUps('Informe o email.', '#txtEmailCliente');
    }
    else if (!filtroEmail.test($.trim($('#txtEmailCliente').val()))) {
        popUps('Informe um email válido.', '#txtEmailCliente');
    }
    else if ($('#chkGps').val(':checked)') == false) {
        if ($.trim($('#txtCidadeCliente').val()) === '' && latitude === 0) {
            popUps('Informe a cidade', '#txtCidadeCliente');
        }
        else if ($.trim($('#txtEstadoCliente').val()) === '' && latitude === 0) {
            popUps('Informe o estado.', '#txtEstadoCliente');
        }
    }
    else return true;
}

function popUps(msg, location) {
    ons.createPopover('popover.html')
        .then(function (popover) {
            popover.on('preshow', function (event) {
                $("#textPopOver").text(msg);
            });
            popover.on('posthide', function (event) {
                popover.destroy();
            });

            popover.show(location);

        });
}

function getToken(open) {
    var usuarioToken = JSON.parse(localStorage.getItem("iaziUser"));

    var loginData = {
        grant_type: "password",
        username: usuarioToken.idUsuario,
        password: usuarioToken.senhaUsuario
    }

    $.ajax({
        type: 'POST',
        url: localStorage['iaziUrl'] + 'token',
        contentType: 'application/x-www-form-urlencoded;charset=utf-8',
        data: loginData
    }).success(function (data) {
        localStorage.setItem('iaziToken', JSON.stringify(data));
        if (usuarioToken.roleUsuario != 'user') {
            var emp = JSON.parse(localStorage.getItem('iaziEmpresaCliente'));
            if(emp.idEmpresa == null)
                getEmpresa();
            else {
                window.open("Home.html", "_self");
            }
        }else if (open)
            window.open("Home.html", "_self");
    }).error(function () {
        // localStorage.removeItem("iaziUser");
        //testarCliente();
    });
}

function logar(usuario, senha) {
    var loginData = {
        emailCliente: usuario,
        senhaUsuario: senha
    }
    $("#divButtons").empty();

    $.ajax({
        type: 'POST',
        url: localStorage['iaziUrl'] + 'login',
        contentType: 'application/x-www-form-urlencoded;charset=utf-8',
        data: loginData
    }).success(function (data) {
        if (data.usu.idUsuario > 0) {
            localStorage.setItem("iaziUser", JSON.stringify(data.usu));
            getToken(true);
        } else {
            addLogin();
        }
    }).error(function (data) {
        addLogin();
    });
}

function cadastrarCliente() {
    if (validate()) {
        var cliente = {
            "nomeCliente": $("#txtNomeCliente").val(),
            "sobrenomeCliente": $("#txtSobrenomeCliente").val(),
            "telefoneCliente": $("#txtTelefoneCliente").val(),
            "emailCliente": $("#txtEmailCliente").val(),
            "cidadeCliente": $("#txtCidadeCliente").val(),
            "estadoCliente": $("#txtEstadoCliente").val(),
            "geoLatitudeCliente": latitude.toString(),
            "geoLongitudeCliente": longitude.toString()
        };

        var password = $("#txtSenha").val();
        $("#divBtnCadastrar").empty().css("background-color", "transparent").css("text-align", "center");
        var gif = "<img src='images/loading.gif' style='width: 20%'></img>";
        $("#divBtnCadastrar").append(gif);
        $.ajax({
            type: 'POST',
            url: iaziUrl + 'api/addclient',
            contentType: "application/json",
            data: JSON.stringify({ Cliente: cliente, Password: password })
        }).success(function (data) {
            localStorage.setItem("iaziUser", JSON.stringify(data.usu));
            getToken(true);
        }).error(function (data) {
            $("#divBtnCadastrar").empty();
            $("#divBtnCadastrar").append("<ons-button modifier='large--cta' style='padding-top: 5px; background-color: #ff5a54' id='btnCadastrar'>Finalizar Cadastro</ons-button>");
            alert("Erro ao cadastrar!");
        });
    };
}

