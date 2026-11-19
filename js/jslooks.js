let roupasCima = [];
let roupasBaixo = [];
let roupasSapato = [];

let indiceCima = 0;
let indiceBaixo = 0;
let indiceSapato = 0;
let roupaCimaSelecionada = null;
let roupaBaixoSelecionada = null;
let roupaSapatoSelecionada = null;
document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await carregarRoupas();

        document
            .getElementById("proximoCima")
            .addEventListener("click", proximaCima);

        document
            .getElementById("anteriorCima")
            .addEventListener("click", anteriorCima);

        document
            .getElementById("proximoBaixo")
            .addEventListener("click", proximoBaixo);

        document
            .getElementById("anteriorBaixo")
            .addEventListener("click", anteriorBaixo);

        document
            .getElementById("proximoSapato")
            .addEventListener("click", proximoSapato);

        document
            .getElementById("anteriorSapato")
            .addEventListener("click", anteriorSapato);

    }
);

async function carregarRoupas() {

    const { data: usuarioData } =
        await window.supabaseClient.auth.getUser();

    const usuario =
        usuarioData.user;

    if (!usuario) {

        alert("Faça login novamente.");

        return;

    }

    const { data: roupas, error } =
        await window.supabaseClient
            .from("roupas")
            .select("*")
            .eq("usuario_id", usuario.id);

    if (error) {

        console.error(error);

        return;

    }

    roupasCima =
        roupas.filter(
            roupa =>
                roupa.categoria === "Blusas" ||
                roupa.categoria === "Casacos"
        );

    roupasBaixo =
        roupas.filter(
            roupa =>
                roupa.categoria === "Calças" ||
                roupa.categoria === "Saias" ||
                roupa.categoria === "Shorts"
        );

    roupasSapato =
        roupas.filter(
            roupa =>
                roupa.categoria === "Sapatos"
        );

    atualizarTela();
}

function atualizarTela() {

    if (roupasCima.length > 0) {

        document.getElementById(
            "imagemCima"
        ).src =
            roupasCima[indiceCima].imagem;
roupaCimaSelecionada =
    roupasCima[indiceCima];
        document.getElementById(
            "nomeCima"
        ).textContent =
            roupasCima[indiceCima].nome;

        document.getElementById(
            "previewCima"
        ).src =
            roupasCima[indiceCima].imagem;
            roupaCimaSelecionada =
    roupasCima[indiceCima];
    }

    if (roupasBaixo.length > 0) {

        document.getElementById(
            "imagemBaixo"
        ).src =
            roupasBaixo[indiceBaixo].imagem;

        document.getElementById(
            "nomeBaixo"
        ).textContent =
            roupasBaixo[indiceBaixo].nome;

        document.getElementById(
            "previewBaixo"
        ).src =
            roupasBaixo[indiceBaixo].imagem;
            roupaBaixoSelecionada =
    roupasBaixo[indiceBaixo];
    }

    if (roupasSapato.length > 0) {

        document.getElementById(
            "imagemSapato"
        ).src =
            roupasSapato[indiceSapato].imagem;

        document.getElementById(
            "nomeSapato"
        ).textContent =
            roupasSapato[indiceSapato].nome;

        document.getElementById(
            "previewSapato"
        ).src =
            roupasSapato[indiceSapato].imagem;
            roupaSapatoSelecionada =
    roupasSapato[indiceSapato];
    }
}

function proximaCima() {

    if (roupasCima.length === 0)
        return;

    indiceCima =
        (indiceCima + 1)
        % roupasCima.length;

    atualizarTela();
}

function anteriorCima() {

    if (roupasCima.length === 0)
        return;

    indiceCima =
        (indiceCima - 1 + roupasCima.length)
        % roupasCima.length;

    atualizarTela();
}

function proximoBaixo() {

    if (roupasBaixo.length === 0)
        return;

    indiceBaixo =
        (indiceBaixo + 1)
        % roupasBaixo.length;

    atualizarTela();
}

