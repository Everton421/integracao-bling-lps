import { ApiConfigRepository } from "../core/company/data/api-config-repository";
import { ProdutoApiRepository } from "../core/products/data/produto-api-repository";
import { ProdutoRepository } from "../core/products/data/produto-repository";
import { verificaTokenTarefas } from "../shared/Middlewares/TokenMiddleware";
import ConfigApi from "../shared/api";
import { DateService } from "../shared/utils/date-service";

   export class JobPrice{
    private api = new ConfigApi();
    private dateService = new DateService();

    private delay(ms: number) {
        console.log(`Aguardando ${ms / 1000} segundos para enviar o preço...`);
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    
       async enviaPrecos(){

                await verificaTokenTarefas();
                await this.api.configurarApi();

                // obtem as configurações da api 
                const  arrConfig = await  ApiConfigRepository.buscaConfig();

                    if(arrConfig.length  >  0 ){

                        const config = arrConfig[0];
                        if(config.ult_env_preco){
                                // obtem os produtos que já foram enviados com base na data de ultimo envio de preço.
                            const produtosEnviados  = await ProdutoApiRepository.findChagedAfter(config.ult_env_preco);

                                if (produtosEnviados.length > 0 ) {
                                    for (const data of produtosEnviados) {
                                        if(data.Id_bling){

                                    // obtem os dados do produto no sistema.
                                    const resultPrecoSistema = await ProdutoRepository.buscaPreco(data.codigo_sistema, config.tabela_preco);
                                        if( resultPrecoSistema.length > 0 ){
                                    const precoProduto = resultPrecoSistema[0]
                                 
                                    if( new Date(precoProduto.DATA_RECAD) > new Date( config.ult_env_preco) ){
                                                
                                                    let objPatch = {
                                                                "preco": precoProduto.PRECO
                                                            }

                                                            try {
                                                                const resultPrecoEnviado = await this.api.config.patch(`/produtos/${data.Id_bling}`, objPatch);
                                                                if (resultPrecoEnviado.status === 200 || resultPrecoEnviado.status === 201) {
                                                                    await this.delay(1000);
                                                                    await ProdutoApiRepository.updateByParama({ id_bling: data.Id_bling, data_preco: DateService.obterDataHoraAtual() });
                                                                //  return { ok: true, erro: false, msg: "preco atualizado com sucesso!" }
                                                                    console.log(`[V] preco do produto ${data.codigo_sistema} atualizado com sucesso!`);
                                                                }
                                                            } catch (e: any) {
                                                                console.log(`[X] Erro ao tentar atualizar preço do produto no bling `);
                                                                console.log(e.response)
                                                            }
                                                }else{
                                                console.log( precoProduto.DATA_RECAD  ," > ",   data.data_preco )  
                                                    console.log(`[X] Não ouve mudança no preço do produto ${data.descricao} na tabela ${config.tabela_preco} `)
                                                }
                                        }else{
                                             console.log(`[X] Não foi encontrado registro de preço do produto ${data.descricao} na tabela ${config.tabela_preco} `)
                                           }
                                        }else{
                                            console.log(`[X] produto ${data.CODIGO} não foi enviado. `)
                                        }
                                    }
                           }
                    }

                    await ApiConfigRepository.atualizaDados({ult_env_preco: DateService.obterDataHoraAtual()})
        }
    }
}
