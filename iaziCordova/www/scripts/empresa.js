var listServicosSelecionados = '';
var listFuncionariosSelecionados = '';
var actualPage;
var horarioAgendado;
var usuario = JSON.parse(localStorage.getItem('iaziUser'));
var token = JSON.parse(localStorage.getItem('iaziToken'));

function agendamentoPage(index, data) {
    $("#agendamento-content").empty();
    $("#menuAgendamento td").css("background-color", "#c1c1c1").css("color", "white");
    switch (index) {
        case (0):
            $(".tdServicos").css("background-color", "white").css("color", "#ff726e");
            $("#infoPagina").empty();
            $("#infoPagina").append("MARQUE OS SERVIÇOS QUE VOCE QUER SOLICITAR HORÁRIO");
            if (data == null) exibirServicoEmpresa();
            else getServicos(data);
            break;
        case (1):
            $(".tdProfissional").css("background-color", "white").css("color", "#ff726e");
            $("#infoPagina").empty();
            $("#infoPagina").append("ESCOLHA O PROFISSIONAL PARA O ATENDIMENTO");
            if (data == null) exibirFuncionariosEmpresa();
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

function getEmpresa() {
    if (usuario == null) usuario = JSON.parse(localStorage.getItem("iaziUser"));
    if (token == null) token = JSON.parse(localStorage.getItem("iaziToken"));
    $.ajax({

        type: 'POST',
        url: localStorage['iaziUrl'] + 'empresas/listEmpresa',
        contentType: 'application/json',
        data: JSON.stringify({ Cliente: usuario.cliente.idCliente }),
        headers: {
            'Authorization': 'Bearer ' + token.access_token
        }
    })
        .success(function (data) {
            localStorage.setItem('iaziEmpresaCliente', JSON.stringify(data));
            window.open("Home.html", "_self");
        })
        .error(function () {
            window.open("Home.html", "_self");
        });
}

function getEmpresas(idCategoria) {
    $.ajax({

        type: 'POST',
        url: localStorage['iaziUrl'] + 'empresas/listEmpresas',
        contentType: 'application/json',
        data: JSON.stringify({ idUsuario: usuario.idUsuario, idCategoria: idCategoria }),
        headers: {
            'Authorization': 'Bearer ' + token.access_token
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
        "<img style='width:25%; border-radius: 50%;' src='" + localStorage['iaziUrl'] + "Assets/" + v.imagemEmpresa + "' /> " +
        "</p></td> </tr> <tr><td style='text-align: center; color: #808080; font-weight: bold;'> " +
                 v.nomeEmpresa +
        "</td></tr><tr><td style='letter-spacing: 0px; font-size: 11px; text-align: center;'> " +
                v.ruaEmpresa.toUpperCase() + ", " + v.numeroEmpresa + " " + v.bairroEmpresa.toUpperCase() +
                "</br> " + v.cidadeEmpresa.toUpperCase() + " " + v.estadoEmpresa.toUpperCase() +
        "</td></tr> " +
        "<tr><td id='tipoServico' style='font-size: 16px; text-align: center; padding-bottom: 5px; font-weight: bold;'>" +
        v.tipoServico
        "</td></tr></table></li>";
        $(".listEmpresas").append(item);
        $("#emp" + v.nomeEmpresa.replace(/ /g, '')).click(function () {
            nextPage(2, v) // 2 = Servicos
        })
    })

}

function listarServicoEmpresa(empresa) {
    var headerWithBack = "<img src='images/back.png' height='20' style='position: absolute; top: 10; left: 5;' id='headerBack'/>" + iaziHeader();
    $("#header").append(headerWithBack);

    var pagePart =
    "<table  style='margin-top:10px; background-color: white;'> <tr> " +
        "<td style=' text-align: center;'><div>" +
        "<img src='images/favoritouncheck.png' width='25' style='position: absolute; left:6;'/>" +
        "<img style='width:25%; border-radius: 50%;' src='" + localStorage['iaziUrl'] + "Assets/" + empresa.imagemEmpresa + "'  /> " +
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
    $(".ui-content").append("<ul style='background-color: white; list-style: none; margin: 0; padding: 0; width:100%;' id='agendamento-content'></ul>");
    $("#headerBack").click(function () { nextPage(1, "back") }).css("cursor", "pointer");
    
    $(".tdServicos").click(function () {
        if (actualPage > 0) {
            listFuncionariosSelecionados = '';
            agendamentoPage(0, null);
        }
    });
    $(".tdProfissional").click(function () {
        if (actualPage == 2) {
            agendamentoPage(1, null);
        }
    });
    actualPage = 0;
    getServicos(empresa.idEmpresa);
}

function getServicos(idEmpresaServico) {
    $.ajax({
        type: 'POST',
        url: localStorage['iaziUrl'] + 'empresas/listServicos',
        contentType: 'application/json',
        data: JSON.stringify({ idEmpresaServico: idEmpresaServico }),
        headers: {
            'Authorization': 'Bearer ' + token.access_token
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
            "<p style='margin: 5px 0 0 5px; padding: 0; font-weight: bold;'>" + v.servico.nomeServico + "</p>" +
            "</td><td rowspan='2' style='vertical-align: middle; text-align: right; padding-right: 10px;' >" +
            "<img id='img" + v.idEmpresaServico + "' src='images/circleforward.png' width='35px' style='cursor:pointer;'/>" +
            "</td></tr><tr><td colspan='2'>" +
            "<p style='margin: 3px 0 5px 5px; padding: 0; font-size: 11px; color: #c1c1c1;'>R$" + v.valorServico + " - " +
            v.tempoServico + "min.</p></td></tr></table></li>";
        $("#agendamento-content").append(item);
        $("#select" + v.idEmpresaServico).click(function () { //Adiciona função ao item da lista
            listServicosSelecionados = v.idEmpresaServico;
            agendamentoPage(1, listServicosSelecionados);
        });


    });
}

function getFuncionarios(data) {

    $.ajax({
        type: 'POST',
        url: localStorage['iaziUrl'] + 'empresas/listFuncionarios',
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
            "<img id='img" + v.idEmpresaCliente + "' src='images/circleforward.png' width='35px' style='cursor:pointer;'/>" +
        "</td></tr><tr><td>" +
        "<p style='margin: 3px 0 5px 0; padding: 0; font-size: 11px; color: #c1c1c1;'>" + v.especializacaoCliente + " </p>" +
        "</td></tr></table</li>";
        $("#agendamento-content").append(item);
        $("#func" + v.idEmpresaCliente).click(function () {
            listFuncionariosSelecionados = v.idEmpresaCliente;
            agendamentoPage(2, listFuncionariosSelecionados);
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
            "<ul class='horarioAgenda' style='background-color: white; position: static; list-style: none; margin: 0; padding: 0;'></ul></li>";
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

function addHorarios(dataAgenda) {
    horarioAgendado = dataAgenda;
    var dataSend = {
        idEmpresaCliente: listFuncionariosSelecionados,
        ano: dataAgenda.getFullYear(),
        mes: dataAgenda.getMonth(),
        dia: dataAgenda.getDate()
    }
    $.ajax({
        type: 'POST',
        url: localStorage['iaziUrl'] + 'agenda/listAgenda',
        contentType: 'application/json',
        data: JSON.stringify({ Funcionario: dataSend }),
        headers: {
            'Authorization': 'Bearer ' + usuario.tokenUsuario.access_token
        }
    })
        .success(function (data) {
            localStorage.setItem('iaziAgendaFuncionario', JSON.stringify(data));
            mostrarHorarios(dataAgenda, data);
        })
        .error(function () {

        });
}


function mostrarHorarios(horario, agenda) {
    if (horario == null) {
        horario = new Date();
    }
    
    $(".horarioAgenda").empty();
    if (horario.getDate() >= new Date().getDate()) {
        if (horario.getDate() == new Date().getDate() && horario.getHours() == new Date().getHours()) {
            if (horario.getMinutes() > 29) {
                horario.setMinutes(0);
                horario.setHours(horario.getHours() + 1);
            } else {
                horario.setMinutes(30);
            }
        }
        var horas = horario.getDate() != new Date().getDate() ? 08 : horario.getHours();
        var minutos = horario.getMinutes() > 29 ? 30 : 00;

        while (horas <= 22 && horas >= 8) {
            var item = "<li style='border-top: solid 1px #c1c1c1;' class='hora" + horaCompleta(horas, minutos) + "'>" +
                "<table style='width: 100%;'><tr><td>" +
                "<p id='xhora" + horaCompleta(horas, minutos) + "' style='color: white; margin: 5px 0px 0px 10px; padding: 0; font-weight: bold; font-size: 20px;'>" +
                (horas < 10 ? '0' + horas : horas) + ":" + (minutos == 0 ? '00' : minutos) + "</p>" +
                "</td><td style='width: 100%; height: 100%;' >" +
                "<p id='cont" + horaCompleta(horas, minutos) + "' style='margin: 8px 0 0 5px; color: #8E8E8E; text-shadow: none; font-weight: bold;'>Solicitar</p>" +
                "</td><td style='vertical-align: middle; text-align: right; padding-right: 10px;' >" +
                "<img id='img" + horaCompleta(horas, minutos) + "' src='images/circleforward.png' width='35px' style='cursor:pointer;'/>" +
                "</td></tr></table></li>";
                $(".horarioAgenda").append(item);
            var liItem = ".hora" + horaCompleta(horas, minutos);
            $(liItem).css("background-color", (minutos == 30 ? "#dadada" : "#c1c1c1")).css("color", "8e8e8e");

            $.each(agenda, function (idx, itm) {
                var dataAgenda = new Date(itm.horarioAgenda);
                if (dataAgenda.getTimezoneOffset() == 120) dataAgenda.setHours(dataAgenda.getHours() + 2);
                console.log(dataAgenda + "");
                if (horario.getDate() == dataAgenda.getDate()) {

                    var cont = "#cont" + horaCompleta(dataAgenda.getHours()+2, dataAgenda.getMinutes());
                    $(cont).empty();
                    $(cont).append(getInfoHorario(itm.infoHorario));
                    $(cont).css("color", (itm.infoHorario == 0 ? "#8E8E8E" :
                                          (itm.infoHorario == 1 ? "#ff726e" : "#996767")));
                    if (itm.infoHorario == 2) {
                        var imgRemove = "#img" + horaCompleta(dataAgenda.getHours()+2, dataAgenda.getMinutes());
                        $(imgRemove).remove();
                    }
                }
            });

            $(liItem).click(function () {
                var horarioEnvio;
                if (event.target.id.indexOf("cont") > -1) horarioEnvio = event.target.id.replace("cont", "");;
                if (event.target.id.indexOf("img") > -1) horarioEnvio = event.target.id.replace("img", "");
                if (event.target.id.indexOf("xhora") > -1) horarioEnvio = event.target.id.replace("xhora", "");
                
                horarioEnvio = horarioEnvio.substr(0, 2) + ":" + horarioEnvio.substr(2,2);
                exibirConfirmacao(horarioEnvio);
            //    var horario;
            //    var nomeServicos = "";
            //    var obj = "#"+event.target.id;
            //    if (obj.indexOf("cont") > -1) {
            //        horario = obj.replace("#cont", "");
            //        horario = horario.substr(0, 2) + ":" + horario.substr(2);
            //    }else if (obj.indexOf("xhora") > -1) {
            //        horario = obj.replace("#xhora", "").substr(0, 1) + ":" + horario.substr(1);
            //    };
            //    if (horario != null) {
                    
            //        var servico = JSON.parse(localStorage.getItem("iaziServicoEmpresa"));
            //        var selecionados = listServicosSelecionados.split(",");
            //        $.each(selecionados, function (index, valor) {
            //            $.each(servico, function (index2, valor2) {
            //                if (valor2.idEmpresaServico == valor.replace('select', '')) {
            //                    nomeServicos += nomeServicos == "" ? valor2.servico.nomeServico : ", " + alor2.servico.nomeServico;
            //                }
            //            });
            //        });
                    
            //    }
                
            });
            if (minutos == 30) {
                horas++;
                minutos = 00;
            }
            else minutos = 30;
        }
    }
}

function exibirConfirmacao(horario) {
    var nomeFuncionario;
    var nomeServico;
    var valorServico;
    var funcs = JSON.parse(localStorage.getItem('iaziFuncionariosEmpresa'));
    var servs = JSON.parse(localStorage.getItem('iaziServicoEmpresa'));
    $.each(funcs, function (index, it) {
        if (it.idEmpresaCliente == listFuncionariosSelecionados)
            nomeFuncionario = it.nomeCliente + " " + it.sobrenomeCliente;
    });
    $.each(servs, function (index, it) {
        if (it.idEmpresaServico == listFuncionariosSelecionados)
            nomeServico = it.servico.nomeServico;
        valorServico = it.valorServico;

    });
    var clienteServico = {
        idUsuario: JSON.parse(localStorage["iaziUser"]).idUsuario,
        idEmpresaCliente: listFuncionariosSelecionados,
        idEmpresaServico: listServicosSelecionados,
        valorServico: valorServico,
        dataServico: horarioAgendado.getFullYear() + '-' + (horarioAgendado.getMonth() + 1) + '-' +
                    horarioAgendado.getDate() + ' ' + horario

    };
    $(".horarioAgenda").empty();
    var item = "<li style='border-top: solid 1px #c1c1c1; ' class='selectHora" + horario + "'>" +
                "<table style='width: 100%;'><tr style='background-color: #dadada;'><td >" +
                "<p id='selectXhora" + horario + "' style='color: white; margin: 5px 0px 0px 10px; padding: 0; font-weight: bold; font-size: 20px;'>" +
                horario + "</p>" +
                "</td><td style='width: 100%; height: 100%;' >" +
                "<p style='margin: 5px 0 0 5px; color: #8E8E8E; text-shadow: none; font-weight: bold; font-size: 18px;'>"+
                nomeServico + "</p><p style='margin: 0 0 0 5px; color: #8E8E8E; text-shadow: none; font-weight: bold; font-size: 11px;' >" + nomeFuncionario + "</p>" +
                "</td></tr></table><div style='margin-top: 15%;' id='divConfirmar' class='confirm-button'></div></li>";
    $(".horarioAgenda").append(item);

    item = "<a>Confirmar solicitação</a>";
    $("#divConfirmar").append(item).click(function () {
        confirmarHorario(clienteServico);
    });
    
  
}

function confirmarHorario(horario) {
    $("#divConfirmar").empty().css("background-color", "transparent");
    var gif = "<img src='images/loading.gif' style='width: 20%'></img>";
    $("#divConfirmar").append(gif);
    
    $.ajax({
        type: 'POST',
        url: localStorage['iaziUrl'] + 'agenda/addcliser',
        contentType: 'application/json',
        data: JSON.stringify({ Horario: horario }),
        headers: {
            'Authorization': 'Bearer ' + usuario.tokenUsuario.access_token
        }
    })
       .success(function (data) {
           $("#divConfirmar").empty();
                   $("#divConfirmar").append("Requisicao enviada.");
        })
       .error(function () {
           $("#divConfirmar").empty();
           $("#divConfirmar").append("Erro de requisição tente novamente. ");
           var item = "Clique aqui.";
           $("#divConfirmar").append(item).click(function () {
               confirmarHorario(horario);
           });
       });

}