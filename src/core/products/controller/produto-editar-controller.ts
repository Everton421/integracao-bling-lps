import { Request, Response } from "express";
import { ProdutoRepository } from "../data/produto-repository";

export class ProdutoEditarController{

    async execute( req:Request, res:Response){

          const codigo = req.params.codigo;

            const produtoRepository = new ProdutoRepository();

        const arrProduto  = await produtoRepository.buscaProduto(Number(codigo));

        const arrEstoque = await produtoRepository.buscaEstoqueReal(Number(codigo));

            let produto = arrProduto[0] as any;

            produto = { ...produto, 'ESTOQUE':arrEstoque[0].ESTOQUE };
    
             res.render('produtos/produto-editar', {  produto : produto   });

    }
}