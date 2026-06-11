# Sistema de Autenticação - Viação São Cristóvão

## Estrutura

```
viação_são_cristovão/
├── login.html              (Página de login)
├── recover.html            (Página para solicitar código)
├── reset.html              (Página para resetar senha)
├── viacao-sao-cristovao.png (Logo)
├── imagens/                (Fotos de fundo)
└── server/
    ├── server.js           (Servidor Node.js)
    ├── package.json        (Dependências)
    ├── users.json          (Banco de usuários)
    └── README.md           (Este arquivo)
```

## Instalação

### 1. Instale Node.js
Baixe em: https://nodejs.org/ (versão LTS recomendada)

### 2. Navegue até a pasta do servidor
```bash
cd c:\Users\bruno\Documents\login\viação_são_cristovão\server
```

### 3. Instale as dependências
```bash
npm install
```

## Como Usar

### 1. Inicie o servidor
```bash
npm start
```

Você verá:
```
Servidor rodando em http://localhost:3000
Endpoint de login: POST http://localhost:3000/api/login
Endpoint de recuperação: POST http://localhost:3000/api/recover
Endpoint de reset: POST http://localhost:3000/api/reset
```

### 2. Abra o `login.html` no navegador
Clique em `login.html` para abrir no navegador.

### 3. Teste com as credenciais padrão

| Email | Senha | Nome |
|-------|-------|------|
| `admin@viacao.com` | `123456` | Administrador |
| `motorista@viacao.com` | `senha123` | Motorista Teste |
| `user@example.com` | `123456` | Usuário Teste |

## Fluxo de Autenticação

### 1. Login
- Insira email e senha
- Clique em "LOGIN"
- Se correto, você está autenticado
- Marque "Lembrar-me" para salvar o email

### 2. Recuperação de Senha
- Clique em "Esqueceu sua senha?"
- Insira seu email cadastrado
- Clique em "Enviar Código"
- **No modo demo**: O código aparece na mensagem de sucesso (ex: "Código enviado para user@example.com. (Demo: 123456)")
- Será redirecionado para página de reset

### 3. Reset de Senha
- Insira o código de 6 dígitos recebido
- Insira sua nova senha (mínimo 6 caracteres)
- Clique em "Resetar Senha"
- Se correto, sua senha é atualizada e redireciona para login

## API Endpoints

### POST /api/login
```json
Request:
{
  "email": "admin@viacao.com",
  "password": "123456"
}

Response (sucesso):
{
  "success": true,
  "message": "Login bem-sucedido!",
  "user": {
    "id": 1,
    "email": "admin@viacao.com",
    "name": "Administrador"
  }
}
```

### POST /api/recover
```json
Request:
{
  "email": "admin@viacao.com"
}

Response (sucesso):
{
  "success": true,
  "message": "Código enviado para admin@viacao.com. (Demo: 123456)"
}
```

### POST /api/reset
```json
Request:
{
  "code": "123456",
  "newPassword": "novaSenha123"
}

Response (sucesso):
{
  "success": true,
  "message": "Senha resetada com sucesso!"
}
```

## Características Frontend

✅ Design Glassmorphism (blur, transparência, gradientes)  
✅ Password Toggle (mostrar/ocultar senha)  
✅ Validação em Tempo Real (email com regex)  
✅ Remember Me (localStorage)  
✅ Loading Spinner (animação no botão)  
✅ Mensagens de Erro/Sucesso  
✅ Responsivo (mobile, tablet, desktop)  
✅ Slideshow de Fotos da Frota  

## ⚠️ AVISO: Não use em Produção!

Este sistema é **apenas para demonstração**. Para produção:

1. **Criptografar senhas** com bcrypt
2. **Usar banco de dados real** (MongoDB, PostgreSQL, MySQL)
3. **Implementar HTTPS** obrigatoriamente
4. **Adicionar rate limiting** contra força bruta
5. **Usar JWT** para autenticação de sessão
6. **Enviar emails reais** com nodemailer
7. **Implementar verificação de email**
8. **Adicionar logs de auditoria**

## Troubleshooting

### ❌ "Connection refused"
- Verifique se o servidor está rodando: `node server.js`
- Porta 3000 está disponível?

### ❌ Erro CORS
- CORS está configurado para localhost
- Edite `cors()` em server.js para adicionar novos domínios

### ❌ Código não funciona
- Copiar exatamente (sensível a maiúsculas/minúsculas)
- Código expira em 15 minutos

### ❌ Senha não atualiza
- Verifique permissões de arquivo em users.json
- Verifique console para erros

---

**Versão**: 1.0  
**Status**: Desenvolvimento  
**Para**: Viação São Cristóvão
| `user@example.com` | `123456` | Usuário Teste |

## Adicionar novos usuários

Edite o arquivo `server/users.json` e adicione um novo usuário:

```json
{
  "id": 4,
  "email": "novo@viacao.com",
  "password": "senha123",
  "name": "Novo Usuário"
}
```

Salve e reinicie o servidor.

## Troubleshooting

**Erro: "Erro de conexão: servidor não está respondendo"**
- Certifique-se de que o servidor está rodando em outra janela/terminal
- Verifique se a porta 3000 não está bloqueada

**Erro: "npm: command not found"**
- Node.js não está instalado ou não está no PATH
- Reinicie o terminal/PowerShell após instalar Node.js

## Próximos passos

- Conectar a um banco de dados real (SQLite, MySQL, PostgreSQL)
- Adicionar hash de senha (bcrypt)
- Implementar JWT para sessões
- Adicionar validação de campos mais robusta
