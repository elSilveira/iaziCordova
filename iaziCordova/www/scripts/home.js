function callTeste() {

    var user = JSON.parse(localStorage.getItem("iaziUser"));

    console.log(user.tokenUsuario.token_type);
}
