import { AxiosError } from "axios";
import ConfigApi from "../../../shared/api";


type naturezaOperacaoBling =  
  {
       id: number,
       situacao: number,
       padrao: number,
       descricao: string
    }

    type resultRequestWiretappingOperations =  
    {
        data :[
            {
            id: number,
            situacao: number,
            padrao: number,
            descricao: string
            }
     ]
    }

export class SyncWiretappingOperations{
        private api = new ConfigApi();

  async getWiretappingOperations() {
                 
             await this.api.configurarApi();
 
                try{

                   const resultWiretappingOperations = await   this.api.config.get('/naturezas-operacoes') ;
                   return resultWiretappingOperations.data as resultRequestWiretappingOperations;

                }catch(e){
                    if(e instanceof AxiosError){
                        console.log(`Erro ao tentar consultar as naturezas-operacoes no bling ` , e.response?.data);
                    }
                  return;
                }
             
        }
    

}