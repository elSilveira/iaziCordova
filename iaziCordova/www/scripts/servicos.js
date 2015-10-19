var usuario;

function getServicos() {
    if (usuario == null) getUserInfo();
    $.ajax({
        type: 'GET',
        url: 'http://localhost:58203/servicos/listCategoria',
        contentType: "application/json",
        data: JSON.stringify({ IdUsuario: usuario.idusuario }),
        headers: {
            'Authorization': 'Bearer ' + usuario.tokenUsuario.access_token
        }
    })
        .success(function (data) {
            alert("Opa");
        })
        .error(function () {
            getToken();
        });
}

function getUserInfo() {
    usuario = JSON.parse(localStorage.getItem("iaziUser"));
}