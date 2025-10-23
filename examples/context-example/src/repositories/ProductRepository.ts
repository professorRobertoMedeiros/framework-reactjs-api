import { BaseRepository } from 'framework-reactjs-api';
import { ProductModel } from '../models/ProductModel';

/**
 * Repository de produtos
 * 
 * IMPORTANTE: Não precisa mais passar currentUser!
 * O BaseRepository busca automaticamente do RequestContext
 */
export class ProductRepository extends BaseRepository<ProductModel> {
  // Construtor simplificado - currentUser vem do contexto
  constructor(
    modelClass: new () => ProductModel,
    enableAudit: boolean = false
  ) {
    // currentUser será buscado automaticamente do RequestContext
    super(modelClass, enableAudit);
  }
}
