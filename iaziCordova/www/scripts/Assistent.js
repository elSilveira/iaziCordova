var actualPage;
var usuario = null;

function retornaCor(posicao) {
    while (posicao > 4) {
        posicao = posicao - 5;
    }
    switch (posicao) {
        case (0):
            return 'ff726e';
        case (1):
            return 'dd5758';
        case (2):
            return 'e8494e';
        case (3):
            return 'd4393d';
        case (4):
            return 'bc2c35';
    }
}

function retornaCorOver(posicao) {
    while (posicao > 4) {
        posicao = posicao - 5;
    }
    switch (posicao) {
        case (0):
            return 'ff728e';
        case (1):
            return 'dd5778';
        case (2):
            return 'e8496e';
        case (3):
            return 'd4395d';
        case (4):
            return 'bc2c55';
    }
}
//Controla as mudanças de pagina e cliques
function nextPage(page, data) {
    if (actualPage != page) {
        actualPage = page;
        switch (page) {
            case (0):     //Categorias
                $(".ui-content").empty();
                $("#header").empty();
                $(".ui-content").append("<ul id='listCategorias' style='list-style: none; margin: 0; padding: 0;'></ul>")
                .css("padding", "0 0 37px 0");
                getCategorias();
                break;
            case (1):     //Empresas
                $(".ui-content").empty();
                $("#header").empty();
                $(".ui-content").append("<ul id='listEmpresas' style='list-style: none; margin: 0; padding: 0;'></ul>")
                .css("padding", "32px 0 37px 0");

                if (data == 'back') exibirEmpresas();
                else getEmpresas(data);
                break;
            case (2):
                $(".ui-content").empty().css("padding", "32px 0 37px 0");
                $("#header").empty();
                listarServicoEmpresa(data);
                break;
            default:
                break;
        }
    }
}

function iaziHeader() {
    return "<img src='images/minitopoiazii.png' " +
    "style='height:30px; padding-top: 5px; padding-bottom: 5px;' />";
}