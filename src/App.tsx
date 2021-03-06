// Prime Themes
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/md-light-deeppurple/theme.css';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import '/node_modules/primeflex/primeflex.css'

// Hooks
import { useState, useRef }  from 'react';

// Serviço de requisição via Axios
import SearchCepService from "./services/search-cep-service";

// Primereact
import { Card }      from 'primereact/card';
import { Toast }     from 'primereact/toast';
import { Column }    from 'primereact/column';
import { Button }    from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { InputMask } from 'primereact/inputmask';

// Models
import { Data }      from './../models/data';

// Função principal onde todos os componentes serão renderizados
function SearchCEP() {
  
  const [info, setInfo] = useState<Array<Data>>([]); // Infos da tabela
  const [historic, setHistoric] = useState(new Map()); // Histórico de ceps pesquisados
  
  const [buttonLoading, setButtonLoading] = useState(false);
  const [buttonCheckIcon, setButtonCheckIcon] = useState("pi pi-check");

  const toast:any = useRef(null); // Toast de messagem de feedback da requisição

  const [cep, setCep] = useState(""); // CEP input
  const onChangeCep = (e: any) => {
      setCep(e.target.value);
  };

  const onFormSubmit = async (e: any) => {
    e.preventDefault();

    setButtonLoading(true);
    setButtonCheckIcon("");
    
    const cepWithoutMask = cep.replace("-", "").replace(".", "");

    // A princípio a requisição deu certo
    let severityToast = "success";
    let summaryToast  = "Requisição concluída";
    let detailToast   = "CEP buscado com sucesso";

    // Verifica se já está no mapa
    let newInfo:any = historic.get(cepWithoutMask);
    if(newInfo != undefined){
      if(newInfo[0].erro){
          severityToast = "error";
          summaryToast  = "Erro na requisição";
          detailToast   = "CEP consultado não foi encontrado na base de dados";
      }

    }else{ // Se não tiver no mapa, faz nova requisição
          
        const serviceCep = new SearchCepService();
        const response = await serviceCep.getInfoCep(cepWithoutMask);

        if(response.erro){
            // Altera a mensagem de feedback
            severityToast = "error";
            summaryToast  = "Erro na requisição";
            detailToast   = "CEP consultado não foi encontrado na base de dados";
            
        }else{
            // Adicionando um novo campo ao data
            response.erro = false;
        }

        // DataTable recebe um array, então transformo a resposta num Array
        newInfo = [response]; 
        
        // Atualiza o histórico
        const _historic = new Map(historic);  // Copia o histórico para outro            
        _historic.set(cepWithoutMask, newInfo);  // Insere a busca no histórico cópia        
        setHistoric(_historic);       // Atualiza o histório original 

    }

    setInfo(newInfo);
    setButtonLoading(false);
    setButtonCheckIcon("pi pi-check");

    // Mensagem de feedback
    toast.current.show({
        severity: severityToast, 
        summary:  summaryToast, 
        detail:   detailToast,
        life: 3000
    });
  }

  return (
    <>
        <Card className = "card shadow-5 border-50 border-round border-1" >
            <div className = "card-container  p-4">
                <h1 className='text-primary font-semibold'>Busca CEP</h1>
                <form onSubmit={onFormSubmit}>
                    <div className='sm:inline-flex'> 
                        <span className = "p-input-icon-left block w-10rem">    
                            <i className = "pi pi-search"></i>
                            <InputMask className='p-inputtext inputfield w-full'
                                id = "cep"
                                value={cep}
                                placeholder = "99.999-999"
                                required
                                mask='99.999-999'
                                onChange={onChangeCep}
                            />
                        </span>
                        <Button className = "p-button-outlined mt-3 block sm:ml-3 sm:mt-0"
                            label = 'Enviar'
                            icon  = {buttonCheckIcon}
                            loading = {buttonLoading}
                            type='submit'
                        />
                    </div>
                </form>
            </div>
            <DataTable 
                value={info} 
                responsiveLayout = "stack"
                emptyMessage = " ">
                <Column field = "cep" header = "CEP"/>
                <Column field = "logradouro" header = "Logradouro"/>
                <Column field = "complemento" header = "Complemento"/>
                <Column field = "bairro" header = "Bairro"/>
                <Column field = "localidade" header = "Localidade"/>
                <Column field = "uf" header = "UF"/>
                <Column field = "ibge" header = "IBGE"/>
                <Column field = "gia" header = "GIA"/>
                <Column field = "ddd" header = "DDD"/>
                <Column field = "siafi" header = "SIAFI"/>
            </DataTable>
            <Toast ref={toast} className="primary"/>
        </Card>
    </>
  );
}

export default SearchCEP;
