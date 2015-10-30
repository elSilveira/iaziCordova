
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
        "SERVIÇOS</td><td class='tdHorario'>" +
        "HORÁRIO</td><td class='tdProfissional'>" +
        "PROFISSIONAL</td></tr></table>";
    pagePart += "<p style='margin: 0; padding: 0; word-spacing: 0; font-size: 10px; text-align: center'>MARQUE OS SERVIÇOS QUE VOCE QUER SOLICITAR HORÁRIO</p>";
    $(".ui-content").append(pagePart);
    $("#menuAgendamento td").css("background-color", "#c1c1c1").css("height", "35px").css("margin", "2px").css("width", "30%");
    $(".tdServicos").css("background-color", "white").css("color", "#ff726e");
    $(".ui-content").append("<ul style='list-style: none; margin: 0; padding: 0; width:100%;' id='agendamento-content'></ul>");
    $("#headerBack").click(function () { nextPage(1, "back") }).css("cursor", "pointer");

    getServicos(empresa.idEmpresa);
}

function getServicos(idEmpresa) {
    $.ajax({
        type: 'POST',
        url: usuario.iaziUrl + 'empresas/listServicos',
        contentType: 'application/json',
        data: JSON.stringify({ idEmpresa: idEmpresa }),
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
        var item ="<li>"+v.servico.nomeServico+"</li>";
        $("#agendamento-content").append(item);
        //Adiciona função ao item da lista

    });
}