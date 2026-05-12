import { IProductSystem } from "../../../interfaces/IProduct";
import { PostFreeImgHost } from "../../imgs/services/post-img-service";
import { IProdutoBling } from "../../../interfaces/IProdutoBling";
import { ProdutoRepository } from "../data/produto-repository";
import { CategoriaApiRepository } from "../../categories/data/categoria-api-repository";

export type IProdutoBlingSemPreco = Omit<IProdutoBling, 'preco'>

export class ProdutoMapper {


  /**
   * 
   * @param produto 
   * @param  sendPrice parametro  de envio de preco ( 0: nao enviar preco, 1: enviar o preco) 
   * @param categoryIdBling id da categoria no bling
   * @param tabela codigo da tabela de preço a ser enviada 
   * @returns 
   */
  async postProdutoMapper(produto: IProductSystem, sendPrice: number, categoryIdBling: number, tabela?: number): Promise<IProdutoBlingSemPreco> {
    return new Promise(async (resolve, reject) => {

      const produtoRepository = new ProdutoRepository();
      const categoriaRepository = new CategoriaApiRepository();
      const freeImgHost = new PostFreeImgHost();
      let preco: number = 0;

      if (sendPrice === 1) {
        const arrPreco = await produtoRepository.buscaPreco(produto.CODIGO, tabela)
        preco = arrPreco[0].PRECO;
      }


      const arrNcm = await produtoRepository.buscaNcm(produto.CODIGO);
      const ncm = arrNcm[0].NCM
      const cod_cest = arrNcm[0].COD_CEST
      const arrUnidades = await produtoRepository.buscaUnidades(produto.CODIGO);
      const unidade = arrUnidades[0].SIGLA
 

      //envio de imagen
      //let links = await imgController.postFoto( produto ) ;
      let links = await freeImgHost.postFoto(produto) as [{ link: string }];
      //

      const post: IProdutoBling = {
        codigo: produto.CODIGO,
        nome: produto.TITULO_MKTPLACE,
        descricaoCurta: produto.DESCR_CURTA_MKTPLACE,
        descricaoComplementar: produto.DESCR_LONGA_MKTPLACE,
        tipo: 'P',
        situacao: 'A',
        unidade: unidade,
        preco: preco,
        pesoBruto: produto.PESO,
        formato: 'S',
        largura: produto.LARGURA,
        altura: produto.ALTURA,
        profundidade: produto.COMPRIMENTO,
        dimensoes: { altura: produto.ALTURA, largura: produto.LARGURA, profundidade: produto.COMPRIMENTO },
        tributacao: { cest: cod_cest, ncm: ncm, },
        midia: {
          imagens: {
            imagensURL: links,
          }
        },
        categoria: {
          id: categoryIdBling
        }
      };
      resolve(post)
    })
  }




}