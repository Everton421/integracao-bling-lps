import { Request, Response } from "express";
import { ApiConfigRepository } from "../../company/data/api-config-repository";
import { ProdutoApiRepository } from "../data/produto-api-repository";
import { ProdutoRepository } from "../data/produto-repository";
import { SyncPrice } from "../../prices/services/sync-price";
import { SyncProduct } from "../../products/services/sync-product";
import { SyncStock } from "../../inventory/services/sync-stock";

export class ProdutoController {


    private delay(ms: number) {
        console.log(`Aguardando ${ms / 1000} segundos...`);
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private produto = new ProdutoRepository();
    private syncProduct = new SyncProduct();
    private syncPrice = new SyncPrice();
    private produtoApi = new ProdutoApiRepository();
    private syncStock = new SyncStock();


    /**  controlador responsavel por gerar o vinculo do produto e enviar o estoque
     *função ideal para clientes que ja possuem produtos cadastrados no bling   
    */
    async geraVinculo(req: Request, res: Response) {

        const produtoSelecionados: string[] = req.body.produtos;

        // configurações para envio das informações
        let objConfig = new ApiConfigRepository();
        let dadosConfig = await objConfig.buscaConfig();

        // contem o valor do parametro de envio de estoque ( 0: nao enviar estoque, 1: enviar o estoque) 
        const envEstoque = Number(dadosConfig[0].enviar_estoque);

        // contem o valor do parametro de envio de preco ( 0: nao enviar preco, 1: enviar o preco) 
        const envPreco = Number(dadosConfig[0].enviar_precos)
        // tabela onde é feita a consulta dos precos a serem enviados
        const tabela_preco = Number(dadosConfig[0].tabela_preco);

        let responseIntegracao

        if (Array.isArray(produtoSelecionados)) {

            for (const i of produtoSelecionados) {

                const codigoSistema: number = parseInt(i);
                const produtoSincronizado = await this.produtoApi.findByCodeSystem(parseInt(i));

                const resultSaldoProduto = await this.produto.buscaEstoqueReal(codigoSistema, 1)
                const saldoProduto = resultSaldoProduto[0].ESTOQUE;
                const data_estoque = resultSaldoProduto[0].DATA_RECAD;

                const arrProductSystem = await this.produto.buscaProduto(codigoSistema)
                const productSystem = arrProductSystem[0];

                const data_recad_sistema = productSystem.DATA_RECAD

                const resultDeposito = await this.produtoApi.findDefaultDeposit();
                let idDepositoBling;
                if (resultDeposito.length > 0) {
                    idDepositoBling = resultDeposito[0].Id_bling;
                } else {
                    idDepositoBling = await this.syncStock.getDeposit();
                }

                //verifica se ja foi enviado, consultando o banco da integração
                if (produtoSincronizado.length > 0) {
                    let resultPostEstoque
                    await this.delay(1000);
                    let msgRetorno;

                    if (envEstoque > 0) {
                        resultPostEstoque = await this.syncStock.postEstoque(produtoSincronizado[0].Id_bling, saldoProduto, idDepositoBling, produtoSincronizado[0].codigo_sistema, data_estoque)
                        if (resultPostEstoque && resultPostEstoque.msg) {
                            msgRetorno = resultPostEstoque.msg;
                        }
                    }
                    if (envPreco > 0) {

                        let arrPreco = await this.produto.buscaPreco(codigoSistema, tabela_preco)
                        let resultEnvPreco = await this.syncPrice.postPrice(produtoSincronizado[0].Id_bling, produtoSincronizado[0].codigo_sistema, tabela_preco);
                        if (resultEnvPreco && resultEnvPreco.msg) {
                            msgRetorno = resultEnvPreco.msg;
                        }
                    }

                    responseIntegracao = msgRetorno;

                } else {
                    // verifica se o produto/variação existe no bling
                    await this.delay(1000);

                    let resultVinculo = await this.syncProduct.getVinculoProduto({ codigo: codigoSistema, data_recad_sistema })
                    //     console.log('Resultado do vinculo : ', resultVinculo)
                    if (resultVinculo) {

                        if (resultVinculo?.ok) {
                            await this.delay(1000);

                            let prodVinculo;
                            let resultEstoque;
                            let msgRetorno;
                            if (envEstoque > 0) {
                                if (resultVinculo?.produto !== null) {
                                    prodVinculo = resultVinculo?.produto
                                    resultEstoque = await this.syncStock.postEstoque(prodVinculo.id_bling, saldoProduto, idDepositoBling, prodVinculo?.codigo_sistema, data_estoque)
                                    if (resultEstoque && resultEstoque.msg) {
                                        msgRetorno = resultEstoque.msg;
                                    }
                                }
                            }

                            if (envPreco > 0) {
                                if (resultVinculo?.produto !== null) {
                                    let arrPreco = await this.produto.buscaPreco(codigoSistema, tabela_preco)
                                    let resultEnvPreco = await this.syncPrice.postPrice(produtoSincronizado[0].Id_bling, produtoSincronizado[0].codigo_sistema, tabela_preco);

                                    if (resultEnvPreco && resultEnvPreco.msg) {
                                        msgRetorno = resultEnvPreco.msg;
                                    }
                                }
                            }

                            responseIntegracao = msgRetorno
                        } else {
                            responseIntegracao = resultVinculo.msg;
                        }
                    }

                }
            }

        } else {
            console.log(" é necessario que seja informado um array com os codigos dos produtos")
        }
        return res.status(200).json({ msg: responseIntegracao })
    }





    async enviaProduto(req: Request, res: Response) {
        const produtoSelecionados: string[] = req.body.produtos;
        let arrResult = []
        for (const i of produtoSelecionados) {
            let result: any = await this.syncProduct.postOrPutProductBling(Number(i), false);
            if (result.resultados) {
                arrResult.push(result.resultados)
            }

        }

        res.status(200).json({ resultados: arrResult.toString() })
    }


    /**
     * envia ou atualiza um produto no bling
     *    
    async enviaProduto(req: Request, res: Response) {
            const produtoSelecionados: string[] = req.body.produtos;

            if (!Array.isArray(produtoSelecionados) || produtoSelecionados.length === 0) {
                console.log("É necessário que seja informado um array com os códigos dos produtos.");
                return res.status(400).json({ msg: "É necessário que seja informado um array com os códigos dos produtos." });
            }
            
                        // configurações para envio das informações
                    let objConfig  = new ApiConfigRepository();
                    let dadosConfig = await objConfig.buscaConfig();

                    // contem o valor do parametro de envio de estoque ( 0: nao enviar estoque, 1: enviar o estoque) 
                    const envEstoque = Number(dadosConfig[0].enviar_estoque);

                    // contem o valor do parametro de envio de preco ( 0: nao enviar preco, 1: enviar o preco) 
                    const envPreco = Number( dadosConfig[0].enviar_precos)
                    // tabela onde é feita a consulta dos precos a serem enviados
                    const tabela_preco = Number( dadosConfig[0].tabela_preco);

                // setor onde será buscado o saldo de estoque 
                    const setor = dadosConfig[0].setor    

            const resultadosIntegracao: any[] = [];

            for (const codigoStr of produtoSelecionados) {
                let resultadoOperacao: any = { codigo: codigoStr, success: false, msg: "Operação não concluída." };
                try {
                    const codigoSelecionado: number = parseInt(codigoStr);
                    if (isNaN(codigoSelecionado)) {
                        console.log(`Código inválido fornecido: ${codigoStr}`);
                        resultadoOperacao = { codigo: codigoStr, success: false, msg: `Código inválido: ${codigoStr}` };
                        resultadosIntegracao.push(resultadoOperacao);
                        continue; 
                    }

                    console.log(`Processando envio/atualização do produto código: ${codigoSelecionado}`);
                    //  tenta buscar o produto selecionado pelo usuario na tabela da integração. 
                    const arrProdutoSincronizado = await this.produtoApi.findByCodeSystem(codigoSelecionado);
                    // busca o item no banco de dados do sistema
                    const arrProdSelected = await this.produto.buscaProduto(codigoSelecionado);

                    if (!arrProdSelected || arrProdSelected.length === 0) {
                        resultadoOperacao = { codigo: codigoSelecionado, success: false, msg: `Produto ${codigoSelecionado} não encontrado no sistema de origem.` };
                        console.log(resultadoOperacao.msg);
                        resultadosIntegracao.push(resultadoOperacao.msg);
                        continue;
                    }
                    // extrai o produto do array 
                    const prodSelected = arrProdSelected[0];
                    const arrCategoria = await this.categoriaRepository.buscaCategoriaApi(prodSelected.GRUPO);
                    if (!arrCategoria || arrCategoria.length === 0) {
                        resultadoOperacao = { codigo: codigoSelecionado, success: false, msg: `Categoria código: ${prodSelected.GRUPO}  do produto  ${codigoSelecionado}  ainda não foi enviada para o Bling.   ` };
                        console.log(resultadoOperacao.msg);
                        resultadosIntegracao.push(resultadoOperacao.msg);
                        continue;
                    }

                    // processa o produto retornando os dados do produto de acordo com o que a api do bling esta esperando.
                    const produtoBling = await this.produtoMapper.postProdutoMapper(prodSelected, envPreco,tabela_preco );
                    
                    await this.delay(1000);  
                    // se o produto selecionado for encontrado, faz a atualização.
                    if (arrProdutoSincronizado.length > 0) {
                        const produtoSincronizado = arrProdutoSincronizado[0];
                        console.log(`Produto ${codigoSelecionado} já existe no Bling (ID: ${produtoSincronizado.Id_bling}). Atualizando...`);
                        
                        await this.delay(1000);  
                        const responsePutProduto = await this.syncProduct.putProduto( produtoSincronizado.Id_bling  ,produtoBling, envEstoque,  envPreco, tabela_preco, setor);  
                        resultadoOperacao = { codigo: codigoSelecionado, ...responsePutProduto }; 
                    } else {
                    // produto nao foi enviado, será feito o envio    
                        console.log(`Produto ${codigoSelecionado} não encontrado no Bling. Enviando como novo...`);
                        await this.delay(1000); 

                        const responsePostProduto = await this.syncProduct.postProduto(produtoBling, prodSelected, envEstoque);  
                        resultadoOperacao = { codigo: codigoSelecionado, ...responsePostProduto }; 
                        console.log(`Resultado do envio do novo produto ${codigoSelecionado}: ${JSON.stringify(resultadoOperacao)}`);
                    }
                    resultadosIntegracao.push(resultadoOperacao.msg);

                } catch (error: any) {
                    console.error(`Erro crítico ao processar produto ${codigoStr} em enviaProduto:`, error);
                    resultadoOperacao = { codigo: codigoStr, success: false, msg: `Erro interno crítico ao processar produto ${codigoStr}: ${error.message || error}` };
                    resultadosIntegracao.push(resultadoOperacao.msg);
                }
            }
            console.log("Processamento de envio/atualização de produtos concluído.");
            console.log({ resultados: resultadosIntegracao.toString() })
            return res.status(200).json({ resultados: resultadosIntegracao.toString() });
       }
  
*/
}
