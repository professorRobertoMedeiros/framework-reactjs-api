"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductBusiness = void 0;
const ProductModel_1 = require("../../core/domain/models/ProductModel");
const ProductRepository_1 = require("./repository/ProductRepository");
// Implementação do business de produtos
class ProductBusiness {
    constructor(productRepository) {
        this.productRepository = productRepository || new ProductRepository_1.ProductRepository();
    }
    // Converter modelo para Dom
    toDom(product) {
        return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            active: product.active,
            created_at: product.created_at,
            updated_at: product.updated_at
        };
    }
    // Obter produto por ID
    async getProductById(id) {
        const product = await this.productRepository.findById(id);
        return product ? this.toDom(product) : null;
    }
    // Obter todos os produtos
    async getAllProducts(options) {
        const products = await this.productRepository.findAll(options);
        return products.map(product => this.toDom(product));
    }
    // Obter todos os produtos com paginação
    async getAllProductsPaginated(options) {
        const result = await this.productRepository.findAllPaginated(options);
        return {
            data: result.data.map(product => this.toDom(product)),
            pagination: result.pagination
        };
    }
    // Criar um novo produto
    async createProduct(data) {
        // Validações
        if (data.price < 0) {
            throw new Error('O preço não pode ser negativo');
        }
        if (data.stock < 0) {
            throw new Error('O estoque não pode ser negativo');
        }
        // Criar produto
        const product = new ProductModel_1.ProductModel();
        product.name = data.name;
        product.description = data.description;
        product.price = data.price;
        product.stock = data.stock;
        product.active = data.active !== undefined ? data.active : true;
        product.created_at = new Date();
        // Persistir no repositório
        const createdProduct = await this.productRepository.create(product);
        return this.toDom(createdProduct);
    }
    // Atualizar um produto existente
    async updateProduct(id, data) {
        // Verificar se o produto existe
        const existingProduct = await this.productRepository.findById(id);
        if (!existingProduct) {
            return null;
        }
        // Validações
        if (data.price !== undefined && data.price < 0) {
            throw new Error('O preço não pode ser negativo');
        }
        if (data.stock !== undefined && data.stock < 0) {
            throw new Error('O estoque não pode ser negativo');
        }
        // Preparar dados para atualização
        const updateData = {
            ...data,
            updated_at: new Date()
        };
        // Atualizar no repositório
        const updatedProduct = await this.productRepository.update(id, updateData);
        return updatedProduct ? this.toDom(updatedProduct) : null;
    }
    // Excluir um produto
    async deleteProduct(id) {
        // Verificar se o produto existe
        const existingProduct = await this.productRepository.findById(id);
        if (!existingProduct) {
            return false;
        }
        // Excluir do repositório (ou desativar, dependendo da regra de negócio)
        return await this.productRepository.delete(id);
    }
    // Encontrar produtos com estoque baixo
    async findLowStockProducts(threshold = 10) {
        const products = await this.productRepository.findLowStock(threshold);
        return products.map(product => this.toDom(product));
    }
}
exports.ProductBusiness = ProductBusiness;
//# sourceMappingURL=ProductBusiness.js.map