'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { encodePassphrase, generateRoomId, randomString } from '@/lib/client-utils';
export default function PageMeetingOnboarding(props: React.PropsWithChildren<{}>) {
  const router = useRouter();
  const [e2ee, setE2ee] = useState(false);
  const [sharedPassphrase, setSharedPassphrase] = useState(randomString(64));
  const startMeeting = () => {
    if (e2ee) {
      router.push(`/rooms/${generateRoomId()}#${encodePassphrase(sharedPassphrase)}`);
    } else {
      router.push(`/rooms/${generateRoomId()}`);
    }
  };
  return (
    <button
      style={{
        marginTop: '1rem',
        padding: '1rem 2rem',
        color: '#ffffffff',
        background: 'linear-gradient(135deg, #8d8d8b44 0%, #15022059 100%)',
        border: 'none',
        borderRadius: '2rem',
        boxShadow: '0 8px 20px rgba(14, 14, 14, 0.23)',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        outline: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(97, 69, 68, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(118, 75, 162, 0.1)';
      }}
      className="lk-button"
      onClick={startMeeting}
    >
      Start Meetings
    </button>
  );
}
