var listServicosSelecionados = '';
var listFuncionariosSelecionados = '';
var actualPage;

function agendamentoPage(index, data) {
    $("#agendamento-content").empty();
    $("#menuAgendamento td").css("background-color", "#c1c1c1").css("color", "white");
    switch (index) {
        case (0):
            $(".tdServicos").css("background-color", "white").css("color", "#ff726e");
            $("#infoPagina").empty();
            $("#infoPagina").append("MARQUE OS SERVIÇOS QUE VOCE QUER SOLICITAR HORÁRIO");
            if (actualPage > 0) exibirServicoEmpresa();
            else getServicos(data);
            break;
        case (1):
            $(".tdProfissional").css("background-color", "white").css("color", "#ff726e");
            $("#infoPagina").empty();
            $("#infoPagina").append("ESCOLHA O PROFISSIONAL PARA O ATENDIMENTO");
            if (actualPage > 1) exibirFuncionariosEmpresa();
            else getFuncionarios(data);
            break;
        case (2):
            $(".tdHorario").css("background-color", "white").css("color", "#ff726e");
            $("#infoPagina").empty();
            $("#infoPagina").append("ESCOLHA O HORÁRIO PARA O ATENDIMENTO");
            exibirAgenda();
            break;
    }
    actualPage = index;

}

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
         "<li style=' border-bottom: #353535 solid 1px; padding-top: 5px' id='emp" + v.nomeEmpresa.replace(/ /g, '') + "'>" +
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
        "<img style='width:25%; border-radius: 50%;' src='" + usuario.iaziUrl + "Assets/" + empresa.imagemEmpresa + "'  /> " +
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
    $("#menuAgendamento td").css("background-color", "#c1c1c1").css("height", "30px").css("margin", "2px").css("width", "30%");
    $(".tdServicos").css("background-color", "white").css("color", "#ff726e");
    $(".ui-content").append("<ul style='list-style: none; margin: 0; padding: 0; width:100%;' id='agendamento-content'></ul>");
    $("#headerBack").click(function () { nextPage(1, "back") }).css("cursor", "pointer");

    $(".tdServicos").click(function () {
        agendamentoPage(0, empresa.idEmpresa);
    });
    $(".tdProfissional").click(function () {
        if (actualPage < 1) {
            if (listServicosSelecionados != null)
                var data = '';
            $("#agendamento-content li").each(function (index, value) {
                var litem = $("#img" + value.id.replace('select', ''));
                if (litem.attr('src').indexOf("notselected") < 0)
                    data += data == '' ?
                        value.id.replace('select', '') : ', ' + value.id.replace('select', '');
            });
            agendamentoPage(1, data);
        } else agendamentoPage(1, 0);
    });
    $(".tdHorario").click(function () {
        //if (listFuncionariosSelecionados != null)
        //    var data = '';
        //$("#agendamento-content li").each(function (index, value) {
        //    var litem = $("#img" + value.id.replace('func', ''));
        //    if (litem.attr('src').indexOf("notselected") < 0)
        //        data += data == '' ?
        //            value.id.replace('func', '') : ', ' + value.id.replace('func', '');
        //});
        agendamentoPage(2, 0);
    });
    getServicos(empresa.idEmpresa);
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
            "<table style='width: 100%;'><tr><td>" +
            "<p style='margin: 5px 0 0 0; padding: 0; font-weight: bold;'>" + v.servico.nomeServico + "</p>" +
            "</td><td rowspan='2' style='vertical-align: middle; text-align: right; padding-right: 10px;' >" +
            "<img id='img" + v.idEmpresaServico + "' src='images/" +
            (listServicosSelecionados != '' ?
                        (listServicosSelecionados.indexOf('select' + v.idEmpresaServico) > -1 ?
                        'circleselected' : 'circlenotselected')
                        : 'circlenotselected') +
            ".png' width='25px' style='cursor:pointer;'/>" +
            "</td></tr><tr><td colspan='2'>" +
            "<p style='margin: 3px 0 5px 0; padding: 0; font-size: 11px; color: #c1c1c1;'>R$" + v.valorServico + " - " +
            v.tempoServico + "min.</p></td></tr></table></li>";
        $("#agendamento-content").append(item);
        $("#select" + v.idEmpresaServico).click(function () { //Adiciona função ao item da lista
            if ($("#img" + v.idEmpresaServico).attr('src').indexOf("notselected") > -1) {
                $("#img" + v.idEmpresaServico).attr('src', 'images/circleselected.png');
            } else {
                $("#img" + v.idEmpresaServico).attr('src', 'images/circlenotselected.png');
            }
            listServicosSelecionados = '';
            $("#agendamento-content li").each(function (index, value) {
                var litem = $("#img" + value.id.replace('select', ''));
                if (litem.attr('src').indexOf("notselected") < 0)
                    listServicosSelecionados += listServicosSelecionados == '' ?
                        value.id : ',' + value.id;
            });
        });


    });
}

