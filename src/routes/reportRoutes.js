import { Hono } from 'hono';
import controller from '../controllers/reportController.js';

const router = new Hono();

router.get('/', controller.listReports);
router.get('/:folio', controller.getReport);
router.post('/', controller.createReport);
router.put('/:folio', controller.updateReport);
router.patch('/:folio/status', controller.updateReportStatus);

export default router;

