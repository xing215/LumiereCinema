/**
 * MobileNotSupported Component
 *
 * A wrapper component that automatically detects mobile devices and shows
 * a "not supported" message on mobile while rendering children on desktop.
 *
 * @example
 * // Import the component
 * import MobileNotSupported from '../../components/display/MobileNotSupported.jsx';
 *
 * // Usage as Wrapper Component
 * <MobileNotSupported>
 *   <div>Your desktop-only content here</div>
 *   <SomeDesktopComponent />
 * </MobileNotSupported>
 *
 * // Usage with custom messages
 * <MobileNotSupported
 *   title="Feature Unavailable"
 *   message="This feature requires a desktop browser"
 *   breakpoint={768}
 * >
 *   <DesktopOnlyFeature />
 * </MobileNotSupported>
 */

import React, { useState, useEffect } from 'react';

// Custom hook for mobile detection
const UseMobileDetection = (breakpoint = 1024) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, [breakpoint]);

    return isMobile;
};

const MobileNotSupported = ({
    title = 'Mobile not supported',
    message = 'This screen is not supported on mobile devices.',
    submessage = 'Please switch to a wider screen device for the best experience.',
    recommendation = 'Recommended: Desktop or tablet in landscape mode',
    breakpoint = 1024,
    children = null,
}) => {
    const isMobile = UseMobileDetection(breakpoint);

    if (!isMobile) {
        return children || null;
    }

    return (
        <div className="flex h-full w-full items-center justify-center">
            <div className="max-w-md rounded-xl bg-white/90 px-8 py-6 text-center shadow-lg">
                <div className="mb-4">
                    <svg className="mx-auto h-16 w-16 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                    </svg>
                </div>
                <h2 className="font-unbounded mb-2 text-xl font-bold text-slate-900">{title}</h2>
                <p className="mb-4 text-slate-600">
                    {message}
                    {submessage && (
                        <>
                            <br />
                            {submessage}
                        </>
                    )}
                </p>
                {recommendation && <p className="text-sm text-slate-500">{recommendation}</p>}
            </div>
        </div>
    );
};

export default MobileNotSupported;
