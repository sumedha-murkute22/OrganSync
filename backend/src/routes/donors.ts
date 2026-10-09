import { Router, Response } from 'express';
import { store, Donor } from '../database/store';
import { AuthenticatedRequest, requireRoles } from '../middleware/auth';

const router = Router();

// GET all donors
router.get('/', (req, res) => {
  res.json({ donors: store.donors });
});

// GET single donor by ID
router.get('/:id', (req, res) => {
  const donor = store.donors.find(d => d.id === req.params.id);
  if (!donor) {
    res.status(404).json({ error: 'Donor not found' });
    return;
  }
  res.json({ donor });
});

// POST register new donor (restricted to Coordinator and Physician)
router.post('/', requireRoles('System Administrator', 'Transplant Coordinator', 'Transplant Physician'), (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const newDonor: Donor = {
    id: `DNR-${store.donors.length + 804}`,
    donorCategory: data.donorCategory || 'Deceased',
    age: Number(data.age) || 30,
    gender: data.gender || 'Other',
    bloodGroup: data.bloodGroup || 'O+',
    hospital: data.hospital || req.user?.hospital || 'St. Jude National Transplant Institute',
    city: data.city || 'Seattle, WA',
    consentStatus: data.consentStatus || (data.donorCategory === 'Living' ? 'Living Donor Independent Assessment Approved' : 'Authorized'),
    screeningStatus: 'Completed',
    infectiousScreening: data.infectiousScreening || { hiv: 'Negative', hbv: 'Negative', hcv: 'Negative', cmv: 'Negative', ebv: 'Negative' },
    responsiblePhysician: req.user?.fullName || 'Dr. Katherine Bell, MD',
    registrationDate: new Date().toISOString(),
    status: 'Authorized',
    organsDonated: [],
  };

  store.donors.unshift(newDonor);

  store.recordAuditEvent(
    'DONOR_REGISTERED',
    req.user?.fullName || 'System',
    req.user?.role || 'Transplant Coordinator',
    newDonor.hospital,
    newDonor.id,
    `Registered ${newDonor.donorCategory} donor ${newDonor.id} (${newDonor.bloodGroup}, Age ${newDonor.age}). Consent: ${newDonor.consentStatus}`
  );

  res.status(201).json({ donor: newDonor });
});

export default router;
