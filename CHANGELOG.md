# Changelog

## [1.2.0] - 2023-10-09

### Adicionado
- Geração automática de arquivos de rotas para API REST
- Cada caso de uso agora possui uma pasta 'routes' com endpoints CRUD completos
- Integração de autenticação nas rotas sensíveis
- Documentação atualizada sobre as rotas geradas

### Modificado
- Função de scaffolding para incluir geração de arquivo de rotas
- Exportação expandida no index.ts para incluir o inicializador do ORM
- Documentação aprimorada sobre estrutura de arquivos

## [1.1.0] - 2023-04-18

### Adicionado
- Exemplo completo de uso como dependência
- Documentação abrangente no MANUAL.md
- Seção de troubleshooting para resolução de problemas de importação
- Configuração de CLI via bin no package.json

### Modificado
- Melhorias na detecção de diretórios de modelos e migrações
- Scripts de scaffolding para funcionarem corretamente com projetos externos
- README.md com instruções de uso mais claras

### Corrigido
- Compatibilidade dos paths de importação nos templates gerados
- Detecção de diretórios de projeto quando usado como dependência

## [1.0.0] - 2023-04-17

### Adicionado
- Estrutura inicial do framework seguindo princípios de DDD e Clean Architecture
- Implementação do padrão Repository com BaseRepository
- Sistema de autenticação com JWT
- ORM customizado leve para acesso a banco de dados
- Sistema de migrações de banco de dados
- Ferramentas CLI para migrações, sincronização de esquema e scaffolding

### Modificado
- Reorganização dos repositórios para ficarem dentro de seus respectivos casos de uso
- Reestruturação do código para ser usado como dependência em outros projetos
- Implementação do mecanismo de exportação via index.ts

### Corrigido
- Problema de path em scripts CLI quando usado como dependência
- Tipagens de autenticação JWT
- Implementação de métodos toJSON faltantes em modelos
- Erro de imports em arquivos de scaffolding
- Detecção de modelos em diferentes estruturas de diretório

## [1.1.0] - 2023-04-18

### Adicionado
- Exemplo completo de uso como dependência
- Documentação abrangente no MANUAL.md
- Seção de troubleshooting para resolução de problemas de importação
- Configuração de CLI via bin no package.json

### Modificado
- Melhorias na detecção de diretórios de modelos e migrações
- Scripts de scaffolding para funcionarem corretamente com projetos externos
- README.md com instruções de uso mais claras

### Corrigido
- Compatibilidade dos paths de importação nos templates gerados
- Detecção de diretórios de projeto quando usado como dependência
