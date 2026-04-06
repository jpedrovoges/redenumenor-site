# Numenor React Ecommerce

Projeto com frontend Next.js e backend Django REST.

## Estrutura

```text
numenor-react/
├── backend/
└── frontend/
```

## Rodando localmente

### Backend

1. Entre em `backend/`.
2. Instale as dependências:

```bash
pip install -r requirements.txt
```

3. Crie o arquivo `.env` com base em `.env.example`. O backend agora lê esse arquivo automaticamente.
4. Rode as migrations:

```bash
python manage.py migrate
```

5. Inicie o servidor:

```bash
python manage.py runserver
```

API local: `http://127.0.0.1:8000`

### Frontend

1. Entre em `frontend/`.
2. Instale as dependências:

```bash
npm install
```

3. Crie o arquivo `.env.local` com base em `.env.example`.
4. Inicie o frontend:

```bash
npm run dev
```

App local: `http://localhost:3000`

## Git e repositório

Use a raiz do projeto como único repositório Git.

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

## Deploy recomendado

### Frontend

- Suba apenas a pasta `frontend/` no Vercel usando `Root Directory = frontend`.
- Configure a variável `NEXT_PUBLIC_API_URL` com a URL pública do backend.

### Backend

- Hospede `backend/` em Render, Railway ou Fly.io.
- Use `DATABASE_URL` apontando para o PostgreSQL do Supabase.
- Defina também:
  - `SECRET_KEY`
  - `DEBUG=False`
  - `ALLOWED_HOSTS`
  - `CORS_ALLOWED_ORIGINS`
  - `CSRF_TRUSTED_ORIGINS`

Comandos de deploy do backend:

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
```

### Supabase

- Crie um projeto PostgreSQL no Supabase.
- Copie a connection string.
- Preencha `DATABASE_URL` no backend com algo no formato:

```text
postgresql://postgres:SENHA@HOST:6543/postgres
```

## Observação importante

As imagens dos produtos ainda usam armazenamento local em `backend/media/`. Isso funciona localmente, mas em produção o ideal é migrar depois para um storage persistente, como Supabase Storage, Cloudinary ou S3.