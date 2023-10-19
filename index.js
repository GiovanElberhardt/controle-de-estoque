const mysql = require('mysql2')
const express = require('express');
const bodyParser = require('body-parser');

const app = express()

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(express.urlencoded({extended: false}))
app.use(express.static('public'));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'menu'
});

connection.connect(function(err){
    if(err){
        console.error('Erro: ',err)
        return
    }
    console.log("Conexão estabelecida com sucesso!")
});
/*
connection.query("INSERT INTO opcao(descircao,quantidade,valor,peso,medida,localizacao) VALUES (?,?,?,?,?,?)", function(err, result){
    if(!err){
        console.log("Dados inseridos com sucesso")
    } else{
        console.log("Erro. Não foi possivel inserir os dados ", err)
    }
});

connection.query("SELECT * FROM opcao ", function(err, rows, result){
    if(!err){
        console.log("resultados: ", rows)
    }else {
        console.log("Erro: Não foi possivel inserir os dados ",err)
    }
})*/
app.get("/estoque", function(req, res){
    res.sendFile(__dirname + "/estoque.html")
})


app.post('/adicionar',(req, res) =>{
    const descricao = req.body.descricao;
    const quantidade = req.body.quantidade;
    const valor = req.body.valor;
    const peso = req.body.peso;
    const medida = req.body.medida;
    const localizacao= req.body.localizacao;

    const values = [descricao,quantidade,valor,peso,medida,localizacao]
    const insert = "INSERT INTO opcao(descricao,quantidade,valor,peso,medida,localizacao) VALUES (?,?,?,?,?,?)"

    connection.query(insert, values, function(err, result){
        if(!err){
            console.log("Dados inseridos com sucesso!");
            res.redirect('/listar');
        } else{
            console.log("Não foi possivel inserir os dados ", err);
            res.send("Erro!")
        }
    })
})
app.get("/listar", function(req, res){

    const selectAll = "SELECT * FROM opcao";

    connection.query(selectAll, function(err, rows){
        if(!err){
            console.log("Dados inseridos com sucesso!");
            res.send(`
            <html>
                    <head>
                        <title> cadastrar Itens </title>
                        <link rel="stylesheet" type="text/css"  href="/estilo.css" />
                    </head>
                    <body>
                    <p><a href="http://localhost:8081"> Menu</a></p>
                    <p><a href="http://localhost:8081/estoque"> Cadastrar Itens</a></p>
                        <h3>Listar Itens</h3>
                        <table>
                            <tr>
                                <th> descricao </th>
                                <th> quantidade </th>
                                <th> valor </th>
                                <th> peso </th>
                                <th> medida </th>
                                <th> localizacao </th>
                                <th> Editar </th>
                                <th> Deletar </th>
                            </tr>
                            ${rows.map(row => `
                            <tr>
                                <td>${row.descricao}</td>
                                <td>${row.quantidade}</td>
                                <td>${row.valor}</td>
                                <td>${row.peso}</td>
                                <td>${row.medida}</td>
                                <td>${row.localizacao}</td>
                                <td><a href = "/atualizar-form/${row.codigo}"> Editar</a></td>
                                <td><a href = "/deletar/${row.codigo}"> Deletar</a></td>
                            </tr>
                            `).join('')}
                        </table>
                    </body>
            </html>  
        `);
      } else{
            console.log("Erro ao listar dados!", err);
            res.send("Erro!")
    
      }
    })
})


app.get("/",function(req,res){
    res.send(`
    <html>
    <head>
        <title> Sistema para Cadastro e Listagem de Estoque </title>
        <link rel="stylesheet" type="text/css"  href="/estilo.css" />
    </head>
    <body style="background-color:6959CD">
        <h2> Sistema para Cadastro e Listagem de Estoque </h2>
        <p><a href="http://localhost:8081/estoque"> Cadastrar Itens</a></p>
        <p><a href="http://localhost:8081/listar"> Listar Itens em Estoque</a></p>
    </body>
    </html>
    `)
})
app.get("/deletar/:codigo",function(req,res){
    const codigoDaDescricao = req.params.codigo;

    const deleteDescricao = "DELETE FROM opcao WHERE codigo =?";

    connection.query(deleteDescricao, [codigoDaDescricao],function(err, result){
        if(!err){
            console.log("Informaçao deletada!");
            res.redirect('/listar');
        }else{
            console.log("Erro ao deletar informaçao: ", err);
        }
    })
});
app.get("/atualizar-form/:codigo",function(req,res){
    const codigoDaDescricao = req.params.codigo;

    const selectDescricao = "SELECT * FROM opcao WHERE codigo =?";

    connection.query(selectDescricao, [codigoDaDescricao],function(err, result){
        if(!err && result.length>0){
            const descricao = result[0];

            res.send(`
            <html>
            <head>
                <title>Atualizar cadastro</title>
            </head>
            <body>
                <h1> Atualizar cadastro</h1>
                <form action="/atualizar/${codigoDaDescricao}" method = "POST">
                    <label for="descricao">Descricao:</label>
                    <input type="text" id="descricao" name="descricao" value="${descricao.descricao}" required><br>

                    <label for="quantidade">Quantidade:</label>
                    <input type="text" id="quantidade" name="quantidade" value="${descricao.quantidade}" required><br>

                    <label for="valor">Valor:</label>
                    <input type="text" id="valor" name="valor" value="${descricao.valor}" required><br>

                    <label for="peso">Peso:</label>
                    <input type="text" id="peso" name="peso" value="${descricao.peso}" required><br>

                    <label for="medida">Medida:</label>
                    <input type="text" id="medida" name="medida" value="${descricao.medida}" required><br>

                    <label for="localizacao">Localizacao:</label>
                    <input type="text" id="localizacao" name="localizacao" value="${descricao.localizacao}" required><br>


                    <input type="submit" value="Atualizar">
            </body>
            </html>
            `);
        }else {
            console.log("erro ao obter dados do cliente",err);
        }
    });
});
app.post('/atualizar/:codigo', (req, res)=>{
    const codigo =req.params.codigo;
    const descricao =req.body.descricao;
    const quantidade =req.body.quantidade;
    const valor =req.body.valor;
    const peso =req.body.peso;
    const medida =req.body.medida;
    const localizacao =req.body.localizacao;

    const updateQuery ="UPDATE opcao SET descricao=?, quantidade=?, valor=?, peso=?, medida=?, localizacao=? WHERE codigo=?";

    connection.query(updateQuery,[descricao, quantidade, valor, peso, medida, localizacao, codigo], function(err, result){
        if(!err){
            console.log("Dados atualizados");
            res.redirect('/listar');
        }else{
            console.log("Erro ao atualizar dados ", err);
        }
    });
});
app.listen(8081, function(){
    console.log("Servidor rodando na url http://localhost:8081")
})