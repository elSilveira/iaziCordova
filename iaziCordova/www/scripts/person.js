var listServicosEmpresa = null;
var listOriginal = null;
var alteracao = true;
function exibirConfiguracoes(data) {
    var emp = JSON.parse(localStorage.getItem('iaziUser'));

    var item =
       "<li id='liPerson' style='padding-top: 45%; text-align: center;'>" +
       "<table  style='margin-top: 10px; width: 100%;'> <tr>" +
       "<td style='text-align: center; color: #808080; font-weight: bold;'> " +
                emp.cliente.nomeCliente.toUpperCase() + " " + emp.cliente.sobrenomeCliente.toUpperCase() +
       "</td></tr><tr><td style='letter-spacing: 0px; font-size: 11px; text-align: center;'> " +
               emp.cliente.emailCliente + " - " + emp.cliente.telefoneCliente +
       "</td></tr> " +
       "<tr><td id='tdPerson' style='padding-top: 15px;'>" +
       "<div id='btnCadEmpresa' style='text-align:center; color: #dd5758;'><a>" + (usuario.roleUsuario == 'manager' ? 'Configurar Empresa' : 'Cadastrar Empresa') + "</a></div></br>" +
       "<div id='btnAlterarSenha' style='text-align:center; color: #dd5758;'><a>Alterar Senha</a></div></br>" +
       "<div id='btnContato' style='text-align:center; color: #dd5758;'><a>Contato</a></div></br>" +
       "<div id='btnLogout' style='text-align:center; color: #dd5758;'><a>Logout</a></div></td></tr>" +
       "</table></li>";
    $(".listPerson").append(item);
    $("#btnLogout").click(function () {
        localStorage.removeItem("iaziUser");
        window.open("index.html", "_self");
    });
    $("#btnCadEmpresa").click(function () {
        $("#liPerson").css("padding-top", "12px");
        if (usuario.roleUsuario == 'user') {
            $("#tdPerson").empty();
            var item = "<div id='divDadosEmpresa' style='text-align: center; width: 100%; padding-bottom: 20px;'> " +
                       "<input class='inputCad' type='text' placeholder='Nome Empresa' value='' id='txtNomeEmpresa' /> " +
                       "<input class='inputCad' type='text' placeholder='Rua' value='' id='txtRuaEmpresa' /> " +
                       "<input class='inputCad' type='tel' placeholder='Numero' value='' id='txtNumeroEmpresa' /> " +
                       "<input class='inputCad' type='text' placeholder='Bairro' value='' id='txtBairroEmpresa' /> " +
                       "<input class='inputCad' type='tel' placeholder='Cep' value='' id='txtCepEmpresa' /> " +
                       "<input class='inputCad' type='text' placeholder='Cidade' value='' id='txtCidadeEmpresa' /> " +
                       "<input class='inputCad' type='text' placeholder='Estado' value='' id='txtEstadoEmpresa' /> " +
                   "</div>" +
                   "<div id='btnCadastrarEmpresa' modifier='large' class='login-button'> <a style='color: white; text-shadow: none;'>Enviar Cadastro</a></div>";
            $("#tdPerson").append(item);
            $("#divDadosEmpresa").css("background-color", "tansparent").css("input text-align", "center");
            $("#btnCadastrarEmpresa").click(function () {
                cadastrarEmpresa();
            });
        } else {
            configurarEmpresa();
        }
    });

}

function cadastrarEmpresa() {
    if (true) {
        var empresa = {
            "nomeEmpresa": $("#txtNomeEmpresa").val(),
            "cidadeEmpresa": $("#txtCidadeEmpresa").val(),
            "estadoEmpresa": $("#txtEstadoEmpresa").val(),
            "ruaEmpresa": $("#txtRuaEmpresa").val(),
            "bairroEmpresa": $("#txtBairroEmpresa").val(),
            "cepEmpresa": $("#txtCepEmpresa").val(),
            "geoLatitudeEmpresa": null,
            "geoLongitudeEmpresa": null,
            "numeroEmpresa": $("#txtNumeroEmpresa").val(),
            "imagemEmpresa": "default.jpg",
            "infoEmpresa": null,
            "tipoServico": ""
        };

        $("#btnCadastrarEmpresa").empty().css("background-color", "transparent").css("text-align", "center");
        var gif = "<img src='images/loading.gif' style='width: 20%'></img>";
        $("#btnCadastrarEmpresa").append(gif);
        $.ajax({
            type: 'POST',
            url: localStorage["iaziUrl"] + 'api/addempresa',
            contentType: "application/json",
            data: JSON.stringify({ Empresa: empresa, Cliente: usuario.cliente.idCliente }),
            headers: {
                'Authorization': 'Bearer ' + token.access_token
            }
        }).success(function (data) {
            $("#btnCadastrarEmpresa").empty();
            $("#btnCadastrarEmpresa").append("<a style='color: black; text-shadow: none;'>Enviado!</br>Aguarde ativação, entraremos em contato.</a>");
            var user = JSON.parse(localStorage.getItem("iaziUser"));
            user.userRole = 'manager';
            localStorage.setItem('iaziUser', JSON.stringify(user));

        }).error(function (data) {
            $("#btnCadastrarEmpresa").empty();
            $("#btnCadastrarEmpresa").append("<a style='color: red; text-shadow: none;'>Tentar novamente</a>");
        });
    }
}

