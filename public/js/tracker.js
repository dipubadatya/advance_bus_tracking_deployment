

document.addEventListener('DOMContentLoaded', () => {
  if (typeof busData === 'undefined') return;

  // --- CONFIGURATION ---
  const AVERAGE_BUS_SPEED_KMPH = 35;
  const ARRIVAL_THRESHOLD_METERS =75;
  const ROLLING_AVERAGE_SAMPLES = 5;

  // --- DOM ELEMENTS ---
  const statusIndicator = document.getElementById('status-indicator');
  const stopElements = document.querySelectorAll('.stop-item');
  const recenterBtn = document.getElementById('recenter-btn');

  // --- STATE MANAGEMENT ---
  // const tripState = {
  //   busId: busData._id,
  //   arrivalTimes: new Map(),
  //   lastLocation: null,
  //   recentSpeeds: [],
  //   isCentering: true,
  //   lastArrivedStopIndex: -1,
  //   fullRouteCoords: null
  // };
const tripState = {
    busId: busData._id,
    arrivalTimes: new Map(),
    lastLocation: null,
    recentSpeeds: [],
    isCentering: true,
    lastArrivedStopIndex: -1,
    fullRouteCoords: null,
    currentNextStopIndex: null // Add this line
};
  // --- MAP INITIALIZATION ---
  const initialLat = busData.currentLocation?.lat || busData.stops[0]?.lat || 19.3149;
  const initialLng = busData.currentLocation?.lng || busData.stops[0]?.lng || 84.7941;

  const map = L.map('map', { fullscreenControl: true, zoomControl: false }).setView([initialLat, initialLng], 14);
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  // --- TILE LAYERS AND CONTROL ---
  const streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
  const satelliteMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  });
  const baseMaps = { "Street": streetMap, "Satellite": satelliteMap };
  streetMap.addTo(map);
  L.control.layers(baseMaps).addTo(map);

  // --- ICONS & MAP LAYERS ---
  const busIcon = L.divIcon({
    html: `<img src="/bus-school.png" class="bus-icon-rotated" style="width:40px; height:40px;">`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
  const stopIcon = L.icon({ iconUrl: '/destination.png', iconSize: [25, 25], iconAnchor: [12, 25] });
  let busMarker = null;
  let routePolyline = null;
  let progressPolyline = null;
  let animationFrameId = null;

  // --- ROUTE DRAWING LOGIC ---
  async function initializeRoute() {
    if (!busData.stops || busData.stops.length < 2) return;
    busData.stops.forEach((stop, i) => L.marker([stop.lat, stop.lng], { icon: stopIcon }).addTo(map).bindPopup(`<p class="font-bold">${stop.name}</p>`));
    const coordsString = busData.stops.map(stop => `${stop.lng},${stop.lat}`).join(';');
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;
    try {
      const response = await fetch(osrmUrl);
      if (!response.ok) throw new Error('OSRM request failed');
      const routeData = await response.json();
      if (routeData.routes && routeData.routes.length > 0) {
        const detailedCoords = routeData.routes[0].geometry.coordinates.map(p => [p[1], p[0]]);
        tripState.fullRouteCoords = detailedCoords;
        routePolyline = L.polyline(detailedCoords, { color: '#1646ccff', weight: 6, opacity: 0.6, dashArray: '9, 9' }).addTo(map);
        progressPolyline = L.polyline([], { color: '#5d7580ff', weight: 7 }).addTo(map);
        map.fitBounds(routePolyline.getBounds(), { padding: [50, 50] });
      } else {
        throw new Error('No route found by OSRM');
      }
    } catch (error) {
      console.error("Could not fetch route from OSRM, falling back to straight lines:", error);
      const stopCoordinates = busData.stops.map(stop => [stop.lat, stop.lng]);
      tripState.fullRouteCoords = stopCoordinates;
      routePolyline = L.polyline(stopCoordinates, { color: '#888', weight: 6, opacity: 0.6, dashArray: '10, 10' }).addTo(map);
      progressPolyline = L.polyline([], { color: '#0ea5e9', weight: 7 }).addTo(map);
      map.fitBounds(routePolyline.getBounds(), { padding: [50, 50] });
    }
  }
  initializeRoute();

  // --- UTILITY FUNCTIONS ---
    const formatRelativeTime = (minutes) => {
        const absMinutes = Math.abs(Math.round(minutes));
        if (absMinutes < 1) return '1 minute';
        if (absMinutes < 60) return `${absMinutes} minute`;
        const hours = Math.floor(absMinutes / 60);
        if (hours < 24) return `${hours} hour `;
        const days = Math.floor(hours / 24);
        return `${days} day`;
    };

  const calculateBearing = (start, end) => {
    const toRad = (deg) => deg * Math.PI / 180;
    const toDeg = (rad) => rad * 180 / Math.PI;
    const lat1 = toRad(start.lat);
    const lng1 = toRad(start.lng);
    const lat2 = toRad(end.lat);
    const lng2 = toRad(end.lng);
    const y = Math.sin(lng2 - lng1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  };

  const parseTimeToDate = (timeString) => {
    if (!timeString || !timeString.includes(':')) return null;
    const today = new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    today.setHours(hours, minutes, 0, 0);
    return today;
  };

  function findClosestPointOnPolyline(busLatLng, polylineCoords) {
    let closestPoint = null, minDistance = Infinity, closestSegmentIndex = -1;
    for (let i = 0; i < polylineCoords.length - 1; i++) {
      const p1 = L.latLng(polylineCoords[i]), p2 = L.latLng(polylineCoords[i + 1]);
      const projected = L.LineUtil.closestPointOnSegment(busLatLng, p1, p2);
      const distance = busLatLng.distanceTo(projected);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = projected;
        closestSegmentIndex = i;
      }
    }
    return { point: closestPoint, index: closestSegmentIndex };
  }

  // --- SOCKET.IO & REAL-TIME LOGIC ---
  const socket = io();
  socket.emit('joinBusRoom', tripState.busId);
  const resetTripState = () => {
    tripState.arrivalTimes.clear();
    tripState.lastArrivedStopIndex = -1;
    if (progressPolyline) progressPolyline.setLatLngs([]);
    stopElements.forEach(el => {
      el.classList.remove('is-arrived', 'is-next');
      el.querySelectorAll('.arrival-label, .eta-label, .distance-label, .next-stop-label, .delay-label').forEach(lbl => lbl.classList.add('hidden'));
    });
  };

  const updateStatusUI = (isLive) => {
    const wasOffline = statusIndicator.textContent === 'OFFLINE';
    statusIndicator.textContent = isLive ? 'LIVE' : 'OFFLINE';
    statusIndicator.classList.toggle('bg-green-100', isLive);
    statusIndicator.classList.toggle('text-green-600', isLive);
    statusIndicator.classList.toggle('bg-red-100', !isLive);
    statusIndicator.classList.toggle('text-red-600', !isLive);
    if (isLive && wasOffline) resetTripState();
    recenterBtn.classList.toggle('hidden', !isLive);
    if (!isLive && busMarker) {
      map.removeLayer(busMarker);
      busMarker = null;
      tripState.lastLocation = null;
    }
  };

  // --- INITIAL STATE ---
  updateStatusUI(busData.trackingStarted);
  if (busData.trackingStarted && busData.currentLocation?.lat) {
    const initialCoords = L.latLng(busData.currentLocation.lat, busData.currentLocation.lng);
    busMarker = L.marker(initialCoords, { icon: busIcon }).addTo(map).bindPopup("Waiting for movement...");
    tripState.lastLocation = { latlng: initialCoords, timestamp: Date.now(), bearing: 0 };
    processLocationUpdate(busData.currentLocation);
  }

  // --- EVENT LISTENERS ---
  recenterBtn.addEventListener('click', () => {
    tripState.isCentering = true;
    if (busMarker) map.setView(busMarker.getLatLng(), 16, { animate: true, duration: 1 });
  });
  map.on('dragstart', () => tripState.isCentering = false);
  socket.on('locationUpdate', (newCoords) => {
    updateStatusUI(true);
    processLocationUpdate(newCoords);
  });
  socket.on('trackingStopped', () => updateStatusUI(false));

  // --- CORE LOGIC FUNCTIONS ---
  function processLocationUpdate(coords) {
    const endLatLng = L.latLng(coords.lat, coords.lng);
    let currentSpeed = 0, bearing = tripState.lastLocation?.bearing || 0, animationDuration = 1000;
    if (tripState.lastLocation) {
      const distanceMeters = endLatLng.distanceTo(tripState.lastLocation.latlng);
      const timeSeconds = (Date.now() - tripState.lastLocation.timestamp) / 1000;
      animationDuration = timeSeconds * 1000;
      if (timeSeconds > 0.1 && distanceMeters > 1) {
        currentSpeed = (distanceMeters / timeSeconds) * 3.6;
        bearing = calculateBearing(tripState.lastLocation.latlng, endLatLng);
        tripState.recentSpeeds.push(currentSpeed);
        if (tripState.recentSpeeds.length > ROLLING_AVERAGE_SAMPLES) tripState.recentSpeeds.shift();
      }
    }
    if (!busMarker) {
      busMarker = L.marker(endLatLng, { icon: busIcon }).addTo(map);
    } else {
      const startLatLng = busMarker.getLatLng();
      let startTime = performance.now();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      const animateMarker = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        const lat = startLatLng.lat + (endLatLng.lat - startLatLng.lat) * progress;
        const lng = startLatLng.lng + (endLatLng.lng - startLatLng.lng) * progress;
        busMarker.setLatLng([lat, lng]);
        if (progress < 1) animationFrameId = requestAnimationFrame(animateMarker);
      };
      animationFrameId = requestAnimationFrame(animateMarker);
    }
    const iconElement = busMarker.getElement().querySelector('.bus-icon-rotated');
    if (iconElement) iconElement.style.transform = `rotate(${bearing}deg)`;
    busMarker.setPopupContent(`<b>Speed:</b> ${currentSpeed.toFixed(1)} km/h`).openPopup();
    tripState.lastLocation = { latlng: endLatLng, timestamp: Date.now(), bearing };
    if (tripState.isCentering) map.panTo(endLatLng, { animate: true, duration: 1.5 });
    updateStopListUI(coords);
    updateProgressLine(coords);
  }
function updateStopListUI(busCoords) {
    let nextStopFound = false;
    stopElements.forEach(stopEl => {
        const stopIndex = parseInt(stopEl.dataset.stopIndex, 10);
        const stopLatLng = L.latLng(parseFloat(stopEl.dataset.stopLat), parseFloat(stopEl.dataset.stopLng));
        stopEl.querySelectorAll('.next-stop-label, .eta-label, .distance-label, .delay-label').forEach(el => el.classList.add('hidden'));
        const distance = tripState.lastLocation.latlng.distanceTo(stopLatLng);

        // Logic to mark a stop as arrived
        if (distance < ARRIVAL_THRESHOLD_METERS && !tripState.arrivalTimes.has(stopIndex)) {
            const formattedTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
            tripState.arrivalTimes.set(stopIndex, formattedTime);
            tripState.lastArrivedStopIndex = Math.max(tripState.lastArrivedStopIndex, stopIndex);
        }

        // UI update for stops that have been arrived at
        if (tripState.arrivalTimes.has(stopIndex)) {
            stopEl.classList.add('is-arrived');
            stopEl.classList.remove('is-next');
            const arrivalLabel = stopEl.querySelector('.arrival-label');
            arrivalLabel.classList.remove('hidden');
            arrivalLabel.querySelector('.arrival-time').textContent = tripState.arrivalTimes.get(stopIndex);
            return; // Move to the next stop in the loop
        }
        stopEl.classList.remove('is-arrived');

        // Logic for the next upcoming stop
        if (!nextStopFound) {
            nextStopFound = true;
            stopEl.classList.add('is-next');
            stopEl.querySelector('.next-stop-label').classList.remove('hidden');

            // --- MODIFIED SECTION: CONDITIONAL SCROLLING ---
            // Only scroll into view if the next stop has CHANGED.
            if (tripState.currentNextStopIndex !== stopIndex) {
                stopEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Remember the new next stop index.
                tripState.currentNextStopIndex = stopIndex;
            }
            // --- END OF MODIFIED SECTION ---

            const distanceKm = distance / 1000;
            const avgSpeed = tripState.recentSpeeds.length > 0 ? tripState.recentSpeeds.reduce((a, b) => a + b, 0) / tripState.recentSpeeds.length : AVERAGE_BUS_SPEED_KMPH;
            const speedForEta = avgSpeed > 5 ? avgSpeed : AVERAGE_BUS_SPEED_KMPH;
            const etaMinutes = (distanceKm / speedForEta) * 60;
            const etaTime = new Date(Date.now() + etaMinutes * 60000);

            const distLabel = stopEl.querySelector('.distance-label');
            distLabel.querySelector('.distance-value').textContent = `${distanceKm.toFixed(1)} km`;
            distLabel.classList.remove('hidden');

            const etaLabel = stopEl.querySelector('.eta-label');
            etaLabel.querySelector('.eta-time').textContent = etaTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
            etaLabel.querySelector('.eta-relative').textContent = `(in ${formatRelativeTime(etaMinutes)})`;
            etaLabel.classList.remove('hidden');

            const scheduledTimeStr = stopEl.dataset.scheduledTime;
            const scheduledDate = parseTimeToDate(scheduledTimeStr);
            if (scheduledDate) {
                const delayMinutes = Math.round((etaTime - scheduledDate) / 60000);
                const delayLabel = stopEl.querySelector('.delay-label');
                const statusSpan = delayLabel.querySelector('.delay-status');

                if (Math.abs(delayMinutes) <= 2) {
                    statusSpan.textContent = "On Time";
                    statusSpan.className = 'delay-status font-bold text-green-600';
                } else if (delayMinutes > 2) {
                    statusSpan.textContent = `Delayed by ${formatRelativeTime(delayMinutes)}`;
                    statusSpan.className = 'delay-status font-bold text-red-600';
                } else {
                    statusSpan.textContent = `Early by ${formatRelativeTime(-delayMinutes)}`;
                    statusSpan.className = 'delay-status font-bold text-yellow-600';
                }
                delayLabel.classList.remove('hidden');
            }
        } else {
            // Ensure stops after the "next stop" are not styled as next
            stopEl.classList.remove('is-next');
        }
    });
}
  // function updateStopListUI(busCoords) {
  //   let nextStopFound = false;
  //   stopElements.forEach(stopEl => {
  //     const stopIndex = parseInt(stopEl.dataset.stopIndex, 10);
  //     const stopLatLng = L.latLng(parseFloat(stopEl.dataset.stopLat), parseFloat(stopEl.dataset.stopLng));
  //     stopEl.querySelectorAll('.next-stop-label, .eta-label, .distance-label, .delay-label').forEach(el => el.classList.add('hidden'));
  //     const distance = tripState.lastLocation.latlng.distanceTo(stopLatLng);

  //     if (distance < ARRIVAL_THRESHOLD_METERS && !tripState.arrivalTimes.has(stopIndex)) {
  //       const formattedTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  //       tripState.arrivalTimes.set(stopIndex, formattedTime);
  //       tripState.lastArrivedStopIndex = Math.max(tripState.lastArrivedStopIndex, stopIndex);
  //     }

  //     if (tripState.arrivalTimes.has(stopIndex)) {
  //       stopEl.classList.add('is-arrived');
  //       stopEl.classList.remove('is-next');
  //       const arrivalLabel = stopEl.querySelector('.arrival-label');
  //       arrivalLabel.classList.remove('hidden');
  //       arrivalLabel.querySelector('.arrival-time').textContent = tripState.arrivalTimes.get(stopIndex);
  //       return;
  //     }
  //     stopEl.classList.remove('is-arrived');

  //     if (!nextStopFound) {
  //       nextStopFound = true;
  //       stopEl.classList.add('is-next');
  //       stopEl.querySelector('.next-stop-label').classList.remove('hidden');
  //       const distanceKm = distance / 1000;
  //       const avgSpeed = tripState.recentSpeeds.length > 0 ? tripState.recentSpeeds.reduce((a, b) => a + b, 0) / tripState.recentSpeeds.length : AVERAGE_BUS_SPEED_KMPH;
  //       const speedForEta = avgSpeed > 5 ? avgSpeed : AVERAGE_BUS_SPEED_KMPH;
  //       const etaMinutes = (distanceKm / speedForEta) * 60;
  //       const etaTime = new Date(Date.now() + etaMinutes * 60000);
  //       const distLabel = stopEl.querySelector('.distance-label');
  //       distLabel.querySelector('.distance-value').textContent = `${distanceKm.toFixed(1)} km`;
  //       distLabel.classList.remove('hidden');

  //       const etaLabel = stopEl.querySelector('.eta-label');
  //       etaLabel.querySelector('.eta-time').textContent = etaTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  //               // --- MODIFIED LINE ---
  //       etaLabel.querySelector('.eta-relative').textContent = `(in ${formatRelativeTime(etaMinutes)})`;
  //       etaLabel.classList.remove('hidden');

  //       const scheduledTimeStr = stopEl.dataset.scheduledTime;
  //       const scheduledDate = parseTimeToDate(scheduledTimeStr);
  //       if (scheduledDate) {
  //         const delayMinutes = Math.round((etaTime - scheduledDate) / 60000);
  //         const delayLabel = stopEl.querySelector('.delay-label');
  //         const statusSpan = delayLabel.querySelector('.delay-status');

  //         if (Math.abs(delayMinutes) <= 2) {
  //           statusSpan.textContent = "On Time";
  //           statusSpan.className = 'delay-status font-bold text-green-600';
  //         } else if (delayMinutes > 2) {
  //                       // --- MODIFIED LINE ---
  //           statusSpan.textContent = `Delayed by ${formatRelativeTime(delayMinutes)}`;
  //           statusSpan.className = 'delay-status font-bold text-red-600';
  //         } else {
  //                       // --- MODIFIED LINE ---
  //           statusSpan.textContent = `Early by ${formatRelativeTime(-delayMinutes)}`;
  //           statusSpan.className = 'delay-status font-bold text-yellow-600';
  //         }
  //         delayLabel.classList.remove('hidden');
  //       }
  //       stopEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  //     } else {
  //       stopEl.classList.remove('is-next');
  //     }
  //   });
  // }

  function updateProgressLine(busCoords) {
    if (!progressPolyline || !tripState.fullRouteCoords) return;
    const busLatLng = L.latLng(busCoords.lat, busCoords.lng);
    const closest = findClosestPointOnPolyline(busLatLng, tripState.fullRouteCoords);
    if (!closest.point) return;
    const progressCoords = tripState.fullRouteCoords.slice(0, closest.index + 1);
    progressCoords.push(closest.point);
    progressPolyline.setLatLngs(progressCoords);
  }
});