import { Router, Response } from 'express';
import { store, Organ } from '../database/store';
import { AuthenticatedRequest, requireRoles } from '../middleware/auth';

const router = Router();

// GET all organs with optional filters
router.get('/', (req, res) => {
  const { type, status, hospital } = req.query;
  let result = [...store.organs];

  if (type) {
    result = result.filter(o => o.organType.toLowerCase() === (type as string).toLowerCase());
  }
  if (status) {
    result = result.filter(o => o.status.toLowerCase() === (status as string).toLowerCase());
  }
  if (hospital) {
    result = result.filter(o => o.hospital.toLowerCase().includes((hospital as string).toLowerCase()));
  }

  res.json({ organs: result });
});

// GET single organ by ID
router.get('/:id', (req, res) => {
  const organ = store.organs.find(o => o.id === req.params.id);
  if (!organ) {
    res.status(404).json({ error: 'Organ not found' });
    return;
  }
  res.json({ organ });
});

// POST register new organ offer
router.post('/', requireRoles('System Administrator', 'Transplant Coordinator'), (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const maxShelf =
    data.maxShelfLifeHours ||
    (data.organType === 'Heart' ? 6 : data.organType === 'Lungs' ? 8 : data.organType === 'Liver' ? 12 : 30);

  const newOrgan: Organ = {
    id: `ORG-${data.organType.substring(0, 3).toUpperCase()}-${store.organs.length + 101}`,
    donorId: data.donorId || 'DNR-801',
    donorName: data.donorName || 'Authorized Donor Record',
    donorAge: Number(data.donorAge) || 30,
    donorGender: data.donorGender || 'Male',
    organType: data.organType || 'Kidney',
    bloodGroup: data.bloodGroup || 'O+',
    hlaMarkers: data.hlaMarkers || { hlaA: 'A*02', hlaB: 'B*07', hlaDR: 'DRB1*15' },
    hlaScore: Number(data.hlaScore) || 85,
    hospital: data.hospital || req.user?.hospital || 'St. Jude National Transplant Institute',
    city: data.city || 'Seattle, WA',
    coordinates: data.coordinates || { lat: 47.6062, lng: -122.3321 },
    donationTime: new Date().toISOString(),
    maxShelfLifeHours: maxShelf,
    shelfLifeRemainingHours: maxShelf,
    preservationMethod: data.preservationMethod || 'Static Cold Storage',
    preservationTempC: Number(data.preservationTempC) || 4.0,
    viabilityStatus: data.viabilityStatus || 'Optimal',
    clinicalSpecs: data.clinicalSpecs || {},
    hasMandatoryTests: data.hasMandatoryTests ?? true,
    missingTests: data.missingTests || '',
    status: 'Available',
  };

  store.organs.unshift(newOrgan);

  store.recordAuditEvent(
    'ORGAN_OFFER_REGISTERED',
    req.user?.fullName || 'Coordinator',
    req.user?.role || 'Transplant Coordinator',
    newOrgan.hospital,
    newOrgan.id,
    `Registered ${newOrgan.organType} offer ${newOrgan.id} (${newOrgan.bloodGroup}, Shelf Life ${newOrgan.maxShelfLifeHours}h). Viability: ${newOrgan.viabilityStatus}`
  );

  res.status(201).json({ organ: newOrgan });
});

// PATCH update organ status or viability
router.patch('/:id', requireRoles('System Administrator', 'Transplant Coordinator', 'Transplant Surgeon'), (req: AuthenticatedRequest, res: Response) => {
  const organ = store.organs.find(o => o.id === req.params.id);
  if (!organ) {
    res.status(404).json({ error: 'Organ not found' });
    return;
  }

  const { status, viabilityStatus, preservationTempC, shelfLifeRemainingHours } = req.body;
  const oldStatus = organ.status;

  if (status) organ.status = status;
  if (viabilityStatus) organ.viabilityStatus = viabilityStatus;
  if (preservationTempC !== undefined) organ.preservationTempC = Number(preservationTempC);
  if (shelfLifeRemainingHours !== undefined) organ.shelfLifeRemainingHours = Number(shelfLifeRemainingHours);

  store.recordAuditEvent(
    'ORGAN_STATUS_MODIFIED',
    req.user?.fullName || 'Clinician',
    req.user?.role || 'Transplant Coordinator',
    organ.hospital,
    organ.id,
    `Updated organ ${organ.id}: Status [${oldStatus} -> ${organ.status}], Viability: ${organ.viabilityStatus}`
  );

  res.json({ organ });
});

export default router;
