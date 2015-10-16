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

    else if ($('#chkGps').val(':checked)') == false || latitude === 0) {
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

function getToken(password, userName) {
    $.ajax({
        type: 'POST',
        url: 'http://localhost:58203/token',
        contentType: "application/json",
        data: JSON.stringify({grant_type: "password", password: password, username: userName })
    }).success(function (data) {
        var iaziUser = localStorage.getItem("iaziUser");
        iaziUser["tokenUsuario"] = data;
        localStorage.setItem("iaziUser", iaziUser);
    })
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


        $.ajax({
            type: 'POST',
            url: 'http://localhost:58203/api/addclient',
            contentType: "application/json",
            data: JSON.stringify({ Cliente: cliente, Password: password })
        }).success(function (data) {
            var iaziUser = {
                "idUsuario": data.idUsuario,
                "roleUsuario": data.roleUsuario,
                "tokenUsuario": 0
            }
            localStorage.setItem("iaziUser", iaziUser);
            getToken(password, cliente.emailCliente);
        }).error(function () {
            alert("Erro ao cadastrar");
        })
    }
}