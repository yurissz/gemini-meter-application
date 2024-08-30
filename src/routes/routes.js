import { Router } from 'express'
import { uploadController } from '../controllers/upload';
import { confirmController } from '../controllers/confirm';
import { listController } from '../controllers/list';

export const route = Router()

route.post("/upload", uploadController)
route.patch("/confirm", confirmController)
route.get("/:id/list/", listController)

