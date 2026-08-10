// Vercel Serverless Function
// Receives lead form submissions from the browser and forwards them to
// rndCRM's Web Intelligence Tracking lead endpoint. The CRM apiSecret lives
// only in this server-side env var — it must never reach client-side code.
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  }

  const { CRM_WIT_TRACKING_ID, CRM_WIT_DOMAIN, CRM_WIT_SECRET } = process.env;
  if (!CRM_WIT_TRACKING_ID || !CRM_WIT_DOMAIN || !CRM_WIT_SECRET) {
    console.error('wit-lead: missing CRM_WIT_TRACKING_ID / CRM_WIT_DOMAIN / CRM_WIT_SECRET env vars');
    return res.status(500).json({ success: false, error: 'Server is not configured to accept leads right now.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ success: false, error: 'Invalid request body.' });
    }
  }
  body = body || {};

  const name = (body.name || '').trim();
  const companyName = (body.companyName || '').trim();
  const email = (body.email || '').trim();
  const phone = (body.phone || '').trim();
  const debtAmount = (body.debtAmount || '').trim();
  const message = (body.message || '').trim();
  const contactPreference = (body.contactPreference || '').trim();
  const formSource = (body.formSource || '').trim();
  const visitorId = (body.visitorId || '').trim();
  const sessionId = (body.sessionId || '').trim();

  if (!name) {
    return res.status(400).json({ success: false, error: 'Name is required.' });
  }
  if (!email && !phone) {
    return res.status(400).json({ success: false, error: 'Email or phone is required.' });
  }

  const domain = CRM_WIT_DOMAIN.replace(/^https?:\/\//, '').replace(/\/+$/, '');

  const customFields = {};
  if (debtAmount) customFields.debtValue = debtAmount;
  if (message) customFields.message = message;
  if (contactPreference) customFields.contactPreference = contactPreference;
  if (formSource) customFields.formSource = formSource;

  const crmPayload = {
    trackingId: CRM_WIT_TRACKING_ID,
    apiSecret: CRM_WIT_SECRET,
    visitorId: visitorId || undefined,
    sessionId: sessionId || undefined,
    companyName: companyName || name,
    contactPerson: name,
    email,
    phone,
    dealValue: 0,
    ...(Object.keys(customFields).length ? { customFields } : {})
  };

  try {
    const crmResponse = await fetch(`https://${domain}/api/wit/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(crmPayload)
    });

    if (!crmResponse.ok) {
      const errText = await crmResponse.text().catch(() => '');
      console.error('wit-lead: CRM rejected lead', crmResponse.status, errText);
      return res.status(502).json({ success: false, error: 'Could not submit your enquiry. Please try again or email us directly.' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('wit-lead: request to CRM failed', err);
    return res.status(502).json({ success: false, error: 'Could not submit your enquiry. Please try again or email us directly.' });
  }
};
