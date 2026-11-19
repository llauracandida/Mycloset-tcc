<?php
if ($_SERVER["REQUEST_METHOD"]== "POST"){
    $host = "localhost";
    $usuario = "root";
    $senha = "";
    $banco = "laura";
    $conn = new mysqli ( $host , $usuario , $senha , $banco );

    if ($conn -> connect_error){
        die("Erro de conexâo: ". $conn -> connect_error );
    }

    $nome = $_POST['nome'] ; 
    $preco = $_POST['preco'];
    $quantidade = $_POST ['quantidade_estoque'];
    $loja = $_POST ['loja'];
    $foto = $_POST ['foto'];

   $sql = "INSERT INTO produtos_informatica 
        (nome, preco, quantidade_estoque, loja, foto)
        VALUES ('$nome', '$preco', '$quantidade', '$loja', '$foto')";

$resultado = mysqli_query($conexao, $sql);

    if ($conn -> query ($sql)=== True ){
        echo " <p style = 'color:green ;' >Produto cadastrado com sucesso !</p>" ;

    } else {
        echo "<p style = 'color:red ;'> Erro: ".$conn->error."</p>" ; 
        }
        $conn -> close();

}
?>


<!Doctype  html>
<html>
 
 <head>
<title> Gooall </title>
 
<metta charser = "UTF-8"/>
</head>

<body>

    <h1> Cadastro Das Roupas </h1>
    <form method="POST">
        <label>Nome:</label><br>
        <input type="text" name="nome" required><br><br>

        <label>Roupa</label><br>
        <input type="number" step="0.01" name="preco" required><br><br>

        <label>Cor</label><br>
        <input type="number" name="quantidade_estoque" required><br><br>

        <label>Estação</label><br>
        <input type="text" name="loja" required><br><br>
         
        <label>Ocasiao</label><br>
        <input type="text" name="loja" required><br><br>

         <label>Horario</label><br>
        <input type="text" name="loja" required><br><br>

        <label>Foto (nome do arquivo):</label><br>
        <input type="text" name="foto" required><br><br>

        <button type="submit">Cadastrar</button>
    </form>
