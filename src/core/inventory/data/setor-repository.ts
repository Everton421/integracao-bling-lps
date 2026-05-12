import { conn,    db_estoque, db_publico, db_vendas } from "../../../database/databaseConfig" ;
import { IProductSystem } from "../../../interfaces/IProduct";
import { ISetor } from "../../../interfaces/setores";

export class SetorRepository{

    async buscaSetor():Promise<ISetor[]>{

        return new Promise( async (resolve, reject)=>{
          
            let sql = ` 
                            SELECT * FROM ${db_estoque}.setores WHERE ATIVO = 'S';
                            `;
            await conn.query(sql, (err:any,result:any)=>{
              if(err){
                reject(err);
              }else{
                resolve(result);
              }
            });
        });
  
     }

  

}
