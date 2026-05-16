import { conn, conn_api, database_api, db_api, db_publico, db_vendas } from "../../../database/databaseConfig"
import { IPedidoApi } from "../../../interfaces/IPedidoApi";
import { DateService } from "../../../shared/utils/date-service"
 


export class PedidoApiRepository{

        dateService = new DateService();

    async validaPedido( id:string ){

            const sql = `SELECT * FROM ${database_api}.pedidos where Id_bling = ${id};`

        return new Promise(  async (resolve,reject)=>{
            await conn_api.query(sql, ( err ,result)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            })
        })
    }
    /**
     * Obtem dados do pedido 
     * @returns 
     */
   async findAll():Promise< IPedidoApi[]>{
            const sql = `SELECT 
            p.*,
            c.NOME as nome ,
            co.TOTAL_GERAL as total_geral  
             FROM ${database_api}.pedidos p
                   join ${db_vendas}.cad_orca co on co.CODIGO = p.codigo_sistema
                   join ${db_publico}.cad_clie c on c.CODIGO = co.CLIENTE 
            ;`

        return new Promise(  async (resolve,reject)=>{
            await conn.query(sql, ( err ,result)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            })
        })
    }


    async cadastraPedidoApi( json:{ Id_bling:any, codigo_sistema:number, situacao:string} ){
            return new Promise(  async (resolve, reject)=>{
                const {
                    Id_bling,
                    codigo_sistema,
                    situacao
                } = json;

                const data = this.dateService.obterDataHoraAtual();

                const sql = 
                ` INSERT INTO ${database_api}.pedidos values ('${Id_bling}', '${codigo_sistema}', '${data}' , '${situacao}')` 
                await conn_api.query( sql,(err, result)=>{
                    if(err){
                        reject(err);
                    }else{
                        resolve(result)
                    }
                })
            })
    }


    async updateBYParam( dados: { Id_bling:any, codigo_sistema:number, situacao:string}){

        if( !dados.Id_bling ) return console.log(`è necessario informar o id do pedido para atualziar a tabela de pedidos da integracao`) 

         
        return new Promise((resolve, reject )=>{
        let sql = ` UPDATE ${db_api}.pedidos SET `  
            let conditions = [];
            let values =[];
        
        if(dados.codigo_sistema){
            conditions.push( ' codigo_sistema = ? ');
            values.push(dados.codigo_sistema);
        }

        if( dados.situacao){
            conditions.push(' situacao = ? ');
            values.push(dados.situacao)
        }
            const whereClause =' WHERE Id_bling = ? ' 
            values.push(dados.Id_bling);

            let finalSql = sql ;

        if( conditions.length > 0 ){
             finalSql = sql + conditions.join( ' , ') + whereClause   
        }


         conn_api.query(finalSql, values ,(err, result )=>{
                 if( err ){
                     console.log(`Erro ao tentar atualizar o pedido no banco de dados da integração`, err)
                     reject(err);
                 }else{
                     resolve( result )
                 }
             })  
         })


    }

}