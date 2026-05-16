import { Request, Response } from "express";
import { conn, database_api } from "../../../database/databaseConfig";
import { IConfig } from "../../../interfaces/IConfig";
import { ApiConfigRepository } from "../data/api-config-repository";
var cron = require('node-cron');

   
export class apiController{
     delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


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
        // console.log(req.body)
        let  enviar_produtos = req.body.enviar_produtos
        let  tabela_preco =  req.body.tabela_preco;
        let importar_pedidos =  req.body.importar_pedidos ;
        let codigo_vendedor = Number(req.body.codigo_vendedor);
        let  enviar_estoque =  req.body.enviar_estoque ;
        let enviar_preco = req.body.enviar_precos ;
        let setor = req.body.setor;
         let aux = await  ApiConfigRepository.atualizaDados({ enviar_precos:enviar_preco  ,enviar_estoque:enviar_estoque, enviar_produtos:enviar_produtos, tabela_preco:tabela_preco, vendedor:codigo_vendedor, importar_pedidos:importar_pedidos, setor:setor });
           if(aux.affectedRows > 0 ){
             return res.redirect('/configuracoes' )
           }
      }

}