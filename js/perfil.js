
const placeholderFoto =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
            <rect width="100%" height="100%" fill="#eadde0"/>
            <circle cx="100" cy="75" r="35" fill="#b99a9f"/>
            <path d="M35 190 Q35 120 100 120 Q165 120 165 190"
                  fill="#b99a9f"/>
        </svg>
    `);

let usuarioAtual = null;
let fotoSelecionada = null;

document.addEventListener("DOMContentLoaded", async () => {
    await iniciarPerfil();
});

async function iniciarPerfil() {
    try {
        const { data, error } = await window.supabaseClient.auth.getUser();

        if (error) throw error;

        if (!data.user) {
            window.location.href = "index.html";
            return;
        }

        usuarioAtual = data.user;

        const metadata = usuarioAtual.user_metadata || {};

        document.getElementById("nomePerfil").value =
            metadata.nome || "";

        document.getElementById("usuarioPerfil").value =
            metadata.username || "";

        document.getElementById("bioPerfil").value =
            metadata.bio || "";

        document.getElementById("fotoPreview").src =
            metadata.foto_url || placeholderFoto;

        document.getElementById("fotoPerfil").addEventListener(
            "change",
            (event) => {
                const arquivo = event.target.files[0];

                if (!arquivo) return;

                if (!arquivo.type.startsWith("image/")) {
                    mostrarMensagem("Escolha um arquivo de imagem.", true);
                    event.target.value = "";
                    return;
                }

                if (arquivo.size > 5 * 1024 * 1024) {
                    mostrarMensagem("A foto deve ter no máximo 5 MB.", true);
                    event.target.value = "";
                    return;
                }

                fotoSelecionada = arquivo;

                document.getElementById("fotoPreview").src =
                    URL.createObjectURL(arquivo);

                mostrarMensagem("", false);
            }
        );

        document.getElementById("perfilForm").addEventListener(
            "submit",
            salvarPerfil
        );

        document.getElementById("logoutButton").addEventListener(
            "click",
            async () => {
                await window.supabaseClient.auth.signOut();
                window.location.href = "index.html";
            }
        );

        // Carrega todos os looks depois de identificar o usuário.
        await carregarLooksSalvos();

    } catch (erro) {
        console.error("Erro ao iniciar perfil:", erro);
        mostrarMensagem("Não foi possível carregar o perfil.", true);
    }
}

async function salvarPerfil(event) {
    event.preventDefault();

    const botao = document.getElementById("salvarPerfil");
    botao.disabled = true;
    botao.textContent = "Salvando...";

    try {
        const nome = document.getElementById("nomePerfil").value.trim();

        const username = document.getElementById("usuarioPerfil")
            .value.trim()
            .replace(/^@/, "")
            .toLowerCase();

        const bio = document.getElementById("bioPerfil").value.trim();

        if (!nome || !username) {
            throw new Error("Preencha o nome e o nome de usuário.");
        }

        if (!/^[a-z0-9._-]+$/.test(username)) {
            throw new Error(
                "Use letras sem acento, números, ponto, hífen ou underline no nome de usuário."
            );
        }

        let fotoUrl = usuarioAtual.user_metadata?.foto_url || "";

        if (fotoSelecionada) {
            const extensao = fotoSelecionada.name
                .split(".")
                .pop()
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "") || "jpg";

            const caminho =
                `${usuarioAtual.id}/perfil-${Date.now()}.${extensao}`;

            const { error: erroUpload } = await window.supabaseClient
                .storage
                .from("perfis")
                .upload(caminho, fotoSelecionada, {
                    upsert: false,
                    contentType: fotoSelecionada.type
                });

            if (erroUpload) throw erroUpload;

            const { data: fotoData } = window.supabaseClient
                .storage
                .from("perfis")
                .getPublicUrl(caminho);

            fotoUrl = fotoData.publicUrl;
        }

        const { data, error } = await window.supabaseClient.auth.updateUser({
            data: {
                nome,
                username,
                bio,
                foto_url: fotoUrl
            }
        });

        if (error) throw error;

        usuarioAtual = data.user;
        fotoSelecionada = null;

        mostrarMensagem("Perfil atualizado com sucesso!", false);

    } catch (erro) {
        console.error("Erro ao salvar perfil:", erro);
        mostrarMensagem(
            erro.message || "Não foi possível salvar o perfil.",
            true
        );
    } finally {
        botao.disabled = false;
        botao.textContent = "Salvar alterações";
    }
}

function mostrarMensagem(texto, erro) {
    const mensagem = document.getElementById("mensagemPerfil");

    mensagem.textContent = texto;
    mensagem.className = "profile-message";

    if (texto) {
        mensagem.classList.add(erro ? "error" : "success");
    }
}

async function carregarLooksSalvos() {
    const lista = document.getElementById("listaLooksSalvos");

    if (!lista) return;

    lista.innerHTML = "<p>Carregando seus looks...</p>";

    try {
        const { data: usuarioData, error: erroUsuario } =
            await window.supabaseClient.auth.getUser();

        if (erroUsuario) throw erroUsuario;

        const usuario = usuarioData.user;

        if (!usuario) {
            lista.innerHTML = "<p>Faça login para ver seus looks.</p>";
            return;
        }

        // Busca todos os looks do usuário, sem filtrar os favoritos.
        const { data: looks, error: erroLooks } =
            await window.supabaseClient
                .from("looks")
                .select("*")
                .eq("usuario_id", usuario.id)
                .order("id", { ascending: false });

        if (erroLooks) throw erroLooks;

        if (!looks || looks.length === 0) {
            lista.innerHTML = `
                <div class="empty-clothes">
                    <h3>Você ainda não salvou nenhum look.</h3>
                    <p>Visite a página Criar Look para montar sua primeira combinação.</p>
                </div>
            
            
            
                `;
            return;
        }

        const idsRoupas = [
            ...new Set(
                looks.flatMap(look => [
                    look.blusa_id,
                    look.parte_baixo_id,
                    look.sapato_id
                ].filter(id => id !== null && id !== undefined))
            )
        ];

        let roupas = [];

        if (idsRoupas.length > 0) {
            const { data, error } = await window.supabaseClient
                .from("roupas")
                .select("id, nome, imagem")
                .in("id", idsRoupas);

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

            const status = document.createElement("p");
            status.className = "look-status";
            status.textContent = look.favorito
                ? "♥ Favorito"
                : "Look salvo";

            const imagens = document.createElement("div");
            imagens.className = "look-salvo-imagens";

            const pecas = [
                ["Blusa", look.blusa_id],
                ["Parte de baixo", look.parte_baixo_id],
                ["Sapato", look.sapato_id]
            ];

            pecas.forEach(([categoria, id]) => {
                if (id === null || id === undefined) return;

                const roupa = roupasPorId.get(String(id));

                if (!roupa) return;

                const figura = document.createElement("div");
                figura.className = "look-salvo-peca";

                if (roupa.imagem) {
                    const img = document.createElement("img");
                    img.src = roupa.imagem;
                    img.alt = roupa.nome || categoria;
                    img.loading = "lazy";
                    figura.appendChild(img);
                }

                const nome = document.createElement("p");
                nome.textContent = roupa.nome || categoria;
                figura.appendChild(nome);

                imagens.appendChild(figura);
            });

            if (imagens.children.length === 0) {
                const aviso = document.createElement("p");
                aviso.textContent =
                    "As fotos das peças não estão disponíveis.";
                imagens.appendChild(aviso);
            }

            card.append(titulo, status, imagens);
            lista.appendChild(card);
        });

    } catch (erro) {
        console.error("Erro ao carregar looks salvos:", erro);

        lista.innerHTML = `
            <div class="empty-clothes">
                <h3>Não foi possível carregar seus looks.</h3>
                <p>Abra o Console do navegador (F12) para verificar o erro.</p>
            </div>
        `;
    }
}
async function excluirLook(lookId) {
    const confirmar = confirm(
        "Tem certeza que deseja excluir este look? Essa ação não pode ser desfeita."
    );

    if (!confirmar) return;

    try {
        const { data: { user }, error: erroUsuario } =
            await window.supabaseClient.auth.getUser();

        if (erroUsuario || !user) {
            alert("Você precisa estar logado para excluir um look.");
            return;
        }

        const { error } = await window.supabaseClient
            .from("looks")
            .delete()
            .eq("id", lookId)
            .eq("usuario_id", user.id);

        if (error) {
            console.error("Erro ao excluir look:", error);
            alert("Não foi possível excluir o look.");
            return;
        }

        alert("Look excluído com sucesso! 🗑️");

        // Atualiza a lista de looks na tela
        await carregarLooksSalvos();

    } catch (erro) {
        console.error("Erro inesperado:", erro);
        alert("Ocorreu um erro ao excluir o look.");
    }
}

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        logoutButton.disabled = true;

        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                throw error;
            }

            window.location.replace("login.html");
        } catch (error) {
            console.error("Erro ao sair:", error);
            alert("Não foi possível sair da conta. Tente novamente.");
            logoutButton.disabled = false;
        }
    });
}
