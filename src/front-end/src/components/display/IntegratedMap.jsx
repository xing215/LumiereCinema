import React, { useEffect, useRef, useState } from "react";
import LocationTable from "@components/display/LocationTable.jsx";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const DEFAULT_CENTER = [10.76285093853062, 106.6824844998954];
const DEFAULT_BOUNDS = [
    [5.5, 99.5],
    [25.5, 112.0],
];

const IntegratedMap = ({onClick=()=>{}, selectedCinema = null, isOpen = false}) => {
    const [maxdistance, setMaxDistance] = useState('');
    const [userLocation, setUserLocation] = useState(null); 

    const mapRef = useRef(null);
    const leafletMapRef = useRef(null);

    const cinemas = [
        {
        "_id": "66b8a1c4f2e8d5a1b3c4d5c1",
        "name": "Lumiere Cao Thắng",
        "address": "379-381 Cao Thắng St, Ward 12",
        "city": "Ho Chi Minh City",
        "location": {
            "type": "Point",
            "coordinates": [10.775349914547771, 106.67129777333415]
        },
        "isActive": true,
        "showings": "7"
        }        
    ];

    function getDistance(lon1, lat1, lon2, lat2) {
    console.log("Calculating distance between:", lon1, lat1, lon2, lat2);
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
}   

const getCenter = () => {
    if (cinemas.length > 0 && cinemas[0].location && cinemas[0].location.coordinates) {
        return [cinemas[0].location.coordinates[0], cinemas[0].location.coordinates[1] ];
    } else {
        return DEFAULT_CENTER;
    }
}

    // Initialize map and markers
    useEffect(() => {
        console.log("Initializing map with cinemas:", cinemas);
        if (mapRef.current && !leafletMapRef.current) {
            leafletMapRef.current = L.map(mapRef.current, {
                center: getCenter(),
                zoom: 19,
                minZoom: 6,
                maxBounds: DEFAULT_BOUNDS,
                maxBoundsViscosity: 0.6,
                scrollWheelZoom: false,
            });
            leafletMapRef.current.zoomControl.setPosition("topright");

            L.tileLayer("http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}", {
                maxZoom: 20,
                subdomains: ["mt0", "mt1", "mt2", "mt3"],
                tileSize: 512,
                zoomOffset: -1,
            }).addTo(leafletMapRef.current);

            leafletMapRef.current.on("mouseenter", () => {
                leafletMapRef.current.scrollWheelZoom.enable();
            });
            leafletMapRef.current.on("mouseleave", () => {
                leafletMapRef.current.scrollWheelZoom.disable();
            });

            if (navigator.geolocation.getCurrentPosition && cinemas.length > 0) {
                navigator.geolocation.getCurrentPosition((position) => {
                    setUserLocation({
                        "type": "Point",
                        "coordinates": [position.coords.latitude, position.coords.longitude]
                    });
                    console.log("Geolocation enabled, user location set:", [position.coords.latitude, position.coords.longitude]);
                });
            } else {
                console.error("Geolocation is not supported by this browser.");
            }
        }

        if (leafletMapRef.current) {
            // Remove existing markers
            leafletMapRef.current.eachLayer((layer) => {
                if (layer instanceof L.Marker) {
                    leafletMapRef.current.removeLayer(layer);
                }
            });
            // Add cinema markers
cinemas.forEach((cinema) => {
    if (cinema.location && cinema.location.coordinates) {
        const marker = L.marker([cinema.location.coordinates[0], cinema.location.coordinates[1]]).addTo(leafletMapRef.current);
        marker.bindPopup(
            `<b>${cinema.name}</b><br/>${cinema.address || ""}`
        );
        marker.on("click", () => {
            // if (onCinemaSelect) onCinemaSelect(cinema);
        });
    }
});
        }

        return () => {
            if (leafletMapRef.current) {
                leafletMapRef.current.remove();
                leafletMapRef.current = null;
            }
        };
    }, [maxdistance, isOpen]);

    // Prevent zooming beyond min/max zoom
    useEffect(() => {
        const map = leafletMapRef.current;
        if (!map) return;

        const handleWheel = (e) => {
            const currentZoom = map.getZoom();
            const minZoom = map.getMinZoom();
            const maxZoom = map.getMaxZoom();
            const isZoomingOut = e.deltaY > 0;
            const isZoomingIn = e.deltaY < 0;

            if (
                (currentZoom <= minZoom && isZoomingOut) ||
                (currentZoom >= maxZoom && isZoomingIn)
            ) {
                map.scrollWheelZoom.disable();
                setTimeout(() => {
                    map.scrollWheelZoom.enable();
                }, 100);
            }
        };

        const mapContainer = map.getContainer();
        mapContainer.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            mapContainer.removeEventListener("wheel", handleWheel);
        };
    }, []);

    // Disable map interaction during page scroll
    useEffect(() => {
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

        document.addEventListener("scroll", handleScroll, { passive: true });
        document.addEventListener("touchend", handleScrollEnd, { passive: true });

        return () => {
            document.removeEventListener("scroll", handleScroll);
            document.removeEventListener("touchend", handleScrollEnd);
            if (scrollTimeout) clearTimeout(scrollTimeout);
        };
    }, []);

    return (
        <div className="relative flex md:w-screen xl:w-[70vw] justify-center items-center gap-3 lg:block lg:gap-0 h-[70vh] min-h-[600px]">
            <div className="ml-5 mt-[1%] relative z-3 w-[15vw] h-[95%]">
                <LocationTable cinemas={cinemas} curlocation={userLocation} maxdistance={maxdistance} setMaxDistance={setMaxDistance} onClick={onClick} selectedlocation={selectedCinema}/>
            </div>
            <div
                ref={mapRef}
                className="absolute top-0 h-full w-full overflow-auto rounded-xl border-gray-200 z-2"
            />
        </div>
    );
};

export default IntegratedMap;
