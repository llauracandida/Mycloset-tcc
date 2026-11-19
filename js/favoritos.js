
document.addEventListener("DOMContentLoaded", carregarFavoritos);

async function carregarFavoritos() {
    const lista = document.getElementById("listaLooksSalvos");

    if (!lista) {
        console.error('Não encontrei o elemento "listaLooksSalvos" no HTML.');
        return;
    }

    try {
        lista.innerHTML = "<p>Buscando seus favoritos...</p>";

        const cliente = window.supabaseClient;

        if (!cliente) {
            throw new Error("O Supabase não foi carregado. Confira o arquivo js/supabase.js.");
        }

        const { data: usuarioData, error: erroUsuario } =
            await cliente.auth.getUser();

        if (erroUsuario) throw erroUsuario;

        const usuario = usuarioData.user;

        if (!usuario) {
            window.location.href = "index.html";
            return;
        }

        const { data: looks, error: erroLooks } = await cliente
            .from("looks")
            .select("*")
            .eq("usuario_id", usuario.id)
            .eq("favorito", true);

        if (erroLooks) throw erroLooks;

        console.log("Looks favoritos encontrados:", looks);

        if (!looks || looks.length === 0) {
            lista.innerHTML = `
                <div class="empty-clothes">
                    <h3>Nenhum favorito por enquanto ♡</h3>
                    <p>Entre em Criar Look e favorite suas combinações.</p>
                </div>
            `;
            return;
        }

        const ids = [
            ...new Set(
                looks.flatMap(look => [
                    look.blusa_id,
                    look.parte_baixo_id,
                    look.sapato_id
                ].filter(id => id !== null && id !== undefined))
            )
        ];

        let roupas = [];

        if (ids.length > 0) {
            const { data, error } = await cliente
                .from("roupas")
                .select("id, nome, imagem")
                .in("id", ids);

            if (error) throw error;
            roupas = data || [];
        }

        const roupasPorId = new Map(
            roupas.map(roupa => [String(roupa.id), roupa])
        );

        lista.innerHTML = "";

        looks.forEach(look => {
            const card = document.createElement("article");
            card.className = "look-salvo-card";

            const titulo = document.createElement("h3");
            titulo.textContent = look.nome || "Meu look";

            const imagens = document.createElement("div");
            imagens.className = "look-salvo-imagens";

            const pecas = [
                ["Parte de cima", look.blusa_id],
                ["Parte de baixo", look.parte_baixo_id],
                ["Sapato", look.sapato_id]
            ];

            pecas.forEach(([categoria, id]) => {
                if (id == null) return;

                const roupa = roupasPorId.get(String(id));

                if (!roupa) return;

                const item = document.createElement("div");
                item.className = "look-salvo-peca";

                if (roupa.imagem) {
                    const img = document.createElement("img");
                    img.src = roupa.imagem;
                    img.alt = roupa.nome || categoria;
                    img.loading = "lazy";
                    item.appendChild(img);
                }

                const nome = document.createElement("p");
                nome.textContent = roupa.nome || categoria;
                item.appendChild(nome);

                imagens.appendChild(item);
            });

            if (imagens.children.length === 0) {
                const aviso = document.createElement("p");
                aviso.textContent =
                    "As peças deste look não foram encontradas.";
                imagens.appendChild(aviso);
            }

            const remover = document.createElement("button");
            remover.type = "button";
            remover.className = "remover-favorito";
            remover.textContent = "♥ Remover dos favoritos";

            remover.addEventListener("click", async () => {
                remover.disabled = true;

                try {
                    const { error } = await cliente
                        .from("looks")
                        .update({ favorito: false })
                        .eq("id", look.id)
                        .eq("usuario_id", usuario.id);

                    if (error) throw error;

                    card.remove();

                    if (!lista.querySelector(".look-salvo-card")) {
                        lista.innerHTML = `
                            <div class="empty-clothes">
                                <h3>Nenhum favorito por enquanto ♡</h3>
                                <p>Você pode favoritar outros looks quando quiser.</p>
                            </div>
                        `;
                    }
                } catch (erro) {
                    console.error("Erro ao remover favorito:", erro);
                    alert("Não foi possível remover: " + erro.message);
                    remover.disabled = false;
                }
            });

            card.append(titulo, imagens, remover);
            lista.appendChild(card);
        });

    } catch (erro) {
        console.error("Erro ao carregar favoritos:", erro);

        lista.innerHTML = `
            <p>Não foi possível carregar seus favoritos.</p>
            <p>Abra o Console (F12) para verificar o erro.</p>
        `;
    }
}

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", async function () {
        const { error } = await supabase.auth.signOut();

        if (error) {
            alert("Erro ao sair da conta. Tente novamente.");
            console.error("Erro ao sair:", error);
            return;
        }

        window.location.href = "login.html";
    });
}

