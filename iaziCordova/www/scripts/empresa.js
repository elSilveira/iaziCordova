
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
            "<li style='width: 100%; background-color: #FF3322;'>" + v.nomeEmpresa + "</li>";
        $("#listEmpresas").append(item);
    })
}