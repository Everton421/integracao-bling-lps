import { Request, Response, NextFunction } from "express";
import { conn_api, database_api } from "../../database/databaseConfig";
import axios from "axios";
import { TokenController } from "../../core/authorization/controller/token-controller";
import { ApiTokenRepository } from "../../core/authorization/api-token-repository";


export async function verificaToken(req: Request, res: Response, next: NextFunction) {
                        
               const client_id = process.env.CLIENT_ID;
               const client_secret = process.env.CLIENT_SECRET;
               const urlAuthorize = `https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${process.env.CLIENT_ID}&state=f0a329cc3a9c94fa12f00186e09be104`
              
              
               const url_bling:any = process.env.BASE_URL
                
              const objToken = new ApiTokenRepository();

    const tokenBD:any = await objToken.buscaToken(); // token registrado no banco 

            if (!tokenBD[0] || tokenBD[0] === undefined ) { // Se não houver token registrado, redireciona para a rota de autorizaçao 
                console.log(tokenBD[0]);
                res.redirect(urlAuthorize)
            } else {
                
                const verificacao = objToken.verificaExpiracao(tokenBD[0]);
                if (verificacao === false) {
                    const refreshToken = tokenBD[0].refresh_token;
                       
                    // Se não existir refresh token, redireciona para autorização do aplicativo
                    if (tokenBD.length > 0 )  {
                        console.log('Atualizando token');
                        const base64Credentials = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
                        const headers = {
                            'Host': 'www.bling.com.br',
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Accept': '1.0',
                            'Authorization': `Basic ${base64Credentials}`
                        }
                
                        const data = new URLSearchParams();
                        data.append('grant_type', 'refresh_token');
                        data.append('refresh_token', refreshToken);
                
                        try {
                              const responseToken:any = await axios.post(`${url_bling}/oauth/token`, data, { headers });
                              console.log(responseToken);
                              if(responseToken.token === undefined || responseToken.token === null ){
                               // console.log('erro ao oter um novo token utilizando o refres token')
                              }

                              if (responseToken.status === 200) {
                             // console.log("Refresh token obtido", responseToken)
                                  objToken.insereToken(responseToken.data, database_api);

                                  next();
                            }
                        
                        } catch (err:any) {
                            if (err.response) {
                                // O servidor respondeu com um status diferente de 2xx
                                console.log("Erro ao obter o token:", err.response.data);
                            } else if (err.request) {
                                // A solicitação foi feita, mas não recebeu resposta
                                console.log("Erro de solicitação:", err.request);
                            } else {
                                // Ocorreu um erro ao configurar a solicitação
                                console.log("Erro ao configurar a solicitação:", err.message);
                            }
                            res.redirect(urlAuthorize);
                        }
                    } else {
                        return res.redirect(urlAuthorize);

                       
                    }
                } else {
                    next();
                }

            }


}



export async function verificaTokenTarefas() {
                        
    const client_id = process.env.CLIENT_ID;
    const client_secret = process.env.CLIENT_SECRET;
    const urlAuthorize = `https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${process.env.CLIENT_ID}&state=f0a329cc3a9c94fa12f00186e09be104`
   
   
    const url_bling:any = process.env.BASE_URL
     
   const objToken = new ApiTokenRepository();

const tokenBD:any = await objToken.buscaToken(); // token registrado no banco 

 if (!tokenBD[0] || tokenBD[0] === undefined ) { // Se não houver token registrado, redireciona para a rota de autorizaçao 
     console.log(tokenBD[0]);
 } else {
     
     const verificacao = objToken.verificaExpiracao(tokenBD[0]);
     if (verificacao === false) {
         const refreshToken = tokenBD[0].refresh_token;
            console.log('atualizando token')
         // Se não existir refresh token, redireciona para autorização do aplicativo
         if (tokenBD.length > 0 )  {
             console.log('Atualizando token');
             const base64Credentials = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
             const headers = {
                 'Host': 'www.bling.com.br',
                 'Content-Type': 'application/x-www-form-urlencoded',
                 'Accept': '1.0',
                 'Authorization': `Basic ${base64Credentials}`
             }
     
             const data = new URLSearchParams();
             data.append('grant_type', 'refresh_token');
             data.append('refresh_token', refreshToken);
     
             try {
                   const responseToken:any = await axios.post(`${url_bling}/oauth/token`, data, { headers });
                  /// console.log(responseToken);
                   if(responseToken.data.access_token === undefined || responseToken.data.access_token === null ){
                      console.log('erro ao oter um novo token  ')
                   }

                   if (responseToken.status === 200) {
                    console.log("  token obtido", responseToken.status)
                       objToken.insereToken(responseToken.data, database_api);

                 }
             
             } catch (err:any) {
                 if (err.response) {
                     // O servidor respondeu com um status diferente de 2xx
                     console.log("Erro ao obter o token:", err.response.data);
                 } else if (err.request) {
                     // A solicitação foi feita, mas não recebeu resposta
                     console.log("Erro de solicitação:", err.request);
                 } else {
                     // Ocorreu um erro ao configurar a solicitação
                     console.log("Erro ao configurar a solicitação:", err.message);
                 }
             }
         }  

     }else{
        console.log('token valido')
     } 
 }


}
