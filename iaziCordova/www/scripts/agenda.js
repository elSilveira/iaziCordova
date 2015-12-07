var agendaHorarioAgendado;

function agendaCliente(data) {
    if (data == null) data = new Date();

    // $.each(cat, function (i, v) {
    var item = "<li><div style='text-align: left; width:100%; margin: 0;'> " +
        "<table><tr>" +
        "<td style='width: 20px;' id='backMonth'><img src='images/backRed.png' style='height:16px; padding: 0; margin: 0; '/> </td>" +
        "<td style='width: 100%; text-align: center;'><a style='font-size: 14px; font-weight: bold; color: #ff726e; padding: 0;'>" + mesPorExtenso(data.getMonth()).toUpperCase() + ' - ' + data.getUTCFullYear() + "</a></div></td>" +
        "<td style='width: 20px; text-align: right;' id='nextMonth'><img src='images/forwardRed.png' style='height:16px; padding: 0; margin: 0; ' /> " +
        "</td></tr></table><div style='width:100%; padding: 0; margin:0;'>" +
            "<table class='diasAgenda' style='width: 100%; text-align: center; background-color: #c1c1c1;'><tr>" +
            "<td id='dia-2'><p class='textAgenda'>" + diaDaSemana(data.getDay(), -2) + "</p><p>" + showData(data, -2) + "</p></td>" +
            "<td id='dia-1'><p class='textAgenda'>" + diaDaSemana(data.getDay(), -1) + "</p><p>" + showData(data, -1) + "</p></td>" +
            "<td id='dia0'><p class='textAgenda'>" + diaDaSemana(data.getDay(), 0) + "</p><p>" + showData(data, 0) + "</p></td>" +
            "<td id='dia1'><p class='textAgenda'>" + diaDaSemana(data.getDay(), 1) + "</p><p>" + showData(data, 1) + "</p></td>" +
            "<td id='dia2'><p class='textAgenda'>" + diaDaSemana(data.getDay(), 2) + "</p><p>" + showData(data, 2) + "</p></td>" +
            "<td id='dia3'><p class='textAgenda'>" + diaDaSemana(data.getDay(), 3) + "</p><p>" + showData(data, 3) + "</p></td></tr></table></div>" +
            "<ul class='horarioAgenda' style='background-color: white; position: static; list-style: none; margin: 0; padding: 0;'></ul></li>";
    $(".listAgendaCliente").append(item);
    $(".diasAgenda td").css('width', '14%').css('background-color', '#c1c1c1').css('text-shadow', 'none').css('border-left', '1px solid white')
        .css('color', '#8E8E8E');
    $("#dia-2").css('border-left', 'none');
    $(".diasAgenda td p").css('font-weight', 'bold').css('font-size', '24px').css('margin', '0').css('padding', '0').css('line-height', '1.0');;
    $(".textAgenda").css('font-weight', 'normal').css('font-size', '11px').css('margin', '0').css('padding', '5px 0').css('line-height', '0.7')
    .css('color', '#8E8E8E');
    $("#dia0").css('color', '#ff726e');
    $("#backMonth").click(function () {
        $(".listAgendaCliente").empty();
        agendaCliente(new Date(
                (data.getFullYear()),
                (data.getMonth()),
                (data.getDate() - 6)));
    });
    $("#nextMonth").click(function () {
        $(".listAgendaCliente").empty();
        agendaCliente(new Date(data.getFullYear(), data.getMonth(),
            (data.getDate() + 6)));
    });
    $(("#dia-2")).click(function () {
        $(".diasAgenda td").css('color', '#8E8E8E');
        $(this).css('color', '#ff726e');
        addHorariosAgenda(new Date(data.getFullYear(), data.getMonth(),
            (data.getDate() - 2)));
    });
    $(("#dia-1")).click(function () {
        $(".diasAgenda td").css('color', '#8E8E8E');
        $(this).css('color', '#ff726e');
        addHorariosAgenda(new Date(data.getFullYear(), data.getMonth(),
            (data.getDate() - 1)));
    });
    $(("#dia0")).click(function () {
        $(".diasAgenda td").css('color', '#8E8E8E');
        $(this).css('color', '#ff726e');
        addHorariosAgenda(new Date());
    });
    $(("#dia1")).click(function () {
        $(".diasAgenda td").css('color', '#8E8E8E');
        $(this).css('color', '#ff726e');
        addHorariosAgenda(new Date(data.getFullYear(), data.getMonth(),
            (data.getDate() + 1)));
    });
    $(("#dia2")).click(function () {
        $(".diasAgenda td").css('color', '#8E8E8E');
        $(this).css('color', '#ff726e');
        addHorariosAgenda(new Date(data.getFullYear(), data.getMonth(),
            (data.getDate() + 2)));
    });
    $(("#dia3")).click(function () {
        $(".diasAgenda td").css('color', '#8E8E8E');
        $(this).css('color', '#ff726e');
        addHorariosAgenda(new Date(data.getFullYear(), data.getMonth(),
            (data.getDate() + 3)));
    });
    addHorariosAgenda(data);
}

