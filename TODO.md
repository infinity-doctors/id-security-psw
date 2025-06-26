[X] Correção do  método de leitura de segredos
[X] Corrigir bug "Segredo não encontrado ou já foi visualizado" mesmo que o segredo ainda não tenha sido visualizado nenhuma vez
[X] Implementação de Dark Mode
[X] Avaliar possibilidade de FAQ
[X] Corrigir importação de arquivos (alerta quando './Header' mas correto quando './Header.ts')
[X] Melhorias no dark/light mode
[X] Adicionar ícone da Infinity (./frontend/src/styles/icon.png)
[X] Corrigir light/dark mode do Footer (criado somente dark mode até então)
[X] Melhorias no select em dark mode (atualmente branco)
[X] Corrigir método de senha adicional (impossível digitar no input)
[X] Corrigir label "Senha Adicional (Opcional)" e "Tempo de Expiração", pois estão muito escuros no dark mode (quase ilegível)
[X] Revisar e corrigir Docker
[X] Revisar e adicionar dependências no arquivo `README.md` a fim de documentar as necessidades do backend e do frontend
[X] Testes agressivos de segredos com senha: (http://localhost:3000/secret/1f2qrqq5o62rdabkvd5bp6uv2xoaywm / 123senha)
[X] Testar agressivos de segredo de 1h s/ senha: http://localhost:3000/secret/2zitzkmhlvsrgs14qb34fr2312s66mh
[X] Testar 5 min (12h26 > 12h31 - http://localhost:3000/secret/1co6ivrfrnpr1s9mz3yqnmokhun2kys)
[X] Atualizar favicon baseado no ícone do header 
[X] Casos expirados estão exigindo senha
[X] Correção de "Unknown secret" quando segredo tiver senha
[X] Tela de "Link Seguro Criado!" não possui dark mode
[X] NOVO TESTE (5 MIN/ 15:19): http://localhost:3005/secret/66r2tarmadyle2sz1dlawh8sosxecew
[X] Tela de "Segredo Revelado" não possui dark mode
[X] Segredo c/ senha expirada está retornando "Senha inválida" -> Deve retornar Senha inválida, segredo expirado ou já visualizado.
[X] Segredo s/ senha expirada -> Deve retornar "Segredo expirado ou já visualizado"
[X] NOVO TESTE (5 MIN/ 15:38): http://localhost:3005/secret/5atmbosvtvntjk1hwzq23mpwdsq3qlx
[ ] NOVOS TESTES (5 MIN/ 16:05):
COM SENHA: http://localhost:3005/secret/421kgpgfsqp1ur6ii5py9qkzcoeqd26
SEM SENHA: http://localhost:3005/secret/3dp0jqedhyfp0n81iao3hwizdmk7io6
COM SENHA2: http://localhost:3005/secret/1rnf64csu9z56gnnye031qvavglzvv6