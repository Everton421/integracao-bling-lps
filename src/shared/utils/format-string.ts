export class FormatString { 
     static formatDescricao(descricao: string): string {
     return descricao.replace(/'/g, '');
    }

}