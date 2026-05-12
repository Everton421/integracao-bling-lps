import axios from "axios";
import {    database_api } from "../../../database/databaseConfig";
import { NextFunction, Request, Response } from "express";
import {  ApiTokenRepository  } from "../api-token-repository";
export class TokenController{

 objToken = new ApiTokenRepository();

   async obterToken(req:Request ,res:Response, next:NextFunction){
    const client_id = process.env.CLIENT_ID;
    const client_secret = process.env.CLIENT_SECRET;
    const urlBling = process.env.BASE_URL
  
    const code:any = req.query.code;

    const base64Credentials = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
   
    const headers:any = {
        'Host': 'www.bling.com.br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': '1.0',
        'Authorization': `Basic ${base64Credentials}`
    };

    const data = new URLSearchParams();
    data.append('grant_type', 'authorization_code');
    data.append('code', code);

    try {
        const apiToken = await axios.post(`${urlBling}/oauth/token`, data, { headers });
       // console.log(apiToken.data); // Se desejar, imprima a resposta
        console.log(apiToken.data)
        //res.status(200).json(apiToken.data); // Retorna a resposta como JSON
        if( apiToken.status === 200){
         try{
          let dadosinseridos = await this.objToken.insereToken(apiToken.data, database_api);
             res.redirect('/')
            
        }catch(err){
          console.log(err)

        }
   
        }

 

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao obter o token de API' }); // Retorna um erro 500 em caso de falha
    } 
   }
    



}