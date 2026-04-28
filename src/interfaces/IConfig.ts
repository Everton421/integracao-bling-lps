export interface IConfig   { 
Id:number
importar_pedidos:number
enviar_estoque:number
enviar_precos:number
tabela_preco:number
enviar_produtos: 'E'| 'S' | 'N' // S = gerar vinculo do produto | E = faz o envio\atualização do produto
vendedor:number
setor:number
         ult_env_preco? : string | '2000-01-01 00:00:00'
          ult_env_estoque? : string | '2000-01-01 00:00:00'
          ult_env_produto? : string | '2000-01-01 00:00:00'
          caminho_fotos:string
tarefas_cron: number
}
