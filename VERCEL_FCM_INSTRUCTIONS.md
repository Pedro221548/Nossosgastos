# Instruções para Notificações Push (Cloud Messaging) no Vercel

O aplicativo agora tem toda a base de código necessária para que ambos os parceiros recebam notificações push em pano de fundo (background), via Firebase Cloud Messaging (FCM). 

Como a funcionalidade de disparar notificações na Web com FCM exige privilégios de administrador, e você está hospedando o frontend no Vercel, criamos uma Serverless Function (`/api/send_notification.ts`) na estrutura.

Para o Vercel conseguir enviar as mensagens com sucesso, siga este passo a passo:

## 1. Obter a Chave do Service Account no Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/).
2. Abra o seu projeto (`nossos-gastos-f495d`).
3. Vá em **Configurações do Projeto** (ícone de engrenagem) > **Contas de Serviço** (Service Accounts).
4. Clique no botão **"Gerar nova chave privada"**.
5. Um arquivo `.json` será baixado no seu computador. Dê um nome simples a ele localmente.

## 2. Configurar o Ambiente no Vercel

1. Vá para o [Painel do Vercel (Vercel Dashboard)](https://vercel.com/dashboard) e clique no seu projeto.
2. Acesse a aba **Settings** (Configurações) e depois **Environment Variables** (Variáveis de Ambiente).
3. Crie uma nova variável de ambiente com as seguintes informações:
   * **Key**: `FIREBASE_SERVICE_ACCOUNT`
   * **Value**: Abra o arquivo `.json` que você baixou no passo anterior com um bloco de notas/editor de texto, copie **todo o conteúdo dele** e cole aqui.
4. Salve clicando em **Add** / **Save**.
5. Para garantir que as funções serverless rodem com as variáveis de ambiente recém-adicionadas, **re-faça o deploy** no Vercel (aba Deployments > ⋮ botão vertical > Redeploy).

## 3. Como estão configuradas as notificações?

- Quando o usuário entra no app, pedimos permissão e instalamos um `Service Worker` (`public/firebase-messaging-sw.js`).
- O "Device Owner" (Parceiro A ou Parceiro B) registra o token dele automaticamente no banco de dados, em `users/{UID}/pushTokens/A` ou `B`.
- Temos uma nova função pronta `/services/firebase.ts` chamada `sendNotificationToPartner(partnerOwner, title, body)`, que, mediante qualquer gatilho na sua UI, fará um POST interno no `/api/send_notification.ts`.
- O Vercel receberá esse POST, efetuará o login como Administrador pelo Service Account e disparará o push notification, que será recebido via Service Worker (se o App estiver fechado).

Você agora pode importar livremente a `sendNotificationToPartner` em itens críticos (como ao adicionar transações altas, completar objetivos) e ela cuidará do aviso no celular do seu parceiro!
