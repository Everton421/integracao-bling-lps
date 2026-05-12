import ConfigApi from "../../../shared/api";
import {  PedidoRepository } from "../data/pedido-data-acess";
import { PedidoApiRepository } from "../data/pedido-api-repository";
import { SyncClient } from "../../client/services/sync-client";

export class pedidoController{

    private api = new ConfigApi();
    private pedidoApi = new PedidoApiRepository();
    private objPedidoErp = new PedidoRepository();
    private syncClient = new SyncClient();


     delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }



 
}
