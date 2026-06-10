# Conversão de CSV para JSON

> Script desenvolvido para converter um arquivo CSV em JSON, seguindo um schema específico.

---

## Como executar 

### Pré-requisitos

 - Node.js

### Rodando o script

 - **[ IMPORTANTE ]:** O arquivo **CSV** deve se chamar **products.csv** e estar localizado na pasta raiz

 ```sh
 # Clone o repositorio
 git clone [link_do_repositorio]

# Instale as dependências
npm install

# Execute o script
npm run dev

# Caso o script de init não funcione, use este
node main.js
 ```


---

## Premissas

> Primeira coisa que fiz é procurar alguma biblioteca para me auxiliar na conversão, acabei encontrando o **Papaparse**, e escolhi ele pois consigo considerar a primeira linha como o **header**, auxiliando na busca das colunas. O maior problema foi montar a lógica para o JSON, já que não sou muito familiarizado com tratamento de dados, a lógica mais demorada foi criar os objetos dentro da chave **products**, expecificamente as chaves inventory e behavior, já que eu tinha que normalizar os dados dos **booleans**. Tive que pesquisar mais sobre a função `Replace()` para normalizar os **preços** dos produtos. A parte mais tránquila foi a chave **erros**, já que era apenas adicionar os erros em um array, unico problema(que não sei se é mesmo), foi que mesmo usando o 
`trim()` para limpar os espaços em branco, o **NCM** que tinha 7 digitos passavam no teste, percebi que quando baixei o **.CSV**, ele considerou o primeiro campo vazio como **zero**, não sei se isso foi proposital. O que faltou de fazer foi alguns tratamentos na coluna de **observações predefinidas**. Demorei por volta de **3Hrs e 20Min**.
