import { conn, database_api } from "../../../database/databaseConfig";
import { IConfig } from "../../../interfaces/IConfig";

type param = {
          importar_pedidos:number,
          enviar_estoque: number,
           enviar_precos: number,
          tabela_preco:number,
          vendedor:number,
          enviar_produtos: string
          setor:number
    }


  type OkPacket= {
  fieldCount: number,
  affectedRows: number,
  insertId: number,
  serverStatus: number,
  warningCount: number,
  message: string,
  protocol41: boolean,
  changedRows: number
}

export class ApiConfigRepository{

        
            async buscaConfig():Promise<IConfig[]>{
                return new Promise( async (resolve, reject)=>{
                    const sql =
                    ` SELECT 
                    c.*,
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
        

     async atualizaDados( json:Partial<IConfig> ):Promise<OkPacket>{
        return new Promise ( async (resolve,reject ) =>{
            let BaseSql = `
                UPDATE ${database_api}.config set   
            `
                let conditions=[]
                let values=[]

                if( json.ult_env_preco){
                 conditions.push(' ult_env_preco = ? ')
                 values.push(json.ult_env_preco)
                }

                if( json.ult_env_produto){
                  conditions.push(' ult_env_produto = ? ')
                  values.push(json.ult_env_produto)
                }

                if( json.ult_env_estoque){
                  conditions.push(' ult_env_estoque = ? ')
                  values.push(json.ult_env_estoque)
                }


            if( json.enviar_estoque){
                conditions.push(' enviar_estoque = ? ')
                values.push(Number(json.enviar_estoque))
            }
            if( json.enviar_precos){
                conditions.push(' enviar_precos = ? ')
                values.push(Number(json.enviar_precos))
            }

            if( json.enviar_produtos){
                conditions.push(' enviar_produtos = ? ')
                values.push( json.enviar_produtos )
            }
                if( json.importar_pedidos){
                conditions.push(' importar_pedidos = ? ')
                values.push(Number(json.importar_pedidos))
            }
             
             if( json.tabela_preco){
                conditions.push(' tabela_preco = ? ')
                values.push( Number(json.tabela_preco))
            }
             if( json.vendedor){
                conditions.push(' vendedor = ? ')
                values.push(Number(json.vendedor))
            }
               if( json.setor){
                conditions.push(' setor = ? ')
                values.push(Number(json.setor))
            }
            if( json.caminho_fotos){
                conditions.push(' caminho_fotos = ? ')
                values.push(json.caminho_fotos);
            }

            let finalSql= '';

                let whereClause = ' WHERE  ID = 1;'
            if(conditions.length > 0 ){
                finalSql = BaseSql + conditions.join( ' , ') + whereClause
            }
            await conn.query( finalSql,values, (err,result )=>{
                if(err){
                    console.log("erro ao tentar atualizar as configurações da integracao ", err)
                    reject(err);
                }else{
                    resolve(result);
                }
            })
          //  console.log(sql)

           
        })
    }
     

  
}