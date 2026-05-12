import { ApiConfigRepository } from "../core/company/data/api-config-repository";
import { ProdutoApiRepository } from "../core/products/data/produto-api-repository";
import { DateService } from "../shared/date-service";
import { SyncProduct } from "../core/products/services/sync-product";

export class JobProduto{
    private syncProduct = new SyncProduct();
    private produtoApiRepository = new ProdutoApiRepository();
    private apiConfigRepository = new ApiConfigRepository();
    private dateService = new DateService();

      async enviarProdutos( ) {
        const data = this.dateService.obterDataHoraAtual();
         const [ config ] =  await this.apiConfigRepository.buscaConfig();

            if(!config.ult_env_produto){
                console.log("[X] Nenhum valor referente a data de ultimo envio de produto registrado no banco da integrção.")
                return
            }
                    const produtos = await this.produtoApiRepository.findChagedAfter(config.ult_env_produto!);

            let arrResult = []
            if(produtos.length > 0 ){
                console.log(`[V] enviando/atualizando ${produtos.length} produtos...`)
                    for (const i of produtos) {
                        let result: any = await this.syncProduct.postOrPutProductBling(Number(i.CODIGO), true );
                        if (result.resultados) {
                            arrResult.push(result.resultados)
                        }
                    }
            }
            await this.apiConfigRepository.atualizaDados({ ult_env_produto: data})
        }
    
}