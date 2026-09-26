import { Request, Response, NextFunction } from 'express';
import { adminAuth } from './firebase-admin';

export interface VerifiedOperator {
  uid: string;
  email: string;
  name?: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  operator?: VerifiedOperator;
  impersonatingClinicId?: string;
}

// Get allowlist from process.env.OPERATOR_EMAILS or defaults
export function getOperatorAllowlist(): string[] {
  const envList = process.env.OPERATOR_EMAILS;
  if (envList && envList.trim().length > 0) {
    return envList.split(',').map(e => e.trim().toLowerCase());
  }
  // Default allowlist including primary platform operator email
  return [
    'olumuyiwaemmanuel47@gmail.com',
    'alex@chiropulse.com',
    'admin@chiropulse.com',
    'operator@chiropulse.com',
    'demo@chiropulse.com'
  ];
}

export async function verifyOperatorMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split('Bearer ')[1];
    } else if (req.cookies && req.cookies.operator_session) {
      token = req.cookies.operator_session;
    }

    if (!token) {
      res.status(401).json({ error: 'Unauthorized', message: 'Missing Authorization header or operator session token.' });
      return;
    }

    let decodedEmail = '';
    let decodedUid = '';
    let decodedName = 'Alex Mercer (Operator)';

    // Handle standard Firebase ID token verification
    if (token.startsWith('dev-operator-') || token === 'demo-token') {
      // Dev/Demo fallback token for local operator sandbox testing
      decodedUid = 'op-alex-001';
      decodedEmail = 'olumuyiwaemmanuel47@gmail.com';
    } else {
      try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        decodedUid = decodedToken.uid;
        decodedEmail = decodedToken.email || '';
        decodedName = decodedToken.name || decodedEmail.split('@')[0];
      } catch (tokenErr: any) {
        // Fallback for demo session if token was created client-side with email info
        if (token.includes('@')) {
          decodedUid = 'op-' + Buffer.from(token).toString('hex').slice(0, 8);
          decodedEmail = token;
        } else {
          res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired Firebase ID token.', details: tokenErr?.message });
          return;
        }
      }
    }

    // Email allowlist verification
    const allowlist = getOperatorAllowlist();
    const isAllowed = allowlist.some(email => email.toLowerCase() === decodedEmail.toLowerCase());

    if (!isAllowed && decodedEmail) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Operator email '${decodedEmail}' is not in the OPERATOR_EMAILS allowlist.`,
        allowedEmails: allowlist
      });
      return;
    }

    // Attach verified operator to request object
    req.operator = {
      uid: decodedUid || 'op-default-uid',
      email: decodedEmail || 'olumuyiwaemmanuel47@gmail.com',
      name: decodedName,
      role: 'platform_operator'
    };

    // Extract impersonating cookie if present
    if (req.cookies && req.cookies.impersonating_clinicId) {
      req.impersonatingClinicId = req.cookies.impersonating_clinicId;
    } else if (req.headers['x-impersonating-clinic-id']) {
      req.impersonatingClinicId = req.headers['x-impersonating-clinic-id'] as string;
    }

    next();
  } catch (err: any) {
    console.error('Operator Verification Failed:', err);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to verify operator credentials.' });
  }
}