function getFuncionarios(data) {

    $.ajax({
        type: 'POST',
        url: usuario.iaziUrl + 'empresas/listFuncionarios',
        contentType: 'application/json',
        data: JSON.stringify({ servicos: data }),
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
        var item = "<li style=' border-top: solid 1px #c1c1c1;' id='func" + v.idEmpresaCliente + "'>" +
            "<table style='width: 100%'><tr><td>" +
            "<p style='margin: 5px 0 0 0; padding: 0; font-weight: bold;'>" + v.nomeCliente + " " + v.sobrenomeCliente + "</p>" +
        "</td><td rowspan='2' style='vertical-align: middle; text-align: right; padding-right: 10px;' >" +
            "<img id='img" + v.idEmpresaCliente + "' src='images/" +
            (listFuncionariosSelecionados != '' ?
                        (listFuncionariosSelecionados.indexOf('func' + v.idEmpresaCliente) > -1 ?
                        'circleselected' : 'circlenotselected')
                        : 'circlenotselected') +
            ".png' width='25px' style='cursor:pointer;'/>" +
        "</td></tr><tr><td>" +
        "<p style='margin: 3px 0 5px 0; padding: 0; font-size: 11px; color: #c1c1c1;'>" + v.especializacaoCliente + " </p>" +
        "</td></tr></table</li>";
        $("#agendamento-content").append(item);
        $("#func" + v.idEmpresaCliente).click(function () {
            if ($("#img" + v.idEmpresaCliente).attr('src').indexOf("notselected") > -1) {
                $("#img" + v.idEmpresaCliente).attr('src', 'images/circleselected.png');
            } else {
                $("#img" + v.idEmpresaCliente).attr('src', 'images/circlenotselected.png');
            }
            listFuncionariosSelecionados = '';
            $("#agendamento-content li").each(function (index, value) {
                var litem = $("#img" + value.id.replace('func', ''));
                if (litem.attr('src').indexOf("notselected") < 0)
                    listFuncionariosSelecionados += listFuncionariosSelecionados == '' ?
                        value.id : ',' + value.id;
            });
        });
    });
}

function exibirAgenda(data) {
    if(data == null) data = new Date();

    // $.each(cat, function (i, v) {
    var item = "<li><div style='text-align: left; width:100%; margin: 0;  '> " +
        "<table><tr>" +
        "<td style='width: 20px;' id='backMonth'><img src='images/backRed.png' style='height:16px; padding: 0; margin: 0; '/> </td>" +
        "<td style='width: 100%; text-align: center;'><a style='font-size: 14px; font-weight: bold; color: #ff726e; padding: 0;'>" + mesPorExtenso(data.getMonth()).toUpperCase() + ' - ' + data.getUTCFullYear() + "</a></div></td>"+
        "<td style='width: 20px; text-align: right;' id='nextMonth'><img src='images/forwardRed.png' style='height:16px; padding: 0; margin: 0; ' /> " +
        "</td></tr></table><div style='width:100%; padding: 0; margin:0;'>" +
            "<table class='diasAgenda' style='width: 100%; text-align: center; background-color: #c1c1c1;'><tr>" +
            "<td id='dia-2'><p class='textAgenda'>" + diaDaSemana(data.getDay(), -2) + "</p><p>" + showData(data, -2) + "</p></td>" +
            "<td id='dia-1'><p class='textAgenda'>" + diaDaSemana(data.getDay(), -1) + "</p><p>" + showData(data, -1) + "</p></td>" +
            "<td id='dia0'><p class='textAgenda'>" + diaDaSemana(data.getDay(), 0) + "</p><p>" + showData(data, 0) + "</p></td>" +
            "<td id='dia1'><p class='textAgenda'>" + diaDaSemana(data.getDay(), 1) + "</p><p>" + showData(data, 1) + "</p></td>" +
            "<td id='dia2'><p class='textAgenda'>" + diaDaSemana(data.getDay(), 2) + "</p><p>" + showData(data, 2) + "</p></td>" +
            "<td id='dia3'><p class='textAgenda'>" + diaDaSemana(data.getDay(), 3) + "</p><p>" + showData(data, 3) + "</p></td></tr></table></div>"+
            "<ul class='horarioAgenda' style='position: static; list-style: none; margin: 0; padding: 0;'></ul></li>";
    $("#agendamento-content").append(item);
    $(".diasAgenda td").css('width', '14%').css('background-color', '#c1c1c1').css('text-shadow', 'none').css('border-left', '1px solid white')
        .css('color', '#8E8E8E');
    $("#dia-2").css('border-left', 'none');
    $(".diasAgenda td p").css('font-weight', 'bold').css('font-size', '24px').css('margin', '0').css('padding', '0').css('line-height', '1.0');;
    $(".textAgenda").css('font-weight', 'normal').css('font-size', '11px').css('margin', '0').css('padding', '5px 0').css('line-height', '0.7')
    .css('color','#8E8E8E');
    $("#dia0").css('color', '#ff726e');
    $("#backMonth").click(function () {
        $("#agendamento-content").empty();
        exibirAgenda(new Date(
                (data.getFullYear()),
                (data.getMonth()),
                (data.getDate() -6)));        
    });
    $("#nextMonth").click(function () {
        $("#agendamento-content").empty();
        exibirAgenda(new Date(data.getFullYear(), data.getMonth(),
            (data.getDate() + 6)));
    });
    $(("#dia-2")).click(function () {
        $(".diasAgenda td").css('color', '#8E8E8E');
        $(this).css('color', '#ff726e');
        addHorarios(new Date(data.getFullYear(), data.getMonth(),
            (data.getDate() -2)));
    });
    $(("#dia-1")).click(function () {
        $(".diasAgenda td").css('color', '#8E8E8E');
        $(this).css('color', '#ff726e');
        addHorarios(new Date(data.getFullYear(), data.getMonth(),
            (data.getDate() - 1)));
    });
    $(("#dia0")).click(function () {
        $(".diasAgenda td").css('color', '#8E8E8E');
        $(this).css('color', '#ff726e');
        addHorarios(new Date());
    });
    $(("#dia1")).click(function () {
        $(".diasAgenda td").css('color', '#8E8E8E');
        $(this).css('color', '#ff726e');
        addHorarios(new Date(data.getFullYear(), data.getMonth(),
            (data.getDate() +1)));
    });
    $(("#dia2")).click(function () {
        $(".diasAgenda td").css('color', '#8E8E8E');
        $(this).css('color', '#ff726e');
        addHorarios(new Date(data.getFullYear(), data.getMonth(),
            (data.getDate() + 2)));
    });
    $(("#dia3")).click(function () {
        $(".diasAgenda td").css('color', '#8E8E8E');
        $(this).css('color', '#ff726e');
        addHorarios(new Date(data.getFullYear(), data.getMonth(),
            (data.getDate() +3)));
    });

    addHorarios(data);
}

