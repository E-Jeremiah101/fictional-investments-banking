import express from 'express';
import { getMyAccount } from '../controllers/accountController.js';
import {protect} from '../middleware/authMiddleware.js';

const router = express.Router()
router.get('/user', protect, getMyAccount);

export default router;