function addHorariosAgenda(dataAgenda) {
    agendaHorarioAgendado = dataAgenda;
    var dataSend = {
        idUsuario: usuario.idUsuario,
        ano: dataAgenda.getFullYear(),
        mes: dataAgenda.getMonth(),
        dia: dataAgenda.getDate()
    }
    $.ajax({
        type: 'POST',
        url: localStorage['iaziUrl'] + 'agenda/listAgenda',
        contentType: 'application/json',
        data: JSON.stringify({ Cliente: dataSend }),
        headers: {
            'Authorization': 'Bearer ' + token.access_token
        }
    })
        .success(function (data) {
            localStorage.setItem('iaziAgendaFuncionario', JSON.stringify(data));
            mostrarHorariosAgenda(dataAgenda, data);
        })
        .error(function () {
            mostrarHorariosAgenda(dataAgenda, null);
        });
}


function mostrarHorariosAgenda(horario, agenda) {
    if (horario == null) {
        horario = new Date();
    }

    $(".horarioAgenda").empty();
    if (horario.getDate() >= new Date().getDate() && horario.getMonth() >= new Date().getMonth() && horario.getFullYear() >= new Date().getFullYear()) {
        if (horario.getDate() == new Date().getDate() && horario.getHours() == new Date().getHours()) {
            if (horario.getMinutes() > 29) {
                horario.setMinutes(0);
                horario.setHours(horario.getHours() + 1);
            } else {
                horario.setMinutes(30);
            }
        }
        var horas = horario.getDate() != new Date().getDate() ? 07 : horario.getHours();
        var minutos = horario.getMinutes() > 29 ? 30 : 00;

        while (horas <= 22 && horas >= 7) {
            var item = "<li style='border-top: solid 1px #c1c1c1; height: 35px;' class='hora" + horaCompleta(horas, minutos) + "'>" +
                "<table style='width: 100%;'><tr><td>" +
                "<p id='xhora" + horaCompleta(horas, minutos) + "' style='color: white; margin: 5px 0px 0px 10px; padding: 0; font-weight: normal; font-size: 20px;'>" +
                (horas < 10 ? '0' + horas : horas) + ":" + (minutos == 0 ? '00' : minutos) + "</p>" +
                "</td><td style='width: 100%; height: 100%;' >" +
                "<p id='cont" + horaCompleta(horas, minutos) + "' style='margin: 8px 0 0 5px; color: #8E8E8E; text-shadow: none; font-weight: bold;'></p>" +
                "</td></tr></table></li>";
            $(".horarioAgenda").append(item);
            var liItem = ".hora" + horaCompleta(horas, minutos);
            $(liItem).css("background-color", (minutos == 30 ? "#dadada" : "#c1c1c1")).css("color", "8e8e8e");

            if (agenda != null) {
                $.each(agenda, function (idx, itm) {
                    var dataAgenda = new Date(itm.horarioAgenda);
                    if (dataAgenda.getTimezoneOffset() == 120) dataAgenda.setHours(dataAgenda.getHours() + 2);
                    console.log(dataAgenda + "");
                    if (horario.getDate() == dataAgenda.getDate()) {

                        var cont = "#cont" + horaCompleta(dataAgenda.getHours() + 2, dataAgenda.getMinutes());
                        $(cont).empty();
                        $(cont).append(getInfoHorario(itm.infoHorario));
                        $(cont).css("color", (itm.infoHorario == 0 ? "#8E8E8E" :
                                              (itm.infoHorario == 1 ? "#ff726e" : "#996767")));
                        if (itm.infoHorario == 2) {
                            var imgRemove = "#img" + horaCompleta(dataAgenda.getHours() + 2, dataAgenda.getMinutes());
                            $(imgRemove).remove();
                        }
                    }
                });
            }

            $(liItem).click(function () {
                var horarioEnvio;
                if (event.target.id.indexOf("cont") > -1) horarioEnvio = event.target.id.replace("cont", "");;
                if (event.target.id.indexOf("img") > -1) horarioEnvio = event.target.id.replace("img", "");
                if (event.target.id.indexOf("xhora") > -1) horarioEnvio = event.target.id.replace("xhora", "");

                horarioEnvio = horarioEnvio.substr(0, 2) + ":" + horarioEnvio.substr(2, 2);
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