function addHorarios(horario) {
    if (horario == null) {
        horario = new Date();
    }
    $(".horarioAgenda").empty();
    if (horario.getDate() >= new Date().getDate()) {
        var horas = horario.getDate() != new Date().getDate() ? 08 : new Date().getHours();
        var minutos = horario.getMinutes() > 30 ? 30 : 00;
        
        while (horas <= 22 && horas >= 8) {
            var item = "<li style='border-top: solid 1px #c1c1c1;' class='hora" + horaCompleta(horas,minutos) + "'>" +
            "<table style='width: 100%;'><tr><td>" +
            "<p id='xhora" + horaCompleta(horas, minutos) + "' style='width: 100%; color: white; margin: 5px 0px 0px 10px; padding: 0; font-weight: bold; font-size: 20px;'>" +
            (horas < 10 ? '0' + horas : horas) + ":" + (minutos == 0 ? '00' : minutos) + "</p>" +
            "</td><td rowspan='2' style='vertical-align: middle; text-align: right; padding-right: 10px;' >" +
            "<p id='cont" + horaCompleta(horas, minutos) + "' style='color: #8E8E8E; text-align: right; margin: auto; text-shadow: none; font-weight: bold;'>Solicitar</p>" +
            "</td></tr><tr></li>";

            $(".horarioAgenda").append(item);
            var liItem = ".hora" + horaCompleta(horas, minutos);
            $(liItem).css("background-color", (minutos == 30 ? "#dadada" : "#c1c1c1")).css("color", "8e8e8e");
            
            $(liItem).click(function () {
                var horario;
                var nomeServicos = "";
                var obj = "#"+event.target.id;
                if (obj.indexOf("cont") > -1) {
                    horario = obj.replace("#cont", "");
                    horario = horario.substr(0, 2) + ":" + horario.substr(2);
                }else if (obj.indexOf("xhora") > -1) {
                    horario = obj.replace("#xhora", "").substr(0, 1) + ":" + horario.substr(1);
                };
                if (horario != null) {
                    
                    var servico = JSON.parse(localStorage.getItem("iaziServicoEmpresa"));
                    var selecionados = listServicosSelecionados.split(",");
                    $.each(selecionados, function (index, valor) {
                        $.each(servico, function (index2, valor2) {
                            if (valor2.idEmpresaServico == valor.replace('select', '')) {
                                nomeServicos += nomeServicos == "" ? valor2.servico.nomeServico : ", " + alor2.servico.nomeServico;
                            }
                        });
                    });
                    
                }
                
            });
            if (minutos == 30) {
                horas++;
                minutos = 00;
            }
            else minutos = 30;
        }
    }
}