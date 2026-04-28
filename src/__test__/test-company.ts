import { SyncCompany } from "../Services/sync-company/sync-company";


const syncCompany = new SyncCompany();

async function teste(){
    await syncCompany.getBasicDataCompany(); 
}

teste()