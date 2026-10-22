# PRODUCT.md — Dupply

## Registro

Produto. Aplicação web (SPA) atrás de login, com uma landing pública. Linguagem pt-BR; rotas e chaves técnicas em inglês.

## Plataforma

Web, desktop primeiro. Cedente e analista trabalham em notebook; investidor e admin também consultam no celular, então as telas de oferta, aporte e status precisam funcionar em 375 px.

## Para quem

- **Cedente**: empresa que vende a prazo e quer o dinheiro antes do vencimento. Envia duplicatas (NF-e), acompanha a análise, aceita ou recusa a proposta de deságio, recebe o adiantamento.
- **Analista de risco**: revisa cadastro de cedentes e duplicatas com apoio do laudo do agente de IA; define deságio; aprova ou reprova.
- **Investidor**: vê ofertas (uma duplicata aprovada = uma oferta) com taxa mensal, prazo e ticket mínimo; faz aportes; acompanha posição, rendimentos e liquidação.
- **Admin**: cria ofertas após o aceite do cedente, abre captação, avança estágios, acompanha aportes, desembolsos e transações on-chain.

## O que o produto faz

Transforma duplicatas aprovadas em ofertas de investimento. O cedente recebe em dias, não em semanas; o investidor financia um título analisado; a plataforma cobra spread dentro do deságio e registra a operação em blockchain. Captação híbrida: ao atingir o mínimo sem fechar 100%, um FIDC completa o alvo.

## Princípios de produto

1. **Clareza sobre dinheiro.** Valor, taxa, data e status sempre visíveis, nunca escondidos atrás de um clique. Números com casas decimais e algarismos tabulares.
2. **Uma ação por tela.** Cada página tem um próximo passo óbvio: "Enviar duplicata", "Aceitar proposta", "Investir". O resto é contexto.
3. **IA é apoio, não decisão.** O laudo do agente aparece ao lado dos dados, marcado como IA, e o analista decide. Nunca escondemos que foi gerado por máquina.
4. **Status sem eufemismo.** Recusado é recusado; vencido é vencido. Um vocabulário de status por entidade, com cor fixa.
5. **Calmo por padrão.** Interface majoritariamente neutra; a cor aponta onde agir ou o que mudou. Animação só quando mostra uma mudança.

## Vocabulário

duplicata (não título/recebível), cedente, sacado, investidor, oferta, aporte, antecipação (não empréstimo), deságio (não juros), laudo do agente de IA. Tabela completa no manual de marca, página 9.

## Fora de escopo hoje

Mercado secundário de cotas, pool de várias duplicatas numa oferta, KYC real com suitability CVM, wallet com passkey (feature separada), internacionalização.
