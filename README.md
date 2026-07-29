# StudyVest

Aplicação completa para organizar a preparação para FUVEST e ENEM. O StudyVest
transforma matérias, revisões, questões, erros, redações e agenda em uma trilha
diária de estudo.

## Status

Projeto finalizado e integrado:

- autenticação com JWT e isolamento de dados por usuário;
- matérias e conteúdos com prioridade, dificuldade e progresso;
- sessões de estudo e acompanhamento da meta diária;
- repetição espaçada automática em D+1, D+7 e D+30;
- banco de questões com estatísticas por conteúdo;
- caderno de erros e identificação de padrões recorrentes;
- acompanhamento de redações pelas cinco competências do ENEM;
- agenda semanal com sugestões automáticas;
- painel responsivo com indicadores e gráficos;
- mentor por IA compatível com provedores Chat Completions;
- execução local, demonstração sem banco e imagens Docker.

## Stack

- Frontend: React 19, TypeScript, Vite e CSS responsivo.
- Backend: Node.js, Express 5, TypeScript e Zod.
- Banco: PostgreSQL.
- ORM: Prisma.
- Autenticação: JWT e bcrypt.

## Início rápido com Docker

Requisitos: Docker Desktop ativo.

```bash
docker compose up --build
```

Depois, abra:

- aplicação: `http://localhost:5173`
- API: `http://localhost:3333/api`
- health check: `http://localhost:3333/api/health`

O ambiente Docker aplica a migration e cria a conta de demonstração:

```text
E-mail: teste@studyvest.app
Senha:  senha123
```

Antes de publicar, substitua `JWT_SECRET` no `docker-compose.yml` e use
credenciais próprias para o PostgreSQL.

## Execução local

Requisitos: Node.js 22+ e PostgreSQL 16+.

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie `backend/.env.example` para `backend/.env` e ajuste `DATABASE_URL` e
   `JWT_SECRET`.

3. Prepare o banco:

   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

4. Inicie frontend e backend:

   ```bash
   npm run dev
   ```

O frontend roda em `http://localhost:5173` e encaminha `/api` para a porta
`3333`.

## Prévia visual sem PostgreSQL

Para explorar as telas com dados fictícios, sem instalar ou alterar banco:

```bash
npm run demo
```

Use a opção “Explorar conta de demonstração”. Essa API de prévia fica apenas em
memória; alterações não são persistidas. O fluxo normal usa o backend Prisma.

## Configuração da IA

O mentor é opcional. Ele aceita qualquer provedor compatível com o formato Chat
Completions:

```env
AI_PROVIDER_API_KEY="sua-chave"
AI_PROVIDER_BASE_URL="https://api.openai.com/v1"
AI_MODEL="gpt-4.1-mini"
```

Sem uma chave, o restante da aplicação continua funcionando e a tela do mentor
mostra uma orientação de configuração. A chave permanece somente no backend.

## Estrutura

```text
projeto_studyVest/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       └── validations/
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── lib/
│       └── pages/
├── tools/
│   └── demo-api.mjs
├── docker-compose.yml
└── package.json
```

## Módulos e rotas principais

| Módulo | Rotas |
|---|---|
| Autenticação | `/api/auth/register`, `/api/auth/login`, `/api/auth/me` |
| Matérias | `/api/subjects` |
| Conteúdos | `/api/topics`, `/api/topics/:id/complete` |
| Sessões | `/api/study-sessions` |
| Revisões | `/api/reviews`, `/api/reviews/today` |
| Questões | `/api/questions`, `/api/questions/statistics` |
| Erros | `/api/mistakes`, `/api/mistakes/recurring` |
| Redações | `/api/essays`, `/api/essays/evolution` |
| Agenda | `/api/schedules`, `/api/schedules/suggestions` |
| Painel | `/api/dashboard`, `/api/dashboard/charts` |
| Mentor IA | `/api/ai/*` |

Todas as rotas de dados exigem `Authorization: Bearer <token>` e filtram pelo
usuário autenticado.

## Repetição espaçada

Ao mover um conteúdo para “Revisando”, a API cria revisões para 1, 7 e 30 dias.
Uma revisão com desempenho abaixo de 60% agenda um reforço para três dias
depois. Ao registrar uma questão errada, a próxima revisão daquele conteúdo é
antecipada para até dois dias.

## Validação

```bash
npm run check
npm run build
docker compose config --quiet
```

O primeiro comando verifica os tipos do frontend e backend. O segundo gera o
Prisma Client e cria os builds de produção.

## Publicação

Os diretórios `backend` e `frontend` possuem Dockerfiles independentes. Em
produção:

1. use um PostgreSQL gerenciado;
2. execute `npx prisma migrate deploy` antes de iniciar a API;
3. configure `FRONTEND_URL` com a origem exata do frontend;
4. compile o frontend com `VITE_API_URL=https://seu-dominio-api.com/api`;
5. use um `JWT_SECRET` longo e exclusivo.

O `nginx.conf` do frontend já contém fallback para as rotas do React Router.
