import { Request, Response, Router } from "express";

import 'dotenv/config';
import { apiController } from "./controllers/api-config-controller/api-config-controller";
import { CategoriaController } from "./controllers/categoria-controller/categoria-controller";
import { ProdutoController } from "./controllers/produtos-controller/produtos-controller";
import { TokenController } from "./controllers/token-controller/token-controller";
import { ClienteApiRepository } from "./dataAcess/api-cliente-repository/cliente-api-repositoryi";
import { ApiConfigRepository } from "./dataAcess/api-config-repository/api-config-repository";
import { PedidoApiRepository } from "./dataAcess/api-pedido-repository/pedido-api-repository";
import { ProdutoApiRepository } from "./dataAcess/api-produto-repository/produto-api-repository";
import { CategoriaRepository } from "./dataAcess/categoria-repository/categoria-repository";
import { ProdutoRepository } from "./dataAcess/produto-repository/produto-repository";
import { SetorRepository } from "./dataAcess/setor-repository/setor-repository";
import { verificaToken } from "./Middlewares/TokenMiddleware";
import { SyncStock } from "./Services/sync-stock/sync-stock";
import { SyncProduct } from "./Services/sync-products.ts/sync-product";
import { testeNf } from "./__test__/teste-nf";
import { testeNaturezaOperacao } from "./__test__/teste-natureza-operacao";
import { SyncCompany } from "./Services/sync-company/sync-company";

const router = Router();


const produtoRepository = new ProdutoRepository();
const configApi = new apiController();
const produtoApiRepository = new ProdutoApiRepository();
const categoryRepository = new CategoriaRepository();
const apiConfigRepository = new ApiConfigRepository();
const syncEstock = new SyncStock();
const pedidoApiRepository = new PedidoApiRepository();
const clienteApiRepository = new ClienteApiRepository();
const setorRepository = new SetorRepository();

router.get('/', async (req, res) => {
  res.render('index');
})

router.get('/config', async (req, res) => {
  const data = await configApi.buscaConfig();
  const tabelas = await produtoRepository.buscaTabelaDePreco();
  res.render('config', { 'config': data, 'tabelas': tabelas });
})

router.get('/produtos', verificaToken, async (req, res) => {
  const produtos = await produtoApiRepository.buscaTodos();
  const tabelas = await produtoRepository.buscaTabelaDePreco();
  res.render('produtos', { 'produtos': produtos, 'tabelas': tabelas });
})

router.get('/categorias', verificaToken, async (req, res) => {
  const data = await categoryRepository.buscaGrupoIndex()
  res.render('categorias', { 'categorias': data })
})

router.get('/clientes', verificaToken, async (req, res) => {
  const data = await clienteApiRepository.getClientIntegracao()
  console.log(data)
  res.render('clientes', { 'clientes': data })
})


router.get('/configuracoes', async (req, res) => {
  let dadosConfig = await apiConfigRepository.buscaConfig();
  let objProdutos = new ProdutoRepository();
  let tabelasDePreco = await objProdutos.buscaTabelaDePreco();
  let setores = await setorRepository.buscaSetor()
  const client_id = process.env.CLIENT_ID;
  const secret = process.env.CLIENT_SECRET;

  const authorizationUrlApiBling = `https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${client_id}&state=5f8c227b11184e3a0ee2426406429fda`;
  
  res.render('configuracoes', { dados: dadosConfig[0], tabelas: tabelasDePreco, setores: setores , url_authorization: authorizationUrlApiBling})

})

router.post('/api/produtos', verificaToken, async (req: Request, res: Response) => {
  const obj = new ProdutoController()

  let dadosConfig = await apiConfigRepository.buscaConfig();
   
   if (dadosConfig[0].enviar_produtos === 'E') {
     await obj.enviaProduto(req, res);
   } 
   if (dadosConfig[0].enviar_produtos === 'S') {
      await obj.geraVinculo(req, res);
   }
})


router.post('/api/categorias', async (req, res) => {
  let obj = new CategoriaController()

  await obj.postCategory(req, res)

})

router.get('/callback', async (req, res, next) => {
  const apitokenController = new TokenController;
  const token = apitokenController.obterToken(req, res, next);
});


router.get('/pedidos', async (req, res) => {
  let dados = await pedidoApiRepository.findAll();
  res.render('pedidos', { pedidos: dados })
})


router.get('/estoque', verificaToken, async () => {
  let dadosConfig = await apiConfigRepository.buscaConfig();
  if (dadosConfig[0].enviar_estoque > 0) {
    await syncEstock.enviaEstoque();
  }
})
router.get('/depositos', async (req, res) => {
  const produtoApiRepository= new ProdutoApiRepository();
    const depositos = await produtoApiRepository.findDeAllDeposit()
  res.render('depositos' ,{ depositos:depositos})
})
router.post('/ajusteConfig', verificaToken, new apiController().ajusteConfig)

//////////////////////////////////////////////////////////////////////////////////

router.get("/testeNf",async  ( req, res )=>{
    await testeNf();
})

router.get("/testeCompany",async  ( req, res )=>{
 const syncCompany = new SyncCompany();
 
 async function teste(){
     await syncCompany.getBasicDataCompany(); 
 }
 
 teste()
})

router.get("/testeNaturezaOperacao",async  ( req, res )=>{
    await testeNaturezaOperacao();
})

router.get("/teste1", new  SyncProduct().getProduct)

export { router };
