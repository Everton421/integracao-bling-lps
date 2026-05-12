import axios from "axios";
import { ApiTokenRepository } from "../core/authorization/api-token-repository";

export class ConfigApi {
    config: any;

    constructor() {
        this.configurarApi();
    }

    async configurarApi() {
        try {
            const aux = new ApiTokenRepository();
            const tokenObj: any = await aux.buscaToken(); // Obtém o token usando o método buscaToken()
            const url_bling = process.env.BASE_URL;
            const token = tokenObj[0].token; // Obtém o token do objeto retornado
            // Cria a instância do axios com o token
            this.config = axios.create({
                baseURL: url_bling,
                 
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });
        } catch (error:any) {
            throw new Error(`Erro ao configurar API: ${error.message}`);
        }
    }



}

export default ConfigApi;
