import { PedidoApiRepository } from "../data/pedido-api-repository";
import { PedidoRepository } from "../data/pedido-data-acess";
import ConfigApi from "../../../shared/api";
import { SyncClient } from "../../client/services/sync-client";

export class SyncORders{

           private  pedidoApiRepository = new PedidoApiRepository();
           private  pedidoRepository = new PedidoRepository();
           private   api = new ConfigApi();
            private syncClient = new SyncClient();


      private delay(ms: number) {
        console.log(`Aguardando ${ms / 1000} segundos para atualizar...`);
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    async buscaPedidosBling( vendedor:number ){
    
    await  this.api.configurarApi();

        let pagina = 1;
        let limite = 100;

        while( true ){
            await this.delay(2000)   
            let dadosPedidos;
            try{
                dadosPedidos = await this.api.config.get('/pedidos/vendas', {
                    params:{
                        pagina: pagina,
                        limite:limite,
                        dataAlteracaoInicial: "2026-03-27 17:16:00"
                    }
                });
            }catch(err) { 
                    //throw err
                        console.log(` Erro ao buscar a pagina: ${pagina} de pedidos do bling`, err)
                    break;
            }

            const arr = dadosPedidos.data.data
                    console.log(arr)

                if(!arr || arr.length === 0 )   {
                    console.log(" Não há mais pedidos a serem importados!")
                    break;
                }

        for( const data of arr ){
                try{
                    let clientPedidoBling = data.contato.id;
                    let cpfClientBling = data.contato.numeroDocumento;
                    let idPedidoBling = data.id; 
                
            //       inicio validação do cliente 
                let codigoClientErp  = await this.syncClient.getClient(clientPedidoBling,cpfClientBling ); 
            //fim da validação do cliente 
                
                        // busca pedido completo
            await this.delay(1000)   
                  console.log(` Processando pedido ${idPedidoBling}...  `)
                    const response  = await this.api.config.get(`/pedidos/vendas/${idPedidoBling}`);

                    const pedidoResponse = response.data.data;
                    const responseValidacao:any  = await this.pedidoApiRepository.validaPedido(pedidoResponse.id);
                            if ( responseValidacao.length > 0 ){
                                const codigPedidoCadastrado = responseValidacao[0].codigo_sistema;
                                console.log(`Pedido já cadastrado. ID Bling: ${idPedidoBling}, ID Interno: ${codigPedidoCadastrado}`);
                                continue; 
                             }else{
                                console.log(`resgistrando pedido ${idPedidoBling}...` )
            await this.delay(1000)   

                                await this.pedidoRepository.cadastrarPedido( pedidoResponse, codigoClientErp, vendedor)
                                console.log(`Pedido ID Bling: ${idPedidoBling} cadastrado com sucesso!`);
                             }
                    }catch(err){
                        console.error(`Ocorreu um erro ao processar o pedido ID: ${data.id}. Pulando para o próximo.`, err);
                    continue;
                }
            }
        pagina++;
    }
 }

    /**
     *  atualiza situação do peido no bling 
     * @returns 
     */
   async updateBling(){ 
            console.log('Atualizando pedidos no bling...  ')
       const arrOrders = await this.pedidoApiRepository.findAll(); 
         
                for ( const order of arrOrders ) { 
                          const validOrder = await  this.pedidoRepository.findByCode(order.codigo_sistema);

                          if( validOrder.length > 0 ){
                                const orderErp = validOrder[0];
                                
                                if( orderErp.SITUACAO != order.situacao){
                                console.log(`Atualizando pedido ${order.codigo_sistema} ... `)
                                        let novaSituacao = 6 ;   
                                        if( orderErp.SITUACAO === 'EA'){
                                            novaSituacao =   6 
                                        }
                                        if( orderErp.SITUACAO === 'FI'){
                                            novaSituacao =  9 ;
                                        }
                                    try{
                                        await this.delay(1000);
                                        let resultPatchOrder = await  this.api.config.patch(`/pedidos/vendas/${order.Id_bling}/situacoes/${novaSituacao}`);
                                        if(resultPatchOrder.status === 200 ||resultPatchOrder.status ===204 ){
                                            this.pedidoApiRepository.updateBYParam( { Id_bling: order.Id_bling, codigo_sistema: order.codigo_sistema, situacao: orderErp.SITUACAO  })
                                        }
                                    }catch( err:any ){
                                        console.log(`Erro ao tentar atualizar pedido no bling `, err.response.data.error);
                                        return err.response.data.message
                                        }   
                                    // enviar atualização do pedido
                                }else{
                                    console.log(`Pedido: ${ order.codigo_sistema} sem alteração`)
                                }
                            }else{
                             console.log(` pedido: ${order.codigo_sistema}, id: ${order.Id_bling}  não foi encontrado`)
                       }
             } 
             
        }
}