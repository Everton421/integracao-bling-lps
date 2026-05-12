import { promises } from "form-data";
import { conn, db_vendas } from "../../../database/databaseConfig";
import { PedidoMapper } from "../mapping/pedido-mapper";
import { PedidoApiRepository } from "../data/pedido-api-repository";
import { cad_orca } from "../../../interfaces/cad_orca";

export class PedidoRepository{

	 		
	private mapper = new PedidoMapper();


	/**
	 * 
	 * @param produtos produtos do pedido a serem processados  
	 * @param codigoPedido codigo do pedido
	 * @returns 
	 */
	async cadastraProdutosDoPedido(produtos:any[]  , codigoPedido:any , frete:number , total_produtos:number){
		return new Promise( async (resolve, reject )=>{
				const prodMapper = await  this.mapper.proOrcaMapper(produtos,codigoPedido, frete, total_produtos  );
			 
			for(const prod of prodMapper){
			 const sql = 
			 ` INSERT INTO ${db_vendas}.pro_orca  SET
				orcamento = '${codigoPedido}',
				sequencia = '${ prod.SEQUENCIA}',
				produto = '${prod.PRODUTO}',
				grade = '${prod.GRADE}',
				padronizado ='${prod.PADRONIZADO}',
				complemento = '${prod.COMPLEMENTO}',
				unidade = '${prod.UNIDADE}',   
				item_unid = '${prod.ITEM_UNID}',
				just_ipi = '${prod.JUST_IPI}',
				just_icms = '${prod.JUST_ICMS}',
				just_subst = '${prod.JUST_SUBST}',
				quantidade = '${prod.QUANTIDADE}',
				QTDE_SEPARADA = '${prod.QTDE_SEPARADA}',
				unitario ='${prod.UNITARIO}',
				tabela = '${prod.UNITARIO}',
				preco_tabela = '${prod.UNITARIO}',
				CUSTO_MEDIO = '${prod.CUSTO_MEDIO}',
				ULT_CUSTO = '${prod.ULT_CUSTO}',
				FRETE = '${prod.FRETE}',
				ipi = '${prod.IPI}',
				desconto = '${prod.DESCONTO}'
			`;

			  await conn.query( sql, (error, resultado)=>{
				   if(error){
						   reject(" erro ao inserir produto do orcamento "+ error);
				   }else{
					resolve(resultado)
					   console.log(`produto  inserido com sucesso`);
				   }
				})

			 

			}

			
		})
}

/**
 * 
 * @param parcelas array com as parcelas a serem processadas
 * @param codigoPedido codigo do pedido 
 * @returns 
 */
async cadastraParcelasDoPedido( parcelas:any , codigoPedido:any){
		return new Promise ( async(resolve, reject)=>{
		for(const parcela of parcelas){
		let i =1;
			
			const sql =
			` INSERT INTO ${db_vendas}.par_orca (orcamento, parcela, valor, vencimento, tipo_receb) VALUES 
			('${codigoPedido}','${i}',${parcela.valor}, '${parcela.dataVencimento}', '1');
			`
			await conn.query(sql, (err,result)=>{
				if(err){
					console.log( ' erro ao tentar cadastrar parcelas do pedido ',err  );
			 			reject(err);
				}else{
					//console.log(result)
					resolve(result)
				}
			})
			if(i === parcelas.length){
				return;
			}
			i++;
	 }

		})
		
}

/**
 * 
 * @param pedido pedido a ser registrado nas tabelas do sistema
 * @param cliente codigo do cliente 
 * @param vendedor codigo do vendedor
 * @returns 
 */
async cadastrarPedido( pedido: any , cliente:number, vendedor:number){
	const pedidoApi = new PedidoApiRepository();
	const {
	parcelas,
	itens
	} = pedido;
 
 	const cad_orca =await this.mapper.cadOrcaMapper(pedido, cliente, vendedor, parcelas.length ) 

	let totalProdutos = 0; // Inicializando a variável totalProdutos

			itens.forEach((iten:any) => {
			  totalProdutos += (iten.valor * iten.quantidade) ; // - iten.desconto;
			});
			console.log(totalProdutos); // Exibindo o total dos produtos

let codigoPedido: any;
	return new Promise( async (resolve, reject )=>{
			const sql = 
			` 
			INSERT INTO ${db_vendas}.cad_orca (status,  cliente, total_produtos, desc_prod ,total_geral, data_pedido, valor_frete, situacao, SIT_SEPAR,data_cadastro, hora_cadastro, data_inicio, hora_inicio, vendedor, contato, observacoes, observacoes2, tipo,  NF_ENT_OS, RECEPTOR, VAL_PROD_MANIP, PERC_PROD_MANIP, 
				PERC_SERV_MANIP, REVISAO_COMPLETA, DESTACAR, TABELA, QTDE_PARCELAS, ALIQ_ISSQN, 
				OUTRAS_DESPESAS, PESO_LIQUIDO, BASE_ICMS_UF_DEST, FORMA_PAGAMENTO)
				VALUES (
					'${cad_orca.STATUS}',
					'${cad_orca.CLIENTE}',
					'${cad_orca.TOTAL_PRODUTOS}',
					'${cad_orca.DESC_PROD}',
					'${cad_orca.TOTAL_GERAL}',
					'${cad_orca.DATA_PEDIDO}',
					'${cad_orca.VALOR_FRETE}',
					'${cad_orca.SITUACAO}',
					'${cad_orca.SIT_SEPAR}',
					'${cad_orca.DATA_CADASTRO}',
					'${cad_orca.HORA_CADASTRO}',
					'${cad_orca.DATA_INICIO}',
					'${cad_orca.HORA_INICIO}',
					'${cad_orca.VENDEDOR}',
					'${cad_orca.CONTATO}',
					'${cad_orca.OBSERVACOES}',
					'${cad_orca.OBSERVACOES2}',
					'${cad_orca.TIPO}',
					'${cad_orca.NF_ENT_OS}',
					'${cad_orca.RECEPTOR}',
					'${cad_orca.VAL_PROD_MANIP}',
					'${cad_orca.PERC_PROD_MANIP}',
					'${cad_orca.PERC_SERV_MANIP}',
					'${cad_orca.REVISAO_COMPLETA}',
					'${cad_orca.DESTACAR}',
					'${cad_orca.TABELA}',
					'${cad_orca.QTDE_PARCELAS}',
					'${cad_orca.ALIQ_ISSQN}',
					'${cad_orca.OUTRAS_DESPESAS}',
					'${cad_orca.PESO_LIQUIDO}',
					'${cad_orca.BASE_ICMS_UF_DEST}',
					'${cad_orca.FORMA_PAGAMENTO}'
						);     
			`
		await conn.query(sql, async (err, result)=>{
			if(err){
				reject(" erro ao cadastrar orcamento"+ err);

			}else{

				codigoPedido = result.insertId;
				console.log(codigoPedido);
					 resolve(result);

					 let json = { "Id_bling": pedido.id , "codigo_sistema":codigoPedido , 'situacao': cad_orca.SITUACAO};
                          try{  
                               const result = await pedidoApi.cadastraPedidoApi(json)
                             }catch(err){
                                 
                                 console.log(" erro ao cadastrar na tabela da api"+ err);
                             }
						let resultProdutos;
				try{
					resultProdutos =	await this.cadastraProdutosDoPedido( itens ,codigoPedido, cad_orca.VALOR_FRETE, cad_orca.TOTAL_PRODUTOS  )
				}catch(err){
					console.log(err)
					return
				}
					try{
						await this.cadastraParcelasDoPedido(parcelas,codigoPedido)
					}catch(err){
						console.log("ocorreu um erro ao tentar gravar as parcelas  ", err);
						return;
					}
				
				 }

		})
	})

}

/**
 * obtem todas as informações do pedido contidas na tabela cad_orca 
 * @param codigo codigo do pedido 
 * @returns 
 */
async findByCode( codigo:number ):Promise<cad_orca[]>{
	return new Promise(( resolve, reject ) =>{
		const sql = `SELECT * FROM ${db_vendas}.cad_orca WHERE CODIGO = ${codigo}`;

		conn.query(sql, ( err, result )=>{

				if(err){
					console.log("Erro ao consultar a tabela cad_orca ", err);
					reject(err)
				}else{
					resolve(result)
				}
			})	


	})
}

}
