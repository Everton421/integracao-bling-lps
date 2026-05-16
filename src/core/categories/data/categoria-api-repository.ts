import { conn_api, database_api } from "../../../database/databaseConfig";
import { DateService } from "../../../shared/utils/date-service";

type categoryIntegration = {
    Id_bling:number, descricao:string, codigo_sistema:number, data_envio:string
}

type OkPacket = {
  fieldCount:  number,
  affectedRows:  number,
  insertId:  number,
  serverStatus:  number,
  warningCount:  number,
  message: string,
  protocol41: boolean,
  changedRows: number
}
export class CategoriaApiRepository{
    private dateService = new DateService();

    formatDescricao(descricao: string): string {
        return descricao.replace(/'/g, '');
        }
    
    
        async buscaCategoriasApi( ):Promise<[ { Id_bling:number, descricao:string, codigo_sistema:number, data_envio:string}]>{
        return new Promise( async (resolve,reject)=>{
            const sql = 
            `SELECT * FROM ${database_api}.categorias ;
             `
                await conn_api.query(sql,   (err,result)=>{
                    if(err){
                        console.log('erro ao buscar categorias enviadas ', err)
                        reject(err);
                    }else{
                        resolve(result)
                    }
                })
        })
    }
    
        async findCategoryByCodeSistem( codigo:number):Promise<categoryIntegration[]>{
        return new Promise( async (resolve,reject)=>{
            const sql = 
            `SELECT * FROM ${database_api}.categorias WHERE codigo_sistema = ? ;
             `
                await conn_api.query(sql,[codigo], (err,result)=>{
                    if(err){
                        reject(err);
                    }else{
                        resolve(result)
                    }
                })
        })
    }

    
    async insertCategorApi( valuesInsertCategoy:{ id_bling:number, sistemCode:number, description:string, } ){
        return new Promise( async (resolve,reject)=>{

            let dataInsercao = this.dateService.obterDataHoraAtual()
            
            const { id_bling, sistemCode , description} = valuesInsertCategoy;

            let descricaoSemAspas = this.formatDescricao(description);

             const sql = ` INSERT INTO ${database_api}.categorias VALUES ( ? , ? , ? , ? )` 
            
             const valuesCategoryInsert = [id_bling,  descricaoSemAspas, sistemCode,  dataInsercao]
                await conn_api.query(sql,valuesCategoryInsert, (err,result)=>{
                    if(err){
                        reject(err);
                    }else{
                        resolve(result)
                    }
                })
        })
    }


    
    async updateCategoryApi( valuesupdateCategoy:{ id_bling:number, sistemCode:number, description:string, } )
    :Promise<OkPacket>{
        return new Promise( async (resolve,reject)=>{

            let dataInsercao = this.dateService.obterDataHoraAtual()
            
            const { id_bling, sistemCode , description} = valuesupdateCategoy;

            let descricaoSemAspas = this.formatDescricao(description);

             const sql = ` UPDATE ${database_api}.categorias set 
             Id_bling = ?, 
             descricao = ?, 
             codigo_sistema = ?, 
             data_envio = ? 
             where Id_bling = ? 
              ` 
            
             const valuesCategoryInsert = [id_bling,  descricaoSemAspas, sistemCode,  dataInsercao, id_bling]
                await conn_api.query(sql,valuesCategoryInsert, (err,result)=>{
                    if(err){
                        reject(err);
                    }else{
                        resolve(result)
                    }
                })
        })
    }

}