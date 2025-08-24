import React, { useEffect, useRef, useState } from 'react';
import LocationTable from '@components/display/LocationTable.jsx';
import icon from '@assets/img/icon.png';
import iconShadow from '@assets/img/icon-shadow.png';
import current from '@assets/img/current.png';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const DEFAULT_CENTER = [10.76285093853062, 106.6824844998954];
const DEFAULT_BOUNDS = [
    [5.5, 99.5],
    [25.5, 112.0],
];

function getDistance(lon1, lat1, lon2, lat2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
}

const getCenter = (cinemas) => {
    if (Array.isArray(cinemas) && cinemas.length > 0 && cinemas[0].location && cinemas[0].location.coordinates) {
        const [lng, lat] = cinemas[0].location.coordinates;
        return [lat, lng];
    }
    return DEFAULT_CENTER;
};

const IntegratedMap = ({
    onClick = () => {},
    selectedCinema = null,
    isOpen = true,
    cinemas = [],
    getAllCinemas = false,
    getAllCinemasClick = () => {
        console.log('Get all cinemas clicked');
    },
    requireCtrlToZoom = false,
}) => {
    const [maxdistance, setMaxDistance] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const [filteredCinemas, setFilteredCinemas] = useState(cinemas);
    const [userLocationMarker, setUserLocationMarker] = useState(null);
    const [distanceCircle, setDistanceCircle] = useState(null);
    const [hoveredCinema, setHoveredCinema] = useState(null);
    const [showZoomTooltip, setShowZoomTooltip] = useState(false);

    const mapRef = useRef(null);
    const leafletMapRef = useRef(null);
    const cinemaMarkersRef = useRef([]);
    const tooltipTimeoutRef = useRef(null);

    // Function to move map to a specific cinema location
    const moveToLocation = (cinema) => {
        if (!leafletMapRef.current || !cinema.location || !cinema.location.coordinates) return;

        const [lng, lat] = cinema.location.coordinates;
        leafletMapRef.current.setView([lat, lng], Math.max(leafletMapRef.current.getZoom(), 16), {
            animate: true,
            duration: 0.5,
        });
    };

    // Handle hovering on cinema cards
    useEffect(() => {
        if (hoveredCinema) {
            moveToLocation(hoveredCinema);
        }
    }, [hoveredCinema]);

    // Filter cinemas based on distance
    useEffect(() => {
        if (isOpen && userLocation && maxdistance !== '') {
            const maxDistNum = Number(maxdistance);
            const newCinemas = cinemas.filter((cinema) => {
                if (!cinema.location || !cinema.location.coordinates) return false;
                const [lng, lat] = cinema.location.coordinates;
                const distance = getDistance(userLocation.coordinates[0], userLocation.coordinates[1], lng, lat);
                return distance <= maxDistNum;
            });
            setFilteredCinemas(newCinemas);
        } else if (isOpen && maxdistance === '') {
            setFilteredCinemas(cinemas);
        }
    }, [maxdistance, userLocation, cinemas, isOpen]);

    // Initialize map
    useEffect(() => {
        if (isOpen && mapRef.current && !leafletMapRef.current) {
            leafletMapRef.current = L.map(mapRef.current, {
                center: getCenter(filteredCinemas),
                zoom: 13, // More reasonable initial zoom
                minZoom: 6,
                maxBounds: DEFAULT_BOUNDS,
                maxBoundsViscosity: 0.6,
                scrollWheelZoom: !requireCtrlToZoom, // Disable scroll wheel zoom if requireCtrlToZoom is true
            });

            leafletMapRef.current.zoomControl.setPosition(window.innerWidth < 768 ? 'bottomright' : 'topright');

            L.tileLayer('https://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', {
                maxZoom: 20,
                subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
                tileSize: 512,
                zoomOffset: -1,
            }).addTo(leafletMapRef.current);
        }

        // Cleanup when component unmounts or isOpen becomes false
        return () => {
            if (!isOpen && leafletMapRef.current) {
                leafletMapRef.current.remove();
                leafletMapRef.current = null;
                cinemaMarkersRef.current = [];
                setUserLocationMarker(null);
                setDistanceCircle(null);
            }
        };
    }, [isOpen, requireCtrlToZoom]);

    // Handle Ctrl+Zoom functionality
    useEffect(() => {
        if (!leafletMapRef.current || !isOpen || !requireCtrlToZoom) return;

        const map = leafletMapRef.current;
        const mapContainer = map.getContainer();

        const handleMouseEnter = () => {
            setShowZoomTooltip(true);
            // Auto-hide tooltip after 3 seconds
            if (tooltipTimeoutRef.current) {
                clearTimeout(tooltipTimeoutRef.current);
            }
            tooltipTimeoutRef.current = setTimeout(() => {
                setShowZoomTooltip(false);
            }, 3000);
        };

        const handleMouseLeave = () => {
            setShowZoomTooltip(false);
            if (tooltipTimeoutRef.current) {
                clearTimeout(tooltipTimeoutRef.current);
            }
        };

        const handleWheel = (e) => {
            if (e.ctrlKey || e.metaKey) {
                // metaKey for Mac Cmd key
                // Allow zoom when Ctrl/Cmd is held
                e.preventDefault(); // Prevent page scroll when zooming
                e.stopPropagation();
                map.scrollWheelZoom.enable();
            } else {
                // Allow page scroll but prevent map zoom when not holding Ctrl/Cmd
                map.scrollWheelZoom.disable();

                setShowZoomTooltip(true);
                if (tooltipTimeoutRef.current) {
                    clearTimeout(tooltipTimeoutRef.current);
                }
                tooltipTimeoutRef.current = setTimeout(() => {
                    setShowZoomTooltip(false);
                }, 2000);

                // Don't preventDefault() here - allow page scroll to continue
            }
        };

        mapContainer.addEventListener('mouseenter', handleMouseEnter);
        mapContainer.addEventListener('mouseleave', handleMouseLeave);
        mapContainer.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            if (mapContainer) {
                mapContainer.removeEventListener('mouseenter', handleMouseEnter);
                mapContainer.removeEventListener('mouseleave', handleMouseLeave);
                mapContainer.removeEventListener('wheel', handleWheel);
            }
            if (tooltipTimeoutRef.current) {
                clearTimeout(tooltipTimeoutRef.current);
            }
        };
    }, [isOpen, requireCtrlToZoom]);

    // Update cinema markers when filteredCinemas changes
    useEffect(() => {
        if (!leafletMapRef.current || !isOpen) return;

        const LocationMarker = L.Icon.extend({
            options: {
                shadowUrl: iconShadow,
                iconUrl: icon,
                iconSize: [25, 41], // Add proper icon size
                iconAnchor: [12, 41], // Center bottom of icon
                shadowSize: [41, 41],
                shadowAnchor: [13, 41],
                popupAnchor: [1, -34],
            },
        });

        // Clear existing cinema markers
        cinemaMarkersRef.current.forEach((marker) => {
            leafletMapRef.current.removeLayer(marker);
        });
        cinemaMarkersRef.current = [];

        // Add new cinema markers
        filteredCinemas.forEach((cinema) => {
            if (cinema.location && cinema.location.coordinates) {
                const [lng, lat] = cinema.location.coordinates;
                const marker = L.marker([lat, lng], { icon: new LocationMarker() }).addTo(leafletMapRef.current);

                marker.bindPopup(`<b>${cinema.name}</b><br/>${cinema.address || ''}`);

                // Add hover event to move map to cinema location
                marker.on('click', () => {
                    leafletMapRef.current.setView([lat, lng], Math.max(leafletMapRef.current.getZoom(), 16), {
                        animate: true,
                        duration: 0.5,
                    });
                });

                cinemaMarkersRef.current.push(marker);
            }
        });
    }, [filteredCinemas, isOpen]);

    // Handle user location functionality (geolocation + marker)

    const GetLocation = () => {
        if (!leafletMapRef.current || !isOpen) return;

        const map = leafletMapRef.current;
        if (navigator.geolocation && filteredCinemas.length > 0) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newUserLocation = {
                        type: 'Point',
                        coordinates: [position.coords.longitude, position.coords.latitude],
                    };

                    // Remove existing user location marker
                    if (userLocationMarker) {
                        map.removeLayer(userLocationMarker);
                    }

                    // Create user location icon
                    const UserLocationIcon = L.Icon.extend({
                        options: {
                            iconUrl: current,
                            iconSize: [40, 40],
                            iconAnchor: [10, 10],
                            popupAnchor: [0, -10],
                        },
                    });

                    // Add new user location marker
                    const lat = newUserLocation.coordinates[1];
                    const lng = newUserLocation.coordinates[0];
                    const newMarker = L.marker([lat, lng], { icon: new UserLocationIcon() }).addTo(map);

                    newMarker.bindPopup('Your Location');
                    setUserLocationMarker(newMarker);
                    setUserLocation(newUserLocation);

                    // Center map on user location
                    map.setView([lat, lng], 15);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000,
                },
            );
        }
    };

    useEffect(() => {
        if (!leafletMapRef.current || !isOpen) return;

        const map = leafletMapRef.current;

        map.on('click', () => GetLocation(map));
        return () => {
            map.off('click', () => GetLocation(map));
        };
    }, [isOpen, filteredCinemas, userLocationMarker]);

    // Handle distance circle visualization
    useEffect(() => {
        if (!leafletMapRef.current || !userLocation || !isOpen) return;

        const map = leafletMapRef.current;
        const lat = userLocation.coordinates[1];
        const lng = userLocation.coordinates[0];

        // Remove existing distance circle
        if (distanceCircle) {
            map.removeLayer(distanceCircle);
        }

        // Add distance circle if maxdistance is set
        if (maxdistance !== '' && !isNaN(Number(maxdistance))) {
            const radiusInMeters = Number(maxdistance) * 1000; // Convert km to meters

            const circle = L.circle([lat, lng], {
                color: '#3b82f6', // Blue color
                fillColor: '#3b82f6',
                fillOpacity: 0.1,
                weight: 2,
                opacity: 0.6,
                radius: radiusInMeters,
            }).addTo(map);

            setDistanceCircle(circle);
        } else {
            setDistanceCircle(null);
        }
    }, [userLocation, maxdistance, isOpen]);

    // Handle zoom limits (only when requireCtrlToZoom is false)
    useEffect(() => {
        if (!leafletMapRef.current || !isOpen || requireCtrlToZoom) return;

        const map = leafletMapRef.current;
        const handleWheel = (e) => {
            const currentZoom = map.getZoom();
            const minZoom = map.getMinZoom();
            const maxZoom = map.getMaxZoom();
            const isZoomingOut = e.deltaY > 0;
            const isZoomingIn = e.deltaY < 0;

            if ((currentZoom <= minZoom && isZoomingOut) || (currentZoom >= maxZoom && isZoomingIn)) {
                e.preventDefault();
                return false;
            }
        };

        const mapContainer = map.getContainer();
        mapContainer.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            if (mapContainer) {
                mapContainer.removeEventListener('wheel', handleWheel);
            }
        };
    }, [isOpen, requireCtrlToZoom]);

    // Handle scroll interference (only when requireCtrlToZoom is false)
    useEffect(() => {
        if (!isOpen || requireCtrlToZoom) return;

        let scrollTimeout = null;

        const handleScroll = () => {
            if (leafletMapRef.current) {
                leafletMapRef.current.scrollWheelZoom.disable();
                leafletMapRef.current.dragging.disable();
            }
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(handleScrollEnd, 300);
        };

        const handleScrollEnd = () => {
            if (leafletMapRef.current) {
                leafletMapRef.current.scrollWheelZoom.enable();
                leafletMapRef.current.dragging.enable();
            }
        };

        document.addEventListener('scroll', handleScroll, { passive: true });
        document.addEventListener('touchend', handleScrollEnd, { passive: true });

        return () => {
            document.removeEventListener('scroll', handleScroll);
            document.removeEventListener('touchend', handleScrollEnd);
            if (scrollTimeout) clearTimeout(scrollTimeout);
        };
    }, [isOpen, requireCtrlToZoom]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="relative flex h-[55vh] w-screen items-start justify-center gap-3 px-4 md:block md:h-[50vh] md:min-h-[260px] md:px-0 lg:h-[70vh] lg:w-[75vw] lg:gap-0">
            <div className="relative z-10 mt-[1%] ml-0 h-[40%] w-[95%] pt-2 md:ml-3 md:h-[98%] md:w-[25%]">
                <LocationTable
                    cinemas={filteredCinemas}
                    curlocation={userLocation}
                    maxdistance={maxdistance}
                    setMaxDistance={setMaxDistance}
                    onClick={onClick}
                    selectedlocation={selectedCinema}
                    onHover={setHoveredCinema}
                    getLocation={GetLocation}
                    getAllCinemas={getAllCinemas}
                    getAllCinemasClick={getAllCinemasClick}
                />
            </div>
            <div ref={mapRef} className="absolute top-0 right-5 left-5 z-0 h-full overflow-auto rounded-xl border-gray-200 md:right-0 md:left-0 md:w-full" />


            {/* Zoom Tooltip */}
            {requireCtrlToZoom && showZoomTooltip && (
                <div className="bg-opacity-80 pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 transform rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white">
                    Hold Ctrl to zoom
                </div>
            )}
        </div>
    );
};

export default IntegratedMap;
