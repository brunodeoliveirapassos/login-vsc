const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const HTTPS_PORT = 3443;
const https = require('https');
const http = require('http');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Carrega usuários do JSON
const usersPath = path.join(__dirname, 'users.json');
const loadUsers = () => {
  try {
    const data = fs.readFileSync(usersPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Erro ao carregar usuários:', err);
    return [];
  }
};

// Salva usuários no JSON
const saveUsers = (users) => {
  try {
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    return true;
  } catch (err) {
    console.error('Erro ao salvar usuários:', err);
    return false;
  }
};

// Armazena códigos de recuperação (em produção usar banco de dados)
const recoveryTokens = {};

// Rota de autenticação
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  // Validação básica
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email e senha são obrigatórios.'
    });
  }

  const users = loadUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    return res.status(200).json({
      success: true,
      message: 'Login bem-sucedido!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } else {
    return res.status(401).json({
      success: false,
      message: 'Email ou senha incorretos.'
    });
  }
});

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'Servidor funcionando!' });
});

// Rota de recuperação de senha
app.post('/api/recover', (req, res) => {
  const { email } = req.body;

  // Validação básica
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email é obrigatório.'
    });
  }

  const users = loadUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Email não encontrado.'
    });
  }

  // Gera código de 6 dígitos
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Armazena com expiração de 15 minutos
  const expiresAt = Date.now() + (15 * 60 * 1000);
  recoveryTokens[code] = { email, expiresAt };

  console.log(`Código de recuperação para ${email}: ${code} (Expira em 15 minutos)`);

  return res.status(200).json({
    success: true,
    message: `Código enviado para ${email}. (Demo: ${code})`
  });
});

// Rota de reset de senha
app.post('/api/reset', (req, res) => {
  const { code, newPassword } = req.body;

  // Validação básica
  if (!code || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Código e nova senha são obrigatórios.'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'A senha deve ter no mínimo 6 caracteres.'
    });
  }

  // Valida código
  const tokenData = recoveryTokens[code];
  
  if (!tokenData) {
    return res.status(400).json({
      success: false,
      message: 'Código inválido.'
    });
  }

  // Verifica expiração
  if (Date.now() > tokenData.expiresAt) {
    delete recoveryTokens[code];
    return res.status(400).json({
      success: false,
      message: 'Código expirado. Solicite um novo código.'
    });
  }

  // Atualiza senha do usuário
  const users = loadUsers();
  const user = users.find(u => u.email === tokenData.email);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuário não encontrado.'
    });
  }

  // Atualiza a senha
  user.password = newPassword;

  if (saveUsers(users)) {
    // Remove o código usado
    delete recoveryTokens[code];

    return res.status(200).json({
      success: true,
      message: 'Senha resetada com sucesso!'
    });
  } else {
    return res.status(500).json({
      success: false,
      message: 'Erro ao salvar a nova senha. Tente novamente.'
    });
  }
});

// Tenta carregar certificados em ./certs/server.key e ./certs/server.crt
let credentials = null;
try {
  const keyPath = path.join(__dirname, 'certs', 'server.key');
  const certPath = path.join(__dirname, 'certs', 'server.crt');
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    credentials = {
      key: fs.readFileSync(keyPath, 'utf8'),
      cert: fs.readFileSync(certPath, 'utf8')
    };
  }
} catch (err) {
  console.error('Erro ao ler certificados:', err);
}

// Caso não haja key+cert PEM, aceitar também um arquivo PFX (PKCS#12)
try {
  if (!credentials) {
    const pfxPath = path.join(__dirname, 'certs', 'server.pfx');
    if (fs.existsSync(pfxPath)) {
      const passphrase = process.env.PFX_PASSPHRASE || '';
      credentials = { pfx: fs.readFileSync(pfxPath), passphrase };
      console.log('Usando certificado PFX de server/certs/server.pfx');
    }
  }
} catch (err) {
  console.error('Erro ao ler pfx:', err);
}

if (credentials) {
  // Inicia servidor HTTPS
  https.createServer(credentials, app).listen(HTTPS_PORT, () => {
    console.log(`Servidor HTTPS rodando em https://localhost:${HTTPS_PORT}`);
    console.log(`Endpoint de login: POST https://localhost:${HTTPS_PORT}/api/login`);
    console.log(`Endpoint de recuperação: POST https://localhost:${HTTPS_PORT}/api/recover`);
    console.log(`Endpoint de reset: POST https://localhost:${HTTPS_PORT}/api/reset`);
  });

  // Mantém HTTP apenas para redirecionar para HTTPS
  http.createServer((req, res) => {
    const host = req.headers.host ? req.headers.host.split(':')[0] : 'localhost';
    const target = `https://${host}:${HTTPS_PORT}${req.url}`;
    res.writeHead(301, { Location: target });
    res.end();
  }).listen(PORT, () => {
    console.log(`HTTP escutando em http://localhost:${PORT} (redireciona para HTTPS)`);
  });

} else {
  // Sem certificados, inicia apenas HTTP
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Endpoint de login: POST http://localhost:${PORT}/api/login`);
    console.log(`Endpoint de recuperação: POST http://localhost:${PORT}/api/recover`);
    console.log(`Endpoint de reset: POST http://localhost:${PORT}/api/reset`);
    console.log('Aviso: certificados HTTPS não encontrados em ./certs. Para ativar HTTPS, adicione server.key e server.crt em ./certs.');
  });
}
