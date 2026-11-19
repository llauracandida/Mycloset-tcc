const cadastroForm = document.getElementById("cadastroForm");
const mensagem = document.getElementById("mensagemCadastro");

cadastroForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;

    mensagem.textContent = "Criando conta...";

    console.log("Tentando cadastrar:", {
        nome: nome,
        email: email
    });

    try {

        const { data, error } =
            await supabaseClient.auth.signUp({
                email: email,
                password: senha,
                options: {
                    data: {
                        nome: nome
                    }
                }
            });

        console.log("RESULTADO DO SUPABASE:", data);
        console.log("ERRO DO SUPABASE:", error);

        if (error) {
            throw error;
        }

        mensagem.textContent =
            "Conta criada com sucesso! ✨";

    } catch (error) {

        console.error("ERRO NO CADASTRO:", error);

        mensagem.textContent =
            "Erro: " + error.message;
    }
});