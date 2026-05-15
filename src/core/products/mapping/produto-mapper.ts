import { IProductSystem } from "../../../interfaces/IProductSystem";
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
 static async postProdutoMapper(produto: IProductSystem, sendPrice: number, categoryIdBling: number, tabela?: number): Promise<IProdutoBlingSemPreco> {
    return new Promise(async (resolve, reject) => {

      const produtoRepository = new ProdutoRepository();
      const categoriaRepository = new CategoriaApiRepository();
      const freeImgHost = new PostFreeImgHost();
      let preco: number = 0;

      if (sendPrice === 1) {
        const arrPreco = await produtoRepository.buscaPreco(produto.CODIGO, tabela)
        preco = arrPreco[0].PRECO;
      }

          const arrMarca = await produtoRepository.buscaMarcaProduto(produto.MARCA)

      const marca = arrMarca && arrMarca.length > 0 ?  arrMarca[0].DESCRICAO : '';

      const arrNcm = await produtoRepository.buscaNcm(produto.CODIGO);
      
      const ncm = arrNcm && arrNcm.length > 0 ? arrNcm[0].NCM : null;
      const cod_cest = arrNcm && arrNcm.length > 0 ? arrNcm[0].COD_CEST : null;
      
      const arrUnidades = await produtoRepository.buscaUnidades(produto.CODIGO);
      const unidade = arrUnidades[0].SIGLA
    const  gtin = produto.NUM_FABRICANTE
      //envio de imagen
      //let links = await imgController.postFoto( produto ) ;
      let links = await freeImgHost.postFoto(produto) as [{ link: string }];
      //

      const post: IProdutoBling = {
        codigo: produto.CODIGO,
        nome: produto.DESCRICAO,
        descricaoCurta: produto.APLICACAO,
        descricaoComplementar: produto.DESCR_LONGA_MKTPLACE || '',
        tipo: 'P',
        marca: marca,
        situacao: 'A',
        gtin:gtin ,
        unidade: unidade,
        tipoProducao:'T',
        volumes: produto.QTDE_VOL,
        preco: preco,
        pesoBruto: produto.PESO,
        formato: 'S',
        largura: produto.LARGURA,
        altura: produto.ALTURA,
        profundidade: produto.COMPRIMENTO,
        dimensoes: { altura: produto.ALTURA, largura: produto.LARGURA, profundidade: produto.COMPRIMENTO  ,unidadeMedida :1},
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