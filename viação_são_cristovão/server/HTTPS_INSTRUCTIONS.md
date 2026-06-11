Gerar certificados self-signed para desenvolvimento

Para ativar HTTPS localmente, gere um par de chaves (server.key e server.crt) e coloque-os em `server/certs/`.

Com OpenSSL (Windows, macOS, Linux):

```bash
# Crie a pasta certs
mkdir certs

# Gere chave privada
openssl genrsa -out certs/server.key 2048

# Gere certificado autoassinado (válido por 365 dias)
openssl req -new -x509 -key certs/server.key -out certs/server.crt -days 365 \
  -subj "/C=BR/ST=State/L=City/O=Org/OU=Dev/CN=localhost"
```

Após gerar os arquivos, reinicie o servidor (`npm start`) e o servidor HTTPS ficará disponível em `https://localhost:3443`.

Observações:
- Navegadores irão sinalizar o certificado como não confiável (autoassinado). Para desenvolvimento isso é esperado.
- Para produção use certificados válidos (Let's Encrypt ou certificados pagos).