
# FotoFácil: Plataforma Inteligente para Fotógrafos

FotoFácil é uma plataforma moderna e completa, projetada para otimizar e profissionalizar o fluxo de trabalho de fotógrafos. A aplicação permite organizar álbuns, gerenciar clientes, automatizar tarefas com IA e, futuramente, gerenciar assinaturas e faturamento de forma integrada.

## ✨ Principais Funcionalidades

### Para FotógrafosNanetail2504*Z
- **Gestão de Clientes**: Cadastro e gerenciamento de clientes diretamente do painel.
- **Gerenciamento de Álbuns**: Crie álbuns personalizados, vincule-os a clientes específicos, defina limites de seleção, preços por foto extra e datas de validade.
- **Upload Inteligente**: Faça upload de múltiplas fotos com pré-visualização.
- **Marcação por IA (Genkit)**: Tags automáticas são geradas no momento do upload, facilitando a busca e organização das imagens.
- **Painel de Controle (Admin)**: Uma visão de administrador para gerenciar usuários e atribuir assinaturas.
- **Personalização**: Temas visuais (claro, escuro, azul) para personalizar a experiência do painel.

### Para Clientes
- **Cadastro Seguro**: Clientes se cadastram e confirmam suas contas via e-mail.
- **Galeria Privada**: Acesso aos álbuns compartilhados pelo fotógrafo.
- **Seleção de Fotos Intuitiva**: Interface moderna para visualizar e selecionar as fotos favoritas para edição.
- **Download de Álbuns Finais**: Acesso a uma área para baixar as fotos editadas e finalizadas.
- **Notificações**: Alertas sobre novos álbuns, status de seleção e álbuns prontos para download.

### Funcionalidades Planejadas
- **Sistema de Assinaturas**: Planos de assinatura para fotógrafos e clientes com diferentes níveis de acesso e recursos.
- **Faturamento e Notas Fiscais**: Geração de faturas para assinaturas e compras avulsas (fotos extras), com emissão de notas fiscais.

## 🚀 Tecnologia Utilizada

- **Framework**: [Next.js](https://nextjs.org/) (com App Router e Server Actions)
- **Linguagem**: TypeScript
- **Backend e Banco de Dados**: [Supabase](https://supabase.io/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI**: [ShadCN/UI](https://ui.shadcn.com/)
- **Inteligência Artificial**: [Genkit (Google AI)](https://firebase.google.com/docs/genkit)
- **Formulários**: React Hook Form com Zod para validação.

## 🏛️ Arquitetura do Banco de Dados

A arquitetura foi projetada para ser escalável e segura, com entidades bem definidas.

- **`auth.users`**: Tabela central de autenticação do Supabase. Contém as credenciais de login de todos os usuários.
- **`photographers` e `clients`**: Tabelas de perfis separadas. Contêm informações específicas de cada tipo de usuário. Esta abordagem substituiu a tabela `profiles` unificada para maior clareza e separação de responsabilidades.
- **`subscriptions`**: Define os diferentes planos que podem ser oferecidos (ex: "Essencial Mensal", "Estúdio Anual").
- **`photographer_subscriptions` e `client_subscriptions`**: Tabelas de junção que vinculam os usuários aos seus respectivos planos de assinatura.
- **`albums`, `photos`, `album_selections`**: O núcleo do fluxo de trabalho. Um fotógrafo cria um `album` para um cliente, faz o upload das `photos`, e o cliente registra suas escolhas em `album_selections`.
- **`notifications`, `album_downloads`, `invoices`**: Tabelas que suportam o fluxo completo, desde a comunicação com o usuário até a entrega final e o faturamento.

### Gatilho de Criação de Perfil (Trigger)

Para garantir a consistência dos dados, um **gatilho (trigger)** no Supabase (`on_auth_user_created`) é acionado sempre que um novo usuário é criado na tabela `auth.users`. Este gatilho lê os metadados (`raw_user_meta_data`) fornecidos durante o cadastro, identifica a `role` ('photographer' ou 'client') e insere os dados na tabela de perfil correspondente (`public.photographers` ou `public.clients`). Isso automatiza a criação de perfis e mantém a autenticação e os dados do perfil sincronizados.

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

3.  **Configure o Banco de Dados:**
    - Acesse o painel do seu projeto Supabase.
    - Vá para o **SQL Editor**.
    - Copie e execute o script SQL mais recente fornecido para limpar e recriar toda a estrutura de tabelas, funções e políticas de segurança.

4.  **Configure as variáveis de ambiente:**
    - Crie um arquivo `.env.local` na raiz do projeto.
    - Adicione suas chaves do Supabase:
      ```
      NEXT_PUBLIC_SUPABASE_URL=SUA_URL_SUPABASE
      NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_SUPABASE
      SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE_SERVICE_ROLE_SUPABASE
      ```

5.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

Abra [http://localhost:9002](http://localhost:9002) no seu navegador para ver a aplicação.
