
const express = require('express');
const { getAllCRs, getUserCRs, createCR, updateCRStatus, deleteCR, updateCR } = require('../controllers/crController');

const router = express.Router();

// GET /api/crs - Get all change requests
router.get('/', getAllCRs);

// GET /api/crs/user/:userId - Get CRs for specific user
router.get('/user/:userId', getUserCRs);

// POST /api/crs - Create new change request
router.post('/', createCR);

// PATCH /api/crs/:crId/status - Update CR status
router.patch('/:crId/status', updateCRStatus);

// PUT /api/crs/:crId - Update entire CR
router.put('/:crId', updateCR);

// DELETE /api/crs/:crId - Delete CR
router.delete('/:crId', deleteCR);

module.exports = router;
