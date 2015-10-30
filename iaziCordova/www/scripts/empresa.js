
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

    $.each(emp, function (i, v) {
        var item =
         "<li style=' border-bottom: #353535 solid 1px; padding-top: 5px'>" +
        "<table  style='width: 100%; margin: 5;'> <tr> " +
        "<td> <p style='text-align: left;'>" +
        "<img src='images/favoritouncheck.png' width='25'/> </p><p style='text-align: center;'>" +
        "<img style='width:25%; border-radius: 50%;' src='" + usuario.iaziUrl + "Assets/" + v.imagemEmpresa + "' /> " +
        "</p></td> </tr> <tr><td style='text-align: center; color: #808080; font-weight: bold;'> " +
                 v.nomeEmpresa + 
        "</td></tr><tr><td style='letter-spacing: 0px; font-size: 11px; text-align: center;'> " +
                v.ruaEmpresa.toUpperCase() + ", " + v.numeroEmpresa + " " + v.bairroEmpresa.toUpperCase() +
                "</br> " + v.cidadeEmpresa.toUpperCase() + " " + v.estadoEmpresa.toUpperCase() +
        "</td></tr> " +
        "<tr><td id='tipoServico' style='font-size: 16px; text-align: center; padding-bottom: 5px; font-weight: bold;'" + v.idEmpresa + ">" +
        v.tipoServico
        "</td></tr></table></li>";
        $("#listEmpresas").append(item);

    })  
}