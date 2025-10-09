import { CustomORM } from 'framework-reactjs-api';
import { ProdutoModel } from './models/ProdutoModel';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function main() {
  console.log('Inicializando aplicação...');
  
  try {
    // Obter instância do ORM
    const orm = CustomORM.getInstance();
    
    // Registrar modelo
    orm.registerModel(ProdutoModel);
    
    // Sincronizar esquema do banco de dados
    await orm.syncSchema();
    
    console.log('Banco de dados sincronizado!');
    
    // Criar um novo produto
    const novoProduto = new ProdutoModel({
      nome: 'Produto de Teste',
      descricao: 'Este é um produto de teste',
      preco: 29.99,
      estoque: 10
    });
    
    const produtoSalvo = await orm.create<ProdutoModel>('produtos', novoProduto);
    console.log('Produto criado:', produtoSalvo);
    
    // Buscar todos os produtos
    const produtos = await orm.findAll<ProdutoModel>('produtos');
    console.log('Produtos encontrados:', produtos.length);
    
    // Finalizar
    console.log('Processo finalizado com sucesso!');
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Executar aplicação
main().catch(console.error);