function anteriorBaixo() {

    if (roupasBaixo.length === 0)
        return;

    indiceBaixo =
        (indiceBaixo - 1 + roupasBaixo.length)
        % roupasBaixo.length;

    atualizarTela();
}

function proximoSapato() {

    if (roupasSapato.length === 0)
        return;

    indiceSapato =
        (indiceSapato + 1)
        % roupasSapato.length;

    atualizarTela();
}

function anteriorSapato() {

    if (roupasSapato.length === 0)
        return;

    indiceSapato =
        (indiceSapato - 1 + roupasSapato.length)
        % roupasSapato.length;

    atualizarTela();
}

let lookAtualSalvoId = null;

async function salvarLook(favorito) {
    try {
        const nomeLook = document
            .getElementById("nomeLook")
            .value
            .trim();

        if (!nomeLook) {
            alert("Digite um nome para o look.");
            return;
        }

        if (
            !roupaCimaSelecionada &&
            !roupaBaixoSelecionada &&
            !roupaSapatoSelecionada
        ) {
            alert("Escolha pelo menos uma peça para o look.");
            return;
        }

        const { data: usuarioData, error: erroUsuario } =
            await window.supabaseClient.auth.getUser();

        if (erroUsuario) throw erroUsuario;

        const usuario = usuarioData.user;

        if (!usuario) {
            alert("Faça login novamente.");
            window.location.href = "login.html";
            return;
        }

        const dadosLook = {
            usuario_id: usuario.id,
            nome: nomeLook,
            blusa_id: roupaCimaSelecionada?.id || null,
            parte_baixo_id: roupaBaixoSelecionada?.id || null,
            sapato_id: roupaSapatoSelecionada?.id || null,
            favorito: favorito
        };

        let resultado;

        if (lookAtualSalvoId) {
            // Atualiza o look existente, sem criar uma cópia.
            resultado = await window.supabaseClient
                .from("looks")
                .update(dadosLook)
                .eq("id", lookAtualSalvoId)
                .eq("usuario_id", usuario.id)
                .select("id")
                .single();
        } else {
            // Cria o look pela primeira vez.
            resultado = await window.supabaseClient
                .from("looks")
                .insert(dadosLook)
                .select("id")
                .single();
        }

        if (resultado.error) throw resultado.error;

        lookAtualSalvoId = resultado.data.id;

        if (favorito) {
            alert("Look salvo nos favoritos! ❤️");
        } else {
            alert("Look salvo com sucesso! ✨");
        }

    } catch (erro) {
        console.error("Erro ao salvar look:", erro);
        alert("Não foi possível salvar o look: " + erro.message);
    }
}

document.getElementById("salvarLook").addEventListener("click", function () {
    salvarLook(false);
});

document.getElementById("favoritarLook").addEventListener("click", function () {
    salvarLook(true);
});

    
        "click",
        async function () {

            try {

                const nomeLook =
                    document
                        .getElementById("nomeLook")
                        .value
                        .trim();

                if (!nomeLook) {

                    alert(
                        "Digite um nome para o look."
                    );

                    return;
                }

                const { data: usuarioData } =
                    await window
                        .supabaseClient
                        .auth
                        .getUser();

                const usuario =
                    usuarioData.user;

                if (!usuario) {

                    alert(
                        "Usuário não encontrado."
                    );

                    return;
                }

                const { error } =
                    await window
                        .supabaseClient
                        .from("looks")
                        .insert([
                            {
                                usuario_id:
                                    usuario.id,

                                nome:
                                    nomeLook,

                                blusa_id:
                                    roupaCimaSelecionada?.id,

                                parte_baixo_id:
                                    roupaBaixoSelecionada?.id,

                                sapato_id:
                                    roupaSapatoSelecionada?.id,

                                favorito:
                                    false
                            }
                        ]);

                if (error) {

                    console.error(error);

                    alert(
                        error.message
                    );

                    return;
                }

                alert(
                    "Look salvo com sucesso! ✨"
                );

                document
                    .getElementById("nomeLook")
                    .value = "";

            } catch (erro) {

                console.error(erro);

                alert(
                    "Erro ao salvar look."
                );

            }

        }
    