function configurarEmpresa() {
    var empresa = JSON.parse(localStorage.getItem('iaziEmpresaCliente'));
    var pagePart =
   "<table  style='margin-top:5px; background-color: white; width: 100%; text-align: center;'> <tr> " +
       "<td style=' text-align: center;'><div>" +
       "<img style='width:25%; border-radius: 50%;' src='" + localStorage['iaziUrl'] + "Assets/padrao.jpg' /> " +
       "</div></td></tr> " +
       "<tr><td style='text-align: center; color: #808080; font-weight: bold;'> " +
                empresa[0].nomeEmpresa +
       "</td></tr>" +
       "<tr><td style=' font-size: 11px; text-align: center;'> " +
               empresa[0].ruaEmpresa.toUpperCase() + ", " + empresa[0].numeroEmpresa + " " + empresa[0].bairroEmpresa.toUpperCase() +
               "</br> " + empresa[0].cidadeEmpresa.toUpperCase() + " " + empresa[0].estadoEmpresa.toUpperCase() +
       "</td></tr></table>";
    $("#tdPerson").empty();
    $("#tdPerson").append(pagePart);
    pagePart = "<table style='font-size: 13px; font-weight: bold; color: white; width: 100%;'>" +
        "<tr id='menuConfiguracoesEmpresa' style='text-align: center;'>" +
        "<td class='tdServicosMenu'>" +
        "SERVIÇOS</td><td class='tdProfissionaisMenu'>" +
        "PROFISSIONAIS</td></tr></table>";
    $("#tdPerson").append(pagePart);
    $("#menuConfiguracoesEmpresa td").css("background-color", "#c1c1c1").css("height", "30px").css("margin", "2px").css("width", "30%");
    $(".tdServicosMenu").css("background-color", "white").css("color", "#ff726e").click(
        function () {
            $("#configuracoes-content").empty();
            getServicosEmpresa(empresa[0].idEmpresa);
        });
    $("#tdPerson").append("<ul style='background-color: white; list-style: none; margin: 0; padding: 0; width:100%;' id='configuracoes-content'></ul>");
    getServicosEmpresa(empresa[0].idEmpresa);
}

function getServicosEmpresa(idEmpresa) {
    $.ajax({
        type: 'POST',
        url: localStorage['iaziUrl'] + 'empresas/listTodosServicos',
        contentType: 'application/json',
        data: JSON.stringify({ idEmpresaServico: idEmpresa }),
        headers: {
            'Authorization': 'Bearer ' + token.access_token
        }
    })
        .success(function (data) {
            localStorage.setItem('iaziServicos', JSON.stringify(data.servicos));
            localStorage.setItem('iaziServicoEmpresa', JSON.stringify(data.servicosEmpresa));
            exibirServicosEmpresaCliente();
        })
        .error(function () {

        });
}

function exibirServicosEmpresaCliente() {
    var servicos = JSON.parse(localStorage.getItem('iaziServicos'));
    $.each(servicos, function (i, v) {
        var item = "<li style=' border-top: solid 1px #c1c1c1;'>" +
            "<table style='width: 100%;'><tr><td style='width: 60%'>" +
            "<p id='pNomeServ" + v.idServico + "' style='margin: 5px 0 0 5px; padding: 0; font-weight: bold;'>" + v.nomeServico + "</p>" +
            "<p id='pValorServico" + v.idServico + "' style='margin: 3px 0 5px 5px; padding: 0; font-size: 11px; color: #c1c1c1;'>" + v.categoria.nomeCategoria.toUpperCase() + "</p>" +
            "</td><td style='right: 0'>" +
            "<input class='inputTypeList' type='tel' placeholder='Valor(25,00)' id='valor" + v.idServico + "' />" +
            "<input class='inputTypeList'  type='tel' placeholder='Tempo(90min)' id='tempo" + v.idServico + "' />" +
            "</td>" +
            "<td id='select" + v.idServico + "' style='vertical-align: middle; text-align: right; padding-right: 10px;' >" +
            "<img id='img" + v.idServico + "' src='images/circlenotselected.png' width='35px' style='cursor:pointer;'/>" +
            "</td></tr></table></li>";
        $("#configuracoes-content").append(item);
        $("#tdPerson").append("<img id='btnSalvarConfiguracoes'  style='position: fixed; right: 5px; top: 45px; width:35px;'/>");
        $("#select" + v.idServico).click(function () { //Adiciona função ao item da lista
            if ($("#img" + v.idServico).attr("src").indexOf('notselected') > 0) {
                $("#img" + v.idServico).attr("src", "images/circleselected.png");
                $("#pNomeServ" + v.idServico).css('color', '#f4433f');
                verificarItem(v.idServico, true);
            }
            else {
                $("#img" + v.idServico).attr("src", "images/circlenotselected.png");
                $("#pNomeServ" + v.idServico).css('color', 'black');
                verificarItem(v.idServico, false);
            }
            $("#btnSalvarConfiguracoes").attr("src", "images/notchecked.png");
        });
        $("#btnSalvarConfiguracoes").click(function () {
            $("#btnSalvarConfiguracoes").attr("src", "images/checked.png");
        });
    });
    var servEmpresa = JSON.parse(localStorage.getItem('iaziServicoEmpresa'));
    $.each(servEmpresa, function (i, x) {
        $("#img" + x.servico.idServico).attr("src", "images/circleselected.png");
        $("#pNomeServ" + x.servico.idServico).css('color', '#f4433f');
        $("pValorServico" + x.servico.idServico).empty().append("R$" + x.servico.valorServico + " - " + x.servico.tempoServico + "min.");
        listServicosEmpresa = listServicosEmpresa == null ?
            x.servico.idServico : "," + x.servico.idServico;
    });
}

function verificarItem(id, keep) {
    if (keep) {
        listServicosEmpresa += listServicosEmpresa == null ? id : ',' + id;
    }else{
        var lista = new Array();
        lista = listServicosEmpresa.split(",");
        $.each(lista, function (x, y) {
            if (y == id) lista.splice(x,1);
        });
    }
}