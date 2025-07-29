# FotoFácil

FotoFácil é uma plataforma moderna e inteligente projetada para otimizar o fluxo de trabalho de fotógrafos profissionais. A aplicação permite organizar, compartilhar e gerenciar a seleção de fotos com clientes de forma segura, elegante e eficiente.

## ✨ Principais Funcionalidades

- **Gerenciamento de Álbuns**: Crie álbuns personalizados com capas, datas de validade e proteção por senha.
- **Seleção de Fotos pelo Cliente**: Interface intuitiva para que os clientes visualizem e selecionem suas fotos favoritas.
- **Segurança com Supabase**: Autenticação e políticas de acesso (Row-Level Security) para garantir que cada fotógrafo e cliente acesse apenas os dados permitidos.
- **Marcação por Inteligência Artificial**: Utilize o Genkit do Google para gerar tags automáticas para as imagens no momento do upload, facilitando a busca e organização.
- **Personalização de Temas**: O painel do fotógrafo inclui temas (claro, escuro, azul) para personalizar a experiência visual.

## 🚀 Tecnologia Utilizada

- **Framework**: [Next.js](https://nextjs.org/) (com App Router)
- **Linguagem**: TypeScript
- **Backend e Banco de Dados**: [Supabase](https://supabase.io/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI**: [ShadCN/UI](https://ui.shadcn.com/)
- **Inteligência Artificial**: [Genkit (Google AI)](https://firebase.google.com/docs/genkit)
- **Formulários**: React Hook Form com Zod para validação.

##  architecture-note Arquitetura de Autenticação

Para garantir a integridade dos dados, o sistema utiliza um **gatilho (trigger) no Supabase** que cria automaticamente um registro em uma tabela de perfis (`profiles`) sempre que um novo usuário é adicionado à tabela de autenticação (`auth.users`).

**Ponto Crítico de Implementação:**

O cadastro de novos usuários, tanto para **Fotógrafos** quanto para **Clientes**, foi unificado em uma única Server Action (`src/app/auth/actions.ts`). Isso foi feito para resolver um erro recorrente de "database error". O erro ocorria porque a ação de cadastro do cliente não fornecia todos os metadados exigidos pelo gatilho do banco de dados (como `username` e `companyName`).

A solução implementada foi:
1.  **Ação de Cadastro Unificada**: Ambas as rotas de cadastro (`/register/photographer` e `/register/client`) agora utilizam a mesma função `signup`.
2.  **Validação com Zod**: Um único schema de validação (`signupSchema`) garante que todos os campos necessários sejam fornecidos.
3.  **Dados Padrão para Clientes**: No formulário de cadastro de cliente (`src/components/auth/client-register-form.tsx`), os campos que não são relevantes para o cliente (como `username` e `companyName`) são preenchidos com valores padrão e enviados de forma oculta para o backend.

Essa abordagem garante que o gatilho do banco de dados sempre receba os dados esperados, evitando falhas na criação do usuário e garantindo consistência no sistema.

## ⚙️ Primeiros Passos

Para rodar este projeto localmente, siga estes passos:

1.  **Clone o repositório:**
    ```bash
    git clone [URL_DO_REPOSITORIO]
    cd fotofacil
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    - Crie um arquivo `.env.local` na raiz do projeto.
    - Adicione suas chaves do Supabase, que você pode encontrar no painel do seu projeto Supabase:
      ```
      NEXT_PUBLIC_SUPABASE_URL=SUA_URL_SUPABASE
      NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_SUPABASE
      ```

4.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver a aplicação.
