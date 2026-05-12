import { Request, Response } from "express";
import { SyncCategory } from "../services/sync-category";
import { CategoriaRepository } from "../data/categoria-repository";
import { CategoriaApiRepository } from "../data/categoria-api-repository";

export class CategoriaController{


   async postCategory( req:Request, res:Response ){
   
    const syncCategory = new SyncCategory();
    const systemCategories = new CategoriaRepository();
    const apiCategories = new CategoriaApiRepository();

        const arrSelecionados = req.body.categorias
    if( Array.isArray(arrSelecionados) ){

        let arrResult=[]  
        for( const i of  arrSelecionados ){

                    const resultVerifyApiCategory = await apiCategories.findCategoryByCodeSistem(Number(i))
                    const [ resultCategorySistem ] = await systemCategories.findSystemCategoryByCode(Number(i));

                    if(resultVerifyApiCategory.length > 0 ){
                     
                        const idCategoryBling = resultVerifyApiCategory[0].Id_bling; 
                        const resultPutCategory  = await syncCategory.putCategory(resultCategorySistem,idCategoryBling );
                        if(resultPutCategory.sucess){

                            await apiCategories.updateCategoryApi({ description:resultCategorySistem.NOME , id_bling:idCategoryBling ,sistemCode:resultCategorySistem.CODIGO })
                            arrResult.push(resultPutCategory.message);
                        }
                    
                    }else{
                        
                        const resultPostCategory  = await syncCategory.postCategory(resultCategorySistem );
                        if(resultPostCategory.sucess){
                           const categoryIdBling = Number(resultPostCategory.data?.idCategoryBling);
                           const sistemCode= Number(resultPostCategory.data?.systemCategoryCode);
                            await apiCategories.insertCategorApi({ description:resultCategorySistem.NOME , id_bling:categoryIdBling ,sistemCode})

                        }

                        arrResult.push(resultPostCategory.message);
                    
                    }

        }
        console.log(arrResult.toString())
       res.status(200).json( { msg:arrResult.toString()} )

    }

}    

}