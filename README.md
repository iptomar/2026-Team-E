# 2026-Team-E

## Baixar dependencias

Instalar o NVM

Abra o seu terminal e cole o seguinte comando:
Bash

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

Reinicie o terminal ou execute o comando a baixo para que as mudanças sejam carregadas

```
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

**Instalar o Node 22**

**Baixar o npm**

```
nvm install 22
nvm use 22
nvm alias default 22
```

**Iniciar configurações do projeto**

```
npm install && npm run build
composer run dev
```

### Iniciar o projeto

1. Iniciar o servidor de desenvolvimento (frontend):

```
npm run dev
```

2. Iniciar o servidor Laravel (backend):

```
php artisan serve
```

O projeto ficara disponivel no endereco indicado pelo php artisan serve (geralmente http://127.0.0.1:8000).

### Form Builder

Para aceder ao Form Builder, utilize a rota `/builder`:

```
http://127.0.0.1:8000/builder
```

**Login de teste:**

- Email: `test@example.com`
- Password: `password`
