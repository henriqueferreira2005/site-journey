# MyJourney — arquitetura em três camadas

Projeto separado em **Frontend**, **Backend** e **Banco de dados**.

## Estrutura

```text
myjourney_3_camadas/
├── frontend/
│   ├── index.html
│   └── assets/
│       ├── styles.css
│       ├── theme.js
│       └── app.js
└── backend/
    ├── .env.example
    ├── package.json
    └── src/
        ├── server.js
        ├── database/connection.js
        ├── middleware/auth.js
        ├── services/authService.js
        └── routes/
            ├── authRoutes.js
            ├── diaryRoutes.js
            ├── reminderRoutes.js
            └── gadRoutes.js
```

## 1. Frontend

O HTML, CSS e JavaScript originais foram separados em arquivos próprios. A interface e os fluxos existentes do MyJourney foram preservados.

**Importante sobre a integração:** o código original foi construído como aplicação client-side e utiliza armazenamento local do navegador para parte dos dados. Por isso, a separação dos arquivos do frontend preserva o comportamento atual, mas não migra automaticamente os dados locais para a API. Os endpoints do backend estão implementados e prontos para integração; para que a interface passe a usar a API, as funções de persistência/autenticação do `assets/app.js` precisam ser migradas para chamadas `fetch` e o token deve ser enviado como `Authorization: Bearer <token>`. Não é seguro fingir que essa migração ocorreu sem alterar e testar os fluxos assíncronos da aplicação.

Para visualizar a interface, sirva a pasta `frontend` por um servidor estático (por exemplo, VS Code Live Server).

## 2. Backend

API REST em Node.js + Express, com:
- cadastro, login e consulta do usuário autenticado;
- autenticação JWT e hash de senha com bcrypt;
- CRUD do diário emocional;
- CRUD de lembretes;
- registro e consulta de resultados GAD-7;
- validação de entradas, CORS, Helmet e limitação de tentativas de autenticação.

### Instalação

Requisitos: Node.js 18 ou superior.

```bash
cd backend
npm install
```

Copie `.env.example` para `.env` e altere `JWT_SECRET` para uma chave longa e aleatória.

```bash
npm run dev
```

A API ficará em `http://localhost:3000`.

Teste:

```bash
curl http://localhost:3000/api/health
```

## 3. Banco de dados

O SQLite é inicializado automaticamente na primeira execução. O arquivo será criado em `backend/data/myjourney.sqlite`. As tabelas são:
- `users`
- `diary_entries`
- `reminders`
- `gad7_results`

As tabelas de dados pessoais possuem `user_id` e as consultas verificam o usuário autenticado para impedir acesso aos dados de outra conta.

## Endpoints principais

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/register` | Criar conta |
| POST | `/api/auth/login` | Entrar e receber JWT |
| GET | `/api/auth/me` | Consultar perfil |
| GET/POST | `/api/diary` | Listar/criar registros |
| PUT/DELETE | `/api/diary/:id` | Atualizar/excluir registro |
| GET/POST | `/api/reminders` | Listar/criar lembretes |
| PATCH/DELETE | `/api/reminders/:id` | Atualizar/excluir lembrete |
| GET/POST | `/api/gad7` | Consultar/salvar resultados |

### Exemplo de cadastro

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Maria",
  "email": "maria@example.com",
  "password": "SenhaForte123!"
}
```

### Exemplo de rota protegida

```http
GET /api/diary
Authorization: Bearer SEU_TOKEN_JWT
```

## Observações importantes antes de produção

- Configure HTTPS, `JWT_SECRET` seguro e `FRONTEND_ORIGIN` com o domínio real.
- Não armazene token de autenticação em `localStorage` em aplicações com risco de XSS; prefira cookie `HttpOnly`, `Secure` e `SameSite` após configurar o fluxo CSRF/CORS.
- Implemente recuperação de senha por e-mail antes de habilitar esse recurso em produção.
- O GAD-7 é uma ferramenta de rastreio, não diagnóstico. O aplicativo não substitui atendimento psicológico ou médico.
- Faça testes de integração e migração dos dados já existentes no navegador antes de trocar o armazenamento local pela API.
