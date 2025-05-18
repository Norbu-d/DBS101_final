import { Hono } from 'hono';
import { 
  getLostItems, 
  getLostItem, 
  createLostItem, 
  updateLostItem, 
  deleteLostItem 
} from '../controllers/lostItemController.js';

const router = new Hono();

router
  .get('/', getLostItems)
  .get('/:id', getLostItem)
  .post('/', createLostItem)
  .put('/:id', updateLostItem)
  .delete('/:id', deleteLostItem);

export default router;