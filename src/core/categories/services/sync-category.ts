import { AxiosError } from "axios";
import { CategoriaApiRepository } from "../data/categoria-api-repository";
import { CategoriaRepository } from "../data/categoria-repository";
import { cad_pgru } from "../../../interfaces/cad_pgru";
import ConfigApi from "../../../shared/api";



export class SyncCategory {

    private api: any = new ConfigApi();


    /**
     *  verifica se a categoria já foi enviada e faz o envio caso não foi enviada anteriormente. 
     * @param codeCategorySystem 
     * @returns 
     */
    async verifyCategory(codeCategorySystem: number) {
        await this.api.configurarApi();
        const categoriaSistema = new CategoriaRepository();
        const categoriaAPI = new CategoriaApiRepository();


        const resultCategorysSubmitted = await categoriaAPI.findCategoryByCodeSistem(codeCategorySystem);

        let id_bling = null;
        let sistemCode = null;
        if (resultCategorysSubmitted.length > 0) {
            id_bling = resultCategorysSubmitted[0].Id_bling;
            sistemCode = resultCategorysSubmitted[0].codigo_sistema;
            return { success: true, message: "", data: { id_bling, sistemCode } };
        } else {
            const resultCategorySystem = await categoriaSistema.findSystemCategoryByCode(codeCategorySystem);
            if (resultCategorySystem.length > 0) {
                const categorySystem = resultCategorySystem[0];

                const resultPostCategoryBling = await this.postCategory(categorySystem);
                if (resultPostCategoryBling.data) {
                    id_bling = resultPostCategoryBling.data.idCategoryBling;
                    sistemCode = resultPostCategoryBling.data.systemCategoryCode;
                    const description = resultPostCategoryBling.data.systemCategoryName;

                    const result = await categoriaAPI.insertCategorApi({ description, id_bling, sistemCode })
                    console.log(result);
                    return { success: true, message: "", data: { id_bling, sistemCode } };
                } else {
                    return { success: false, message: resultPostCategoryBling.message, data: null };

                }

            } else {
                return { success: false, message: `categoria ${codeCategorySystem} não foi encontrada.`, data: null };
            }

        }
    }

    async postCategory(category: cad_pgru) {

        const { CODIGO, NOME } = category;

        const dataPostCategoryBling = {
            "descricao": NOME.trim(),
            "categoriaPai": {
                "id": 0
            }
        }
        try {
            const responseBlingNewCategory = await this.api.config.post('/categorias/produtos', dataPostCategoryBling);
            const responseIdNewCategory = responseBlingNewCategory.data.data.id as number;
            if (responseBlingNewCategory.status === 201) {
                const value = { idCategoryBling: responseIdNewCategory, systemCategoryCode: CODIGO, systemCategoryName: NOME };
                return { sucess: true, message: ` Categoria ${NOME.trim()} enviado com sucesso!  `, data: value };
            } else {
                return { sucess: true, message: ` Falha ao tentar enviar categoria ${NOME}`, data: null };
            }
        } catch (err: any) {
            if (err instanceof AxiosError) {
                console.log(`[X] erro ao tentar enviar categoria ${err.response?.data} `)
            }

            if (err.response.status === 400) {
                return { sucess: true, message: ` Falha ao tentar enviar categoria ${NOME}`, data: null };

            } else {
                return { sucess: true, message: ` Falha ao tentar enviar categoria ${NOME}`, data: null };
            }
        }

    }

    async putCategory(category: cad_pgru, idCategoryBling: number) {

        const { CODIGO, NOME } = category;

        const bodyRequest = {
            "descricao": NOME.trim(),
        }
        try {
            const responseBlingUpdateCategory = await this.api.config.put(`/categorias/produtos/${idCategoryBling}`, bodyRequest);
            //   const responseIdUpdateCategory = responseBlingUpdateCategory.data.data.id as number;
            const statusRequest = responseBlingUpdateCategory.status;

            if (statusRequest === 200 || statusRequest === 204 ) {
                const value = { idCategoryBling, systemCategoryCode: CODIGO, systemCategoryName: NOME };
                return { sucess: true, message: ` Categoria ${NOME.trim()} atualizada com sucesso!  `, data: value };
            } else {
                return { sucess: true, message: ` Falha ao tentar atualizar categoria ${NOME} status request : ${statusRequest}`, data: null };
            }
        } catch (err: any) {
            const statusRequest = err.status;
            if (err instanceof AxiosError) {
                console.log(`[X] erro ao tentar atualizar categoria ${err.response?.data || err.response} `)
            }

            if (err.response.status === 400) {
                return { sucess: true, message: ` Falha ao tentar atualizar categoria ${NOME}`, data: null };

            } else {
                return { sucess: true, message: ` Falha ao tentar atualizar categoria ${NOME}`, data: null };
            }

        }

    }
}