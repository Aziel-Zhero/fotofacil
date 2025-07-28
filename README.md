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
