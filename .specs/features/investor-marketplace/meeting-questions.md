# Investor Marketplace — Dúvidas para reunião

Arquivo vivo. Sempre que surgir uma dúvida de produto / jurídico / operação que não dá pra fechar só no mock, adicionar um bullet aqui.

**Última atualização:** 2026-07-26

---

## Abertas

- **Disclosure no card da oportunidade:** no MVP mock vamos mostrar só **nível de risco** (sem nome do sacado nem do cedente). Vale validar na reunião se, em produção, o investidor deveria ver identidade do sacado, do cedente, ambos, ou só atributos agregados (setor, porte, score). Impacto em privacidade, vazamento comercial e apetite do investidor.
- **Modelo híbrido com FIDC no gap:** confirmação jurídica/operacional de a Dupply poder complementar o que faltar na captação via FIDC próprio ou parceiro — e se isso muda o enquadramento da plataforma (marketplace vs distribuição de valor mobiliário / CVM).
- **Spread da plataforma:** default mock ~1% do face (dentro do deságio do analista). Validar faixa comercial com o time (success fee vs % do deságio).
- **Mínimo de captação + desembolso parcial:** regra de negócio (abaixo do mínimo = estorno total; ≥ mínimo = desembolsa captado + FIDC no gap) está ok comercialmente para o cedente, ou o cedente precisa aceitar explicitamente funding parcial?
- **Quem estrutura a oferta no médio prazo:** admin no MVP; faz sentido criar role `ops` / estruturador depois?

---

## Resolvidas (referência)

- Card MVP: **sem nome do sacado** — só risco (decisão produto 2026-07-26; ainda listada acima para validação em reunião de produção).
