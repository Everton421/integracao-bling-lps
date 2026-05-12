import { ClienteApiRepository } from "../data/cliente-api-repositoryi";
import { ClienteRepository } from "../data/cliente-repositori";
import ConfigApi from "../../../shared/api";

   

export class SyncClient{

    private  clienteRepository = new ClienteRepository();
    private clienteApiRepository = new   ClienteApiRepository();
    private api = new ConfigApi();

    /**
     *  processa o cliente vindo do bling, valida a existencia e retorna o codigo do cliente 
     * @param idClient id do cliente no bling 
     * @param cpf cpf do cliente vindo do bling 
     * @returns 
     */
    async getClient( idClient: string, cpf:string):Promise<number>{
               let clientvalidacao:any =[];
              try{
                    clientvalidacao = await  this.clienteRepository.buscaPorCnpj(cpf);
              }catch(err) { 
                console.log("erro ao validar cliente no banco do sistema função: getClint service/SyncClient  ", err )
             }
           let dadosClientBling:any;
           let codigoClientErp:number = 0;
              if(clientvalidacao.length > 0 ){
                codigoClientErp = clientvalidacao[0].CODIGO;
              }else{
        await this.api.configurarApi();
                 try{
                     dadosClientBling = await this.api.config.get(`/contatos/${idClient}`);
                     try{
                         const resposta = dadosClientBling.data.data
                             console.log('cadastrando cnpj: ', cpf )
                                try{
                                 const clientCadastradoErp:any = await this.clienteRepository.cadastrarClientErp(resposta);
                                 codigoClientErp = clientCadastradoErp.insertId;
                                    if(codigoClientErp > 0 ){

                                            try{
                                            const respostaClienteApi = await  this.clienteApiRepository.cadastrarClientApi({id_bling: Number(idClient), codigoCliente: codigoClientErp, cpf: cpf }); 
                                                //console.log(respostaClienteApi)
                                        }catch(err){ console.log("erro ao inserir clienteApi função: getClint service/SyncClient  "+err); }
                                    }
                                }catch(err:any){
                                    console.log('erro ao cadastrar o cliente no banco de dados do sistema função: getClint service/SyncClient  ', err)
                                }
                         }catch(err:any){
                            console.log("Erro a tentar consultar o cliente no bling função: getClint service/SyncClient  ", err.response.data)
                        }
                 }catch(err:any){
                            console.log("Erro a tentar consultar o cliente no bling função: getClint service/SyncClient  ", err.response.data)
                 }
             }
             return codigoClientErp;
        }
}