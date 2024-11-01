# Medidor de Água e Gás 

É o back-end de um serviço que gerencia a leitura individualizada de consumo de água e gás. Para facilitar a coleta da informação, o serviço utilizará IA para obter a medição através da foto de um medidor.

## Ferramentas
- Gemini API
- Typescript
- Javascript
- Docker
- Prisma (ORM)
- Express

## Endpoints
## :pushpin: POST /upload
### Responsável por receber uma imagem em base 64, consultar o Gemini e retornar a medida lida pela API. Esse endpoint:
- Valida o tipo de dados dos parâmetros enviados (inclusive o base64)
- Verificar se já existe uma leitura no mês naquele tipo de leitura.
- Integrar com uma API de LLM para extrair o valor da imagem.

### Ela irá retornar:
-  Um link temporário para a imagem
-  Um GUID
-  O valor numérico reconhecido pela LLM

![image](https://github.com/user-attachments/assets/afd39e70-638e-4424-9750-5ee238421a6a)

## :pushpin: PATCH /confirm
### Responsável por confirmar ou corrigir o valor lido pelo LLM. Esse endpoint:
- Validar o tipo de dados dos parâmetros enviados
- Verificar se o código de leitura informado existe
- Verificar se o código de leitura já foi confirmado
- Salvar no banco de dados o novo valor informado

### Ela irá retornar:
- Resposta de OK ou ERRO dependendo do valor informado.

![image](https://github.com/user-attachments/assets/abb948d2-bb26-4a41-8d06-4eb448ec49e0)

## :pushpin: GET /:customer code:/list
### Responsável por listar as medidas realizadas por um determinado cliente. Esse endpoint:
- Receber o código do cliente e filtrar as medidas realizadas por ele
- Ele opcionalmente pode receber um query parameter “measure_type”, que
deve ser “WATER” ou “GAS”

### Ela irá retornar:
- Uma lista com todas as leituras realizadas.

![image](https://github.com/user-attachments/assets/35cf07ae-1fc9-4ed4-bfa0-264307a0daa8)


# Como usar :warning:
```
git clone <urlDoProjeto>

docker compose up

docker exec -it backend npx prisma migrate dev
