var listServicosSelecionados = '';

function getEmpresas(idCategoria) {
    $.ajax({

        type: 'POST',
        url: 'http://localhost:58203/empresas/listEmpresas',
        contentType: 'application/json',
        data: JSON.stringify({ idUsuario: usuario.idUsuario, idCategoria: idCategoria }),
        headers: {
            'Authorization': 'Bearer ' + usuario.tokenUsuario.access_token
        }
    })
        .success(function (data) {
            localStorage.setItem('iaziEmpresas', JSON.stringify(data));
            exibirEmpresas();
        })
        .error(function () {
            nextPage(0, null);
        });
}


function exibirEmpresas() {
    var emp = JSON.parse(localStorage.getItem('iaziEmpresas'));

    $("#header").append(iaziHeader());
    $.each(emp, function (i, v) {
        var item =
         "<li style=' border-bottom: #353535 solid 1px; padding-top: 5px' id='emp"+v.nomeEmpresa.replace(/ /g, '')+"'>" +
        "<table  style='margin: 5;'> <tr> " +
        "<td> <p style='text-align: left;'>" +
        "<img src='images/favoritouncheck.png' width='25'/> </p><p style='text-align: center;'>" +
        "<img style='width:25%; border-radius: 50%;' src='" + usuario.iaziUrl + "Assets/" + v.imagemEmpresa + "' /> " +
        "</p></td> </tr> <tr><td style='text-align: center; color: #808080; font-weight: bold;'> " +
                 v.nomeEmpresa + 
        "</td></tr><tr><td style='letter-spacing: 0px; font-size: 11px; text-align: center;'> " +
                v.ruaEmpresa.toUpperCase() + ", " + v.numeroEmpresa + " " + v.bairroEmpresa.toUpperCase() +
                "</br> " + v.cidadeEmpresa.toUpperCase() + " " + v.estadoEmpresa.toUpperCase() +
        "</td></tr> " +
        "<tr><td id='tipoServico' style='font-size: 16px; text-align: center; padding-bottom: 5px; font-weight: bold;'>" +
        v.tipoServico
        "</td></tr></table></li>";
        $("#listEmpresas").append(item);
        $("#emp" + v.nomeEmpresa.replace(/ /g, '')).click(function () {
            nextPage(2, v) // 2 = Servicos
        })
    })
    
}

function listarServicoEmpresa(empresa) {
    var headerWithBack = "<img src='images/back.png' height='20' style='position: absolute; top: 10; left: 5;' id='headerBack'/>" + iaziHeader();
    $("#header").append(headerWithBack);

    var pagePart = 
    "<table  style='margin-top:10px;'> <tr> " +
        "<td style=' text-align: center;'><div>" +
        "<img src='images/favoritouncheck.png' width='25' style='position: absolute; left:6;'/>" +
        "<img style='width:35%; border-radius: 50%;' src='" + usuario.iaziUrl + "Assets/" + empresa.imagemEmpresa + "'  /> " +
        "</div></td> </tr> <tr><td style='text-align: center; color: #808080; font-weight: bold;'> " +
                 empresa.nomeEmpresa +
        "</td></tr><tr><td style=' font-size: 11px; text-align: center;'> " +
                empresa.ruaEmpresa.toUpperCase() + ", " + empresa.numeroEmpresa + " " + empresa.bairroEmpresa.toUpperCase() +
                "</br> " + empresa.cidadeEmpresa.toUpperCase() + " " + empresa.estadoEmpresa.toUpperCase() +
        "</td></tr><tr><td style='font-size: 12px; text-align: center; padding:0 10% 0 10%'> " +
        empresa.infoEmpresa +
    "</td></tr></table>";
    $(".ui-content").append(pagePart);

    pagePart = "<table style='font-size: 13px; font-weight: bold; color: white; width: 100%;'><tr id='menuAgendamento' style='text-align: center;'><td class='tdServicos'>" +
        "SERVIÇOS</td><td class='tdProfissional'>" +
        "PROFISSIONAL</td><td class='tdHorario'>" +
        "HORÁRIO</td></tr></table>";
    pagePart += "<p id='infoPagina' style='margin: 0; padding: 0; word-spacing: 0; font-size: 10px; text-align: center'></p>";
    $(".ui-content").append(pagePart);
    $("#menuAgendamento td").css("background-color", "#c1c1c1").css("height", "35px").css("margin", "2px").css("width", "30%");
    $(".tdServicos").css("background-color", "white").css("color", "#ff726e");
    $(".ui-content").append("<ul style='list-style: none; margin: 0; padding: 0; width:100%;' id='agendamento-content'></ul>");
    $("#headerBack").click(function () { nextPage(1, "back") }).css("cursor", "pointer");
    
    $(".tdServicos").click(function () {
        agendamentoPage(0, empresa.idEmpresa);
    });
    $(".tdProfissional").click(function () {
        listServicosSelecionados = '';
        $("#agendamento-content li").each(function (index, value) {
            if ($("#img" + value.id.replace('select', '')).attr('src').indexOf("notselected") < 0) {
                listServicosSelecionados += JSON.stringify({idEmpresaServico : value.id.replace('select', '') });
            }
        });
        if (listServicosSelecionados != null)
            agendamentoPage(1, 0);
    });
    $(".tdHorario").click(function () {
        agendamentoPage(3, 0);
    });
    getServicos(empresa.idEmpresa);
}

