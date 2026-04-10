# 🚗 AutoProd — Sistema de Produção Automotiva

Sistema web para controle de produção automotiva (bipagem de VINs) focado no **turno da manhã**.

## Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Scanner**: ZXing (câmera) + input físico (scanner USB/Bluetooth)
- **Export**: ExcelJS + jsPDF
- **PWA**: Service Worker + manifest.json

---

## 🚀 Setup Rápido

### 1. Clone e instale

```bash
git clone <seu-repo>
cd auto-producao-turno
npm install
```

### 2. Configure o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **Settings → API** e copie a URL e as chaves
3. Copie o arquivo de env:

```bash
cp .env.local.example .env.local
```

4. Preencha `.env.local` com suas chaves do Supabase

### 3. Execute as migrations

```bash
# Instale o Supabase CLI
npm install -g supabase

# Login
supabase login

# Link ao seu projeto
supabase link --project-ref <seu-project-ref>

# Push das migrations
supabase db push
```

Ou execute o SQL manualmente no **SQL Editor** do Supabase Dashboard:
- Cole o conteúdo de `supabase/migrations/001_initial_schema.sql`
- Execute `supabase/seed.sql` para dados iniciais

### 4. Crie o usuário admin

No **Supabase Dashboard → Authentication → Users**:

1. Clique em **Add user**
2. Email: `000001@autoprod.internal`
3. Password: `Admin@2024` (ou sua senha preferida)
4. Copie o UUID gerado
5. No SQL Editor, execute:

```sql
insert into public.users (id, matricula, nome, tipo)
values (
  'UUID_COPIADO_AQUI',
  '000001',
  'Maria Andrade',
  'admin'
);
```

### 5. Rode o projeto

```bash
npm run dev
```

Acesse: `http://localhost:3000`

Login: `000001` / `Admin@2024`

---

## 📱 Funcionalidades

| Página | Descrição |
|--------|-----------|
| **Dashboard** | Visão geral em tempo real: total bipado, meta, ranking, último VIN |
| **Registrar Montagem** | Selecionar funcionário → versão → bipar VIN (câmera ou scanner) |
| **Ranking do Turno** | Classificação dos funcionários por produção do dia |
| **Histórico** | Filtros por VIN, funcionário, data + exportação Excel/PDF |
| **Funcionários** | CRUD completo com ativar/desativar |
| **Configurações** | Meta do turno, horários, hora extra |

---

## 🔄 Realtime

O sistema usa **Supabase Realtime** para atualização automática sem reload:

- Novo VIN registrado → dashboard atualiza instantaneamente
- Ranking muda em tempo real
- Todos os dashboards abertos refletem o mesmo estado

---

## 📡 Scanner Físico

Scanners USB/Bluetooth funcionam automaticamente — eles emulam teclado.
Na página **Registrar Montagem**, o input de VIN fica em foco automaticamente,
então o scanner lê e envia `Enter` para registrar.

---

## 📷 Scanner por Câmera

Usa a biblioteca **ZXing** para ler códigos de barras via câmera do celular.
Clique no botão **📷 Câmera** na página de Registrar Montagem.

---

## 🏭 PWA (Uso no Chão de Fábrica)

O sistema funciona como PWA em celulares Android/iOS:

1. Abra no Chrome/Safari do celular
2. "Adicionar à tela inicial"
3. Funciona offline para consultas básicas

---

## 🔄 Reset Diário Automático

O dashboard filtra produções do **dia atual** automaticamente.
O "reset" é conceptual — o histórico é preservado integralmente.

Para implementar o reset via Edge Function:

```bash
supabase functions new daily-reset
# Copie o código de utils/cron-reset.ts → EDGE_FUNCTION_CODE
supabase functions deploy daily-reset
```

Configure o cron no Dashboard: **Edge Functions → daily-reset → Schedule**
Expressão: `0 23 * * *` (todo dia às 23h)

---

## 📊 Exportação

- **Excel (.xlsx)**: via ExcelJS, com formatação industrial
- **PDF**: via jsPDF + autoTable, com layout profissional

---

## 🗄️ Estrutura do Banco

```
users           — Usuários do sistema (auth)
employees       — Funcionários do chão de fábrica
productions     — Cada VIN registrado (histórico completo)
settings        — Configurações do turno (1 linha)
daily_resets    — Log dos resets automáticos
```

---

## 🚀 Deploy (Vercel)

```bash
npm run build
vercel --prod
```

Configure as variáveis de ambiente na Vercel Dashboard.

---

## 📄 Licença

Uso interno. Todos os direitos reservados.
