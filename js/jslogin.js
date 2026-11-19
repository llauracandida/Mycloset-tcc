console.log("🔥 LOGIN.JS CARREGADO!");

const loginForm = document.getElementById("loginForm");
const mensagemLogin = document.getElementById("mensagemLogin");

console.log("Formulário:", loginForm);
console.log("Mensagem:", mensagemLogin);

if (!loginForm) {
    console.error("❌ O formulário loginForm não foi encontrado.");
}

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    console.log("🟣 BOTÃO ENTRAR FOI CLICADO!");

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;

    console.log("E-mail:", email);
    console.log("Senha preenchida:", senha.length > 0);

    mensagemLogin.textContent = "Entrando...";

    try {

        console.log("🟡 Enviando login para o Supabase...");

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: senha
            });

        console.log("📦 Dados recebidos:", data);
        console.log("❌ Erro recebido:", error);

        if (error) {
            mensagemLogin.textContent =
                "Erro: " + error.message;

            return;
        }

        console.log("🎉 LOGIN REALIZADO!");

        mensagemLogin.textContent =
            "Login realizado com sucesso! ✨";

        localStorage.setItem(
            "usuarioId",
            data.user.id
        );

        setTimeout(function () {

            window.location.href = "dashboard.html";

        }, 1000);

    } catch (error) {

        console.error(
            "🔥 ERRO:",
            error
        );

        mensagemLogin.textContent =
            "Erro ao realizar login.";

    }

});