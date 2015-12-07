function getCategorias() {
   
    $.ajax({
        type: 'GET',
        url: localStorage['iaziUrl'] + 'servicos/listCategoria',
        contentType: 'application/json',
        data: JSON.stringify({ IdUsuario: usuario.idUsuario }),
        headers: {
            'Authorization': 'Bearer ' + token.access_token
        }
    })
        .success(function (data) {
            localStorage.setItem('iaziCategorias', JSON.stringify(data));
            exibirCategorias();
        })
        .error(function (data) {
            alert("Erro" + data.toString());
        });
}

function exibirCategorias() {
    $(".listCategorias").empty();
    var cat = JSON.parse(localStorage.getItem('iaziCategorias'));
    $.each(cat, function (i, v) {
        var item =
            "<li style='width: 100%; background-color:#" + retornaCor(i) + "' margin-top: 25%; id='cat" + v.nomeCategoria.replace(/ /g, '') + "'>" +
            "<table style='color: #FFFFFF; display:inline-table; width: 100%;'  ><tr>" +
               "<td style='height:" + $(document).height() * 0.20 + "px; width:25%' align='center'>" +
                    "<img src='images/" + v.iconeCategoria + ".png' width='45' />" +
                    "</td><td style='font-size: 20px;'>" +
                    v.nomeCategoria +
               "</td></tr></table></li>";
        $(".listCategorias").append(item);
        //Adiciona função ao item da lista
        $("#cat" + v.nomeCategoria.replace(/ /g, '')).click(function () {
            nextPage(1, v.idCategoria) // 1 = Categorias
        }).on("mouseover", function () {
            $(this).css("backgroud-color", "#" + retornaCorOver(i));
        });
    });
}