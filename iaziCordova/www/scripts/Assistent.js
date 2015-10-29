var actualPage;

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
                $(".ui-content").append("<ul id='listCategorias' style='width:100%; height:100%; list-style: none; margin: 0; padding: 0;'></ul>");
                getServicos();
                break;
            case (1):     //Empresas
                $(".ui-content").empty();
                $(".ui-content").append("<ul id='listEmpresas' style='width:100%; height:100%; list-style: none; margin: 0; padding: 0;'></ul>");
                getEmpresas(data);
                break;
            case (0):
                $("#main").empty();
                break;
            default:
                break;
        }
    }
}

