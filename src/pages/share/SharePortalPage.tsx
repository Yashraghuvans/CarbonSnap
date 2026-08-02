/**
 * CarbonSnap — pages/share/SharePortalPage
 * FSD: page layer. Public, unauthenticated supplier data portal reached
 * via /share/:token. Lets suppliers verify and review the data their
 * buyers share with them.
 */
import React from 'react';
import { SupplierSharePortal } from '../../features/supply-chain/SupplierSharePortal';

interface SharePortalPageProps {
  token: string;
  onClosePortal: () => void;
}

export const SharePortalPage: React.FC<SharePortalPageProps> = ({ token, onClosePortal }) => {
  return <SupplierSharePortal token={token} onClosePortal={onClosePortal} />;
};
