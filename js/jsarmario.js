console.log("SUPABASE:", window.supabaseClient);

document.addEventListener("DOMContentLoaded", function () {

    const botaoAdicionar =
        document.getElementById("abrirFormulario");

    const formulario =
        document.getElementById("formularioRoupa");

    const botaoFechar =
        document.getElementById("fecharFormulario");

    if (botaoAdicionar && formulario) {

        botaoAdicionar.addEventListener("click", function () {

            formulario.classList.remove("hidden");

        });

    }

    if (botaoFechar && formulario) {

        botaoFechar.addEventListener("click", function () {

            formulario.classList.add("hidden");

        });

    }

    carregarRoupas();

});

document.getElementById("roupaForm").addEventListener("submit", async function (e) {

    e.preventDefault();

    try {

        const { data: usuarioData } =
            await window.supabaseClient.auth.getUser();

        const usuario = usuarioData.user;

        if (!usuario) {

            alert("Usuário não encontrado.");
            return;

        }

        const nome =
            document.getElementById("nome").value;

        const categoria =
            document.getElementById("categoria").value;

        const cor =
            document.getElementById("cor").value;

        const arquivo =
            document.getElementById("imagem").files[0];

        let imagemUrl = null;

        // UPLOAD DA FOTO
        if (arquivo) {

            const nomeArquivo =
                `${usuario.id}/${Date.now()}_${arquivo.name}`;

            const { error: uploadError } =
                await window.supabaseClient.storage
                    .from("roupas")
                    .upload(nomeArquivo, arquivo);

            if (uploadError) {

                console.error(uploadError);
                alert("Erro ao enviar imagem.");
                return;

            }

            const { data } =
                window.supabaseClient.storage
                    .from("roupas")
                    .getPublicUrl(nomeArquivo);

            imagemUrl = data.publicUrl;

        }

        const { error } =
            await window.supabaseClient
                .from("roupas")
                .insert([
                    {
                        usuario_id: usuario.id,
                        nome: nome,
                        categoria: categoria,
                        cor: cor,
                        imagem: imagemUrl
                    }
                ]);

        if (error) {

            console.error(error);
            alert(error.message);
            return;

        }

        alert("Roupa salva com sucesso! ");

        document
            .getElementById("roupaForm")
            .reset();

        document
            .getElementById("formularioRoupa")
            .classList.add("hidden");

        carregarRoupas();

    } catch (erro) {

        console.error(erro);
        alert("Erro inesperado.");

    }

});

async function carregarRoupas() {

    const { data: usuarioData } =
        await window.supabaseClient.auth.getUser();

    const usuario = usuarioData.user;

    if (!usuario) return;

    const { data: roupas, error } =
        await window.supabaseClient
            .from("roupas")
            .select("*")
            .eq("usuario_id", usuario.id);

    if (error) {

        console.error(error);
        return;

    }
    todasRoupas = roupas;

    document.getElementById("contadorRoupas").textContent =
    roupas.length + " peças";

    const lista =
        document.getElementById("listaRoupas");

    if (!lista) return;

    lista.innerHTML = "";

    if (roupas.length === 0) {

        lista.innerHTML = `
            <div class="empty-state">
                <h3>Seu armário está vazio</h3>
                <p>Adicione sua primeira peça para começar.</p>
            </div>
        `;

        return;

    }

    async function excluirRoupa(id) {

    const confirmar = confirm(
        "Deseja realmente excluir esta roupa?"
    );

    if (!confirmar) return;

    const { error } =
        await window.supabaseClient
            .from("roupas")
            .delete()
            .eq("id", id);

    if (error) {
        console.error(error);
        alert("Erro ao excluir.");
        return;
    }

    alert("Roupa excluída com sucesso!");

    carregarRoupas();
}
    roupas.forEach(roupa => {

        lista.innerHTML += `
            <div class="roupa-card">

                ${
                    roupa.imagem
                    ?
                    `<img src="${roupa.imagem}" class="roupa-foto">`
                    :
                    `<div class="roupa-icon"></div>`
                }

                <h3>${roupa.nome}</h3>
                <p>${roupa.categoria}</p>
                <span>${roupa.cor}</span>

                <button
    class="btn-excluir"
    onclick="excluirRoupa(${roupa.id})"
>
    🗑 Excluir
</button>
            </div>
        `;

    });

}


window.excluirRoupa = async function(id) {

    const confirmar = confirm(
        "Deseja realmente excluir esta roupa?"
    );

    if (!confirmar) return;

    const { error } = await window.supabaseClient
        .from("roupas")
        .delete()
        .eq("id", id);

    if (error) {
        console.error(error);
        alert("Erro ao excluir.");
        return;
    }

    // Remove a roupa da lista armazenada
    todasRoupas = todasRoupas.filter(
        roupa => roupa.id !== id
    );

    // Atualiza a tela sem recarregar a página
    carregarRoupas();

    alert("Roupa excluída com sucesso!");

};

window.filtrarRoupas = function(categoria) {

    const lista =
        document.getElementById("listaRoupas");

    lista.innerHTML = "";

    let roupasFiltradas =
        todasRoupas;

    if (categoria !== "todas") {

        roupasFiltradas =
            todasRoupas.filter(
                roupa =>
                    roupa.categoria === categoria
            );

    }
    document.getElementById("contadorRoupas").textContent =
    roupasFiltradas.length + " peças";

    roupasFiltradas.forEach(roupa => {

        lista.innerHTML += `
            <div class="roupa-card">

                ${
                    roupa.imagem
                    ? `<img src="${roupa.imagem}" class="roupa-foto">`
                    : `<div class="roupa-icon"></div>`
                }

                <h3>${roupa.nome}</h3>
                <p>${roupa.categoria}</p>
                <span>${roupa.cor}</span>

                <button
                    class="btn-excluir"
                    onclick="excluirRoupa(${roupa.id})"
                >
                    🗑 Excluir
                </button>

            </div>
        `;

    });

};

document.addEventListener("DOMContentLoaded", function () {
    const botaoSair = document.getElementById("logoutButton");

    if (!botaoSair) {
        console.error("Não encontrei o botão Sair.");
        return;
    }

    botaoSair.addEventListener("click", async function () {
        const confirmar = confirm("Deseja realmente sair da sua conta?");

        if (!confirmar) return;

        botaoSair.disabled = true;

        try {
            const { error } =
                await window.supabaseClient.auth.signOut();

            if (error) throw error;

            window.location.href = "index.html";

        } catch (erro) {
            console.error("Erro ao sair:", erro);
            alert("Não foi possível sair. Tente novamente.");
            botaoSair.disabled = false;
        }
    });
});
