export interface IProdutoBling{
    codigo:number,
    nome:string,
    situacao: "A" | "I"
    descricaoCurta:string,
    descricaoComplementar:string,
    tipo:string,
    unidade:string,
    preco:number,
    pesoBruto:number,
    formato:string,
    largura:number,
    altura:number,
    profundidade:number,
    dimensoes:dimensoes,
    tributacao:tributacao,
    categoria?:categoria
    midia?:midia
}
interface categoria{
    id:any
}

interface midia{
     imagens :{
         imagensURL :[
            { 
                link:string
            }
        ]
    }
}
interface dimensoes{
    largura:number,
    altura:number,
    profundidade:number,
}
interface tributacao{
    ncm:string | null,
    cest:string | null
}
interface categoria{

}