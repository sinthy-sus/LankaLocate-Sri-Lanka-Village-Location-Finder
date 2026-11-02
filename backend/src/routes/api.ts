import express from 'express';
import multer from 'multer';
import { searchLocations, getSearchSuggestions } from '../controllers/searchController.js';
import { 
  getVillageById, 
  getAllProvinces, 
  getProvinceDetail, 
  getAllDistricts, 
  getDistrictDetail, 
  getDSDivisionDetail, 
  getMapLocations 
} from '../controllers/locationController.js';
import { getPlatformStats } from '../controllers/statsController.js';
import { 
  adminLogin, 
  getAdminProfile, 
  getAdminStats, 
  getAdminVillages, 
  createVillage, 
  updateVillage, 
  deleteVillage, 
  importCsvData, 
  exportCsvData 
} from '../controllers/adminController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const router = express.Router();

// Search routes
router.get('/search', searchLocations);
router.get('/search/suggestions', getSearchSuggestions);

// Location hierarchy routes
router.get('/villages/:id', getVillageById);
router.get('/provinces', getAllProvinces);
router.get('/provinces/:codeOrId', getProvinceDetail);
router.get('/districts', getAllDistricts);
router.get('/districts/:codeOrId', getDistrictDetail);
router.get('/ds-divisions/:id', getDSDivisionDetail);
router.get('/map/locations', getMapLocations);

// General platform stats
router.get('/stats', getPlatformStats);

// Admin public routes
router.post('/admin/login', adminLogin);
router.get('/admin/export/csv', exportCsvData);

// Admin protected routes
router.get('/admin/me', authenticateAdmin, getAdminProfile);
router.get('/admin/stats', authenticateAdmin, getAdminStats);
router.get('/admin/villages', authenticateAdmin, getAdminVillages);
router.post('/admin/villages', authenticateAdmin, createVillage);
router.put('/admin/villages/:id', authenticateAdmin, updateVillage);
router.delete('/admin/villages/:id', authenticateAdmin, deleteVillage);
router.post('/admin/import/csv', authenticateAdmin, upload.single('file'), importCsvData);

export default router;
