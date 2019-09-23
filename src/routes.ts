import { Router } from 'express';
import { ItemsController } from './itemsController';

export const routes = Router();
routes.get('/:serverName/items/:id', ItemsController.getSingleItem);
routes.get('/config', ItemsController.ServerConfig);
routes.get('/:serverName/items', ItemsController.allItems);
routes.get('/:serverName/items/:id/quantity', ItemsController.quantity);
routes.post('/:serverName/items/:id/calculate-price', ItemsController.price);
routes.post("/config", ItemsController.setConfig);
