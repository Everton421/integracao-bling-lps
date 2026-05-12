import { conn, db_publico } from "../../../database/databaseConfig"

export class ClienteRepository {
    async buscaPorCnpj(cnpj: string) {
        const value = this.formatCpf(cnpj);

        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM ${db_publico}.cad_clie WHERE CPF = ?`; // Usando um placeholder '?'
            conn.query(sql, [value], (err, result) => {
                if (err) {
                    reject(err);
                } else {    
                        resolve(result);
                }
            });
        });
    }

    async validaCadastro(cnpj: string) {
        const value = this.formatCpf(cnpj);
      
        return new Promise<boolean>( async (resolve, reject) => {
            const sql = `SELECT * FROM ${db_publico}.cad_clie WHERE CPF = ?`; // Usando um placeholder '?'
            await conn.query(sql, [value], (err, result) => {
                if (err) {
                    console.log(err);
                    reject(false)
                } else {    
                    if(result.length > 0){
                        resolve(true);
                    }else{
                        resolve(false);
                    }
                }
            });
        });
    }
    
    formatCpf(cpf: string): string {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length === 11) {
            return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        } else if (cpf.length === 14) {
            return cpf.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        } else {
            throw new Error('CPF inválido');
        }
    }

    formatCep( cep:string): string{

        cep = cep.replace(/\D/g, '');

        if( cep.length === 8  ){
            return cep.replace(/(\d{5})(\d{3})/,'$1-$2'); 
        }else{
            throw new Error('cep invalido')
        }

}

formatCelular( celular:string ) :string{
    celular = celular.replace(/\D/g, '');

    if( celular.length === 11 ){
        return celular.replace(/(\d{2})(\d{5})(\d{4})/ , '($1) $2-$3');
    }else if( celular.length === 10 ){
        return celular.replace(/(\d{2})(\d{4})(\d{4})/ , '($1) $2-$3');
       }else{
        throw new Error('celular Invalido')
       }
    
}

formatTelefone( telefone:string ){
    telefone= telefone.replace(/\D/g, '');

if( telefone.length === 10 ){
    return telefone.replace(/(\d{2})(\d{4})(\d{4})/ ,'($1) $2-$3');
}

}

data(){
    const now = new Date(); // Obtém a data e hora atuais
    const dia = String(now.getDate()).padStart(2, '0');
    const mes = String(now.getMonth() + 1).padStart(2, '0');
    const ano = now.getFullYear();

    const hora = String(now.getHours()).padStart(2, '0'); // Adiciona um zero à esquerda se for menor que 10
    const minuto = String(now.getMinutes()).padStart(2, '0'); // Adiciona um zero à esquerda se for menor que 10
    const segundo = String(now.getSeconds()).padStart(2, '0'); // Adiciona um zero à esquerda se for menor que 10

    const dataHoraInsercao = `${ano}-${mes}-${dia} ${hora}:${minuto}:${segundo}`;
    const dataInsercao = `${ano}-${mes}-${dia}`; 
    return {dataHoraInsercao, dataInsercao};
}

async cadastrarClientErp(json: any) {
    const buscaDataAtual = this.data().dataInsercao;

    const {
        nome,
        numeroDocumento,
        situacao,
        telefone,
        celular,
        fantasia,
        tipo,
        indicadorIe,
        ie,
        rg,
        orgaoEmissor,
        email,
        endereco 
    } = json;

    const  { geral:{ cep, bairro, municipio, uf, numero, complemento,  } }  = endereco; // Corrigido

        const rua = json.endereco.geral.endereco;

    const cpf = this.formatCpf(numeroDocumento);
    
    let celularClient:string;
    let cepClient:string;

    cepClient = this.formatCep(cep);
  
    
    
    const telefoneClient = this.formatTelefone(telefone)
    
        return new Promise(async (resolve, reject) => {
        const sql = `
            INSERT INTO ${db_publico}.cad_clie (
                nome,
                apelido,
                fis_jur,
                cpf,
                rg,
                email_fiscal,
                email,
                senha,
                observacoes,
                historico,
                bloq_motivo,
                obs_bancaria,
                obs_comercial1,
                obs_comercial2,
                obs_comercial3,
                obs_pessoal,
                endereco,
                numero,
                complemento,
                bairro,
                cidade,
                ESTADO,
                cep,
                telefone_res,
                celular,
                data_cadastro,
                consumidor_final,
                ativo,
                no_site
            ) VALUES (
                '${nome}',
                '${nome}',
                '${tipo}',
                '${cpf}',
                '${ie}',
                '${email}',
                '${email}',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '${rua}',
                '${numero}',
                '${complemento}',
                '${bairro}',
                '${municipio}',
                '${uf}',
                '${cepClient}',
                '${telefone}',
                '${celular}',
                '${buscaDataAtual}',
                'S',
                'S',
                'S'
            );
        `;

        await conn.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}







}