function agendamentoPage(index, data) {
    $("#agendamento-content").empty();
    $("#menuAgendamento td").css("background-color", "#c1c1c1").css("color", "white");
    
    switch (index) {
        case (0):
            $(".tdServicos").css("background-color", "white").css("color", "#ff726e");
            $("#infoPagina").empty();
            $("#infoPagina").append("MARQUE OS SERVIÇOS QUE VOCE QUER SOLICITAR HORÁRIO");
            getServicos(data);
            break;
        case (1):
            $(".tdProfissional").css("background-color", "white").css("color", "#ff726e");
            $("#infoPagina").empty();
            $("#infoPagina").append("ESCOLHA O PROFISSIONAL PARA O ATENDIMENTO");

            getFuncionarios();
            break;
        case (2):
            $(".tdHorario").css("background-color", "white").css("color", "#ff726e");
            $("#infoPagina").empty();
            $("#infoPagina").append("ESCOLHA O HORÁRIO PARA O ATENDIMENTO");
            break;
    }
    
}

function getServicos(idEmpresaServico) {
    $.ajax({
        type: 'POST',
        url: usuario.iaziUrl + 'empresas/listServicos',
        contentType: 'application/json',
        data: JSON.stringify({ idEmpresaServico: idEmpresaServico }),
        headers: {
            'Authorization': 'Bearer ' + usuario.tokenUsuario.access_token
        }
    })
        .success(function (data) {
            localStorage.setItem('iaziServicoEmpresa', JSON.stringify(data));
            exibirServicoEmpresa();
        })
        .error(function () {

        });
}

function exibirServicoEmpresa() {
    var cat = JSON.parse(localStorage.getItem('iaziServicoEmpresa'));
    $.each(cat, function (i, v) {
        var item = "<li style=' border-top: solid 1px #c1c1c1;' id='select" + v.idEmpresaServico + "'>" +
            "<table style='width: 100%;'><tr><td>"+
            "<p style='margin: 5px 0 0 0; padding: 0; font-weight: bold;'>" + v.servico.nomeServico + "</p>" +
            "</td><td rowspan='2' style='vertical-align: middle; text-align: right; padding-right: 10px;' >"+
            "<img id='img" + v.idEmpresaServico + "' src='images/" +
            (listServicosSelecionados != '' ? 
                        (listServicosSelecionados.indexOf('select' + v.servico.idEmpresaServico) > 0 ?
                        'circleselected' : 'circlenotselected' )
                        : 'circlenotselected') + 
            ".png' width='25px' style='cursor:pointer;'/>" +
            "</td></tr><tr><td colspan='2'>"+
            "<p style='margin: 3px 0 5px 0; padding: 0; font-size: 11px; color: #c1c1c1;'>R$" + v.valorServico + " - " +
            v.tempoServico + "min.</p></td></tr></table></li>";
        $("#agendamento-content").append(item);
        $("#select" + v.idEmpresaServico).click(function () { //Adiciona função ao item da lista
            if ($("#img" + v.idEmpresaServico).attr('src').indexOf("notselected") > 0) {
                $("#img" + v.idEmpresaServico).attr('src', 'images/circleselected.png');
            }else {
                $("#img" + v.idEmpresaServico).attr('src', 'images/circlenotselected.png');
            }
        });
        

    });
}

function getFuncionarios() {
    $.ajax({
        type: 'POST',
        url: usuario.iaziUrl + 'empresas/listFuncionarios',
        contentType: 'application/json',
        data: JSON.stringify({ ListServicosSelecionados: listServicosSelecionados }),
        headers: {
            'Authorization': 'Bearer ' + usuario.tokenUsuario.access_token
        }
    })
        .success(function (data) {
            localStorage.setItem('iaziFuncionariosEmpresa', JSON.stringify(data));
            exibirFuncionariosEmpresa();
        })
        .error(function () {

        });
}

function exibirFuncionariosEmpresa() {
    var cat = JSON.parse(localStorage.getItem('iaziFuncionariosEmpresa'));
    $.each(cat, function (i, v) {
        var item = "<li style=' border-top: solid 1px #c1c1c1;'>" +
            "<p style='margin: 5px 0 0 0; padding: 0; font-weight: bold;'>" + v.nomeCliente + " " + v.sobrenomeCliente + "</p>"+
             "<p style='margin: 3px 0 5px 0; padding: 0; font-size: 11px; color: #c1c1c1;'>" + v.tipoServico +" </p></li>";
        $("#agendamento-content").append(item);
    });
}