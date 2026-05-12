import { Response,Request } from "express";
import { verificaTokenTarefas } from "../../../shared/Middlewares/TokenMiddleware";
import { conn, database_api } from "../../../database/databaseConfig"
import { pedidoController } from "../../orders/controller/pedido-controller";
import {  ApiConfigRepository } from "../data/api-config-repository";
import { SyncStock } from "../../inventory/services/sync-stock";
import { SyncORders } from "../../orders/services/http-request-orders";
import { SyncPrice } from "../../prices/services/sync-price";
import { IConfig } from "../../../interfaces/IConfig";
var cron = require('node-cron');

   
export class apiController{
     delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

              private pedido = new pedidoController();
              private syncStock = new SyncStock();
              private syncOrders = new SyncORders();
              private syncPrice = new SyncPrice();

    async buscaConfig() :Promise<IConfig[]>{
        return new Promise( async (resolve, reject)=>{
            const sql =
            ` SELECT 
            *,
            CAST(c.caminho_fotos  AS CHAR(1000)  CHARACTER SET latin1) as caminho_fotos   
            FROM ${database_api}.config as c;`
            await conn.query( sql, ( err, result )=>{
                if(err){
                    reject(err)
                }else{
                    resolve(result)
                
                }
            })
        })
    }

      async ajusteConfig( req:Request, res:Response){
        let obj =   new ApiConfigRepository();
        // console.log(req.body)
        let  enviar_produtos = req.body.enviar_produtos
        let  tabela_preco =  req.body.tabela_preco;
        let importar_pedidos =  req.body.importar_pedidos ;
        let codigo_vendedor = Number(req.body.codigo_vendedor);
        let  enviar_estoque =  req.body.enviar_estoque ;
        let enviar_preco = req.body.enviar_precos ;
        let setor = req.body.setor;
         let aux = await  obj.atualizaDados({ enviar_precos:enviar_preco  ,enviar_estoque:enviar_estoque, enviar_produtos:enviar_produtos, tabela_preco:tabela_preco, vendedor:codigo_vendedor, importar_pedidos:importar_pedidos, setor:setor });
           if(aux.affectedRows > 0 ){
             return res.redirect('/configuracoes' )
           }
      }

/*
  async main() {
        await verificaTokenTarefas();

             if(!process.env.IMPORTAR_PEDIDOS){
                  throw new Error('é necessario informar a variavel process.env.IMPORTAR_PEDIDOS')  
               }
            if(!process.env.ENVIAR_ESTOQUE){
                  throw new Error('é necessario informar a variavel process.env.ENVIAR_ESTOQUE')  
               }
            if(!process.env.ENVIAR_PRECO){
                  throw new Error('é necessario informar a variavel process.env.PRECO')  
              } 

        const tempoPedido = process.env.IMPORTAR_PEDIDOS;
        const tempoEstoque = process.env.ENVIAR_ESTOQUE;
        const tempoPreco =  process.env.ENVIAR_PRECO;

        let aux:IConfig[] = [] ;

        try {
          aux = await this.buscaConfig();
        } catch (err) {
          console.log(err);
        }
      
        let config:IConfig;
        if (aux.length > 0) {
          config  = aux[0];
        } else {
          return;
        }
      
        if (config.importar_pedidos === 1) {
          await this.delay(8000);
      
          cron.schedule(tempoPedido, async () => {
            await this.pedido.buscaPedidosBling(config.vendedor);
          await this.delay(2000);
            await this.syncOrders.updateBling();

          });
        }
      
        if (config.enviar_estoque === 1) {
          await  this.delay(8000);
          let estoqueExecutando = false;
      
          cron.schedule(tempoEstoque, async () => {
            if (estoqueExecutando) {
              console.log('Processo de envio de estoque já está em execução');
              return;
            }
      
            estoqueExecutando = true;
            console.log('enviando estoque');
      
            try {
              await this.syncStock.enviaEstoque();
            } catch (err) {
              console.log('Erro ao enviar estoque:', err);
            } finally {
              estoqueExecutando = false;
            }
          });
        }
      
      if( config.enviar_precos === 1 ){
          await  this.delay(8000);
          let precoExecutando = false;

          cron.schedule(tempoPreco, async () => {
            if(precoExecutando){
              console.log('Processo de envio de preço ja esta em execução');
              return;
            }
               precoExecutando = true;
            console.log('enviando preço');
              try{
                   await this.syncPrice.enviaPrecos(Number(config.tabela_preco))

              }catch(e){
                console.log("Erro ao enviar o preco")
              }finally{
               precoExecutando = false;
              }

          });

      }

    }
*/
}