import { cad_orca } from "../../../interfaces/cad_orca";
import { estruturas } from "../../../interfaces/estrutura-produto-bling";
import { lojaBling } from "../../../interfaces/loja-bling";
import { pro_orca } from "../../../interfaces/pro_orca";
import { ProdutoBling } from "../../../interfaces/produto-bling";
import { produtoPedidoBling } from "../../../interfaces/produto-pedido-bling";
import ConfigApi from "../../../shared/api";
import { DateService } from "../../../shared/utils/date-service";

export class PedidoMapper{
        dateService = new DateService();

 async   cadOrcaMapper( pedido:any, codigoCliente:number, vendedor:number,qtdParcelas:number ){
                      const  api = new ConfigApi();
               await  api.configurarApi();
             const data_cadastro = this.dateService.obterDataAtual();
             const hora_cadastro = this.dateService.obterHoraAtual(); 
                 
             let statusPedido =0;
                        let tipoLoja = '';

                   if(  pedido.loja && pedido.loja.id ){

                      const lojaId = pedido.loja.id;
                        try{

                        const resultArrLoja =   await api.config.get(`/canais-venda/${lojaId}`);
                            const loja = resultArrLoja.data  as lojaBling 
                            console.log(resultArrLoja.data);
                            tipoLoja =  loja.data.tipo.toLowerCase(); 

                        }catch(e:any){ console.log(" err ",e  )

                        }

                        switch (tipoLoja ) {
                            case 'mercadolivre' :
                                statusPedido = 1;
                                break;
                          case 'mercado livre':
                                statusPedido = 1;
                           break;
                           case 'shopee':
                                statusPedido = 2;
                           break;
                            default: 
                            statusPedido = 0;
                                break;
                        }

                     }

                 let situacao = 'AI'
                if( pedido.situacao.id === 9){
                    situacao = 'FI'
                }

             const order:cad_orca = {
                     COD_SITE: pedido.id,
                    STATUS: statusPedido,
                    CLIENTE: codigoCliente,
                    TOTAL_PRODUTOS: pedido.totalProdutos,
                    DESC_PROD:pedido.desconto.valor,
                    TOTAL_GERAL: pedido.total,
                    DATA_PEDIDO:pedido.data,
                    VALOR_FRETE:pedido.transporte.frete,
                    SITUACAO: situacao,
                    SIT_SEPAR: 'I',
                    DATA_CADASTRO:data_cadastro,
                    HORA_CADASTRO:hora_cadastro,
                    DATA_INICIO:data_cadastro,
                    HORA_INICIO:hora_cadastro,
                    VENDEDOR: vendedor,
                    CONTATO: tipoLoja || "",
                    OBSERVACOES:'',
                    OBSERVACOES2:'',
                    TIPO: 1,
                    NF_ENT_OS:'',
                    RECEPTOR:'',
                    VAL_PROD_MANIP: pedido.totalProdutos,
                    PERC_PROD_MANIP:0,
                    PERC_SERV_MANIP:100,
                    REVISAO_COMPLETA:'N',
                    DESTACAR:'N',
                    TABELA:'P',
                    QTDE_PARCELAS:qtdParcelas,
                    ALIQ_ISSQN:0,
                    OUTRAS_DESPESAS: pedido.outrasDespesas,
                    PESO_LIQUIDO:0,
                    BASE_ICMS_UF_DEST:0,
                    FORMA_PAGAMENTO:0,
        }

        return order;
    }

  private delay(ms: number) {
        console.log(`Aguardando ${ms / 1000} segundos para atualizar...`);
        return new Promise(resolve => setTimeout(resolve, ms));
    }

   async proOrcaMapper(produtos:produtoPedidoBling[], codigoPedido:number, frete:number , total_produtos:number   ){
               const  api = new ConfigApi();
               await  api.configurarApi();
         const arrItensProOrca:pro_orca[] = [];
                        let sequencia = 0;

                for( const [ index, produto] of produtos.entries() ){            
                    if(index == 0 ){
                        sequencia = 1 ;
                    }
                        let codigo_produto = produto.codigo;
                            await this.delay(1000)
                    
                            const valorTotalProduto =   produto.quantidade * produto.valor 
                            const fator = valorTotalProduto / total_produtos;

                            const freteUnitario  = fator * frete; 
                            
                        // executa uma consulta para verificar que tipo de produto é 
                    const arrResultCadastroBling  =  await api.config.get(`/produtos?codigo=${produto.codigo}` );

                    const resultCadastroBling = arrResultCadastroBling.data; 
                    if(resultCadastroBling.data.length > 0){

                        // verifica se é uma conposição, se o produto é um kit 
                         if(   resultCadastroBling.data[0]?.formato === 'E'){
                            console.log(`[V] Produto compoe um kit. `);
                            // quantos kits vieram no pedido
                            const quantidade_kit = produto.quantidade;
                            /// se o produto tiver composição, consulta os itens que fazem parte da composição.
                            await this.delay(1000)

                            const resultStructure =  await api.config.get(`/produtos/estruturas/${resultCadastroBling.data[0].id}` );
                                const components:estruturas[] = resultStructure.data.data.componentes  ;

                                    for( const  i of components ){

                                        const quantidade_compoe = i.quantidade;
                                        // quantidade de itens que compoe o kit total do pedido.
                                        const quantidade_composicao = quantidade_compoe * quantidade_kit;
                            
                                            const desconto = produto.desconto / components.length;
                                            const freteComp = freteUnitario / components.length;
                                        await this.delay(1000)

                                    const resultSubProd =  await api.config.get(`/produtos/${i.produto.id}` );
                                            const subProd = resultSubProd.data as ProdutoBling;
                                        if(subProd.data ){
                                                const code = subProd.data.codigo;
                                                const preco = subProd.data.preco;
                                                const unidade = subProd.data.unidade;
                                                // o valor do codigo do produto nao corresponde a um numero
                                                if( isNaN(Number(code)) ){
                                                      console.log(`[X] O valor do codigo do produto nao corresponde a um numero inteiro. valor :[${code}]`);
                                                    continue;
                                                }else{
                                                // o valor é numerico 
                                                    codigo_produto = code;
                                                            const prod:pro_orca ={
                                                            ORCAMENTO:Number(codigoPedido),
                                                            SEQUENCIA:sequencia,
                                                            PRODUTO: Number(codigo_produto),
                                                            GRADE:0,
                                                            PADRONIZADO:0,
                                                            COMPLEMENTO:'',
                                                            UNIDADE: unidade || 'UND',
                                                            ITEM_UNID: 1,
                                                            JUST_IPI:'',
                                                            JUST_ICMS:'',
                                                            JUST_SUBST:'',
                                                            QUANTIDADE: quantidade_composicao,
                                                            QTDE_SEPARADA: quantidade_composicao,
                                                            UNITARIO: preco,
                                                            TABELA: 0,
                                                            PRECO_TABELA:preco,
                                                            CUSTO_MEDIO:0,
                                                            ULT_CUSTO:0,
                                                            FRETE: freteComp,
                                                            IPI:0,
                                                            DESCONTO:desconto
                                                        }
                                                        console.log(prod)

                                                arrItensProOrca.push(prod);
                             sequencia = sequencia + 1;

                                                }

                                        } else{
                                            console.log(`produto nao encontrado ou não possui código registrado no bling.`)
                                        }
                                    }

                        }
                        
                        if(   resultCadastroBling.data[0]?.formato === 'P' ||  resultCadastroBling.data[0]?.formato === 'S' ){
                            const prod:pro_orca ={
                                    ORCAMENTO:codigoPedido,
                                    SEQUENCIA:sequencia,
                                    PRODUTO: Number(codigo_produto),
                                    GRADE:0,
                                    PADRONIZADO:0,
                                    COMPLEMENTO:'',
                                    UNIDADE:produto.unidade,
                                    ITEM_UNID: 1,
                                    JUST_IPI:'',
                                    JUST_ICMS:'',
                                    JUST_SUBST:'',
                                    QUANTIDADE: produto.quantidade,
                                    QTDE_SEPARADA: produto.quantidade,
                                    UNITARIO: produto.valor,
                                    TABELA: 0,
                                    PRECO_TABELA:produto.valor,
                                    CUSTO_MEDIO:0,
                                    ULT_CUSTO:0,
                                    FRETE:freteUnitario,
                                    IPI:0,
                                    DESCONTO: produto.desconto
                                }
                                
                                arrItensProOrca.push(prod);
                            sequencia = sequencia + 1;

                            }
                     }else{
                        console.log(`[X] Não foi possivel encontrar o produto ${produto.codigo} no bling. `)
                     }
                }
                return arrItensProOrca;
} 
} 