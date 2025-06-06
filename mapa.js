// Variables globales
let map;
let markers = [];
let places = [];

// Inicializar el mapa
function initMap() {
    // Crear mapa centrado en República Dominicana
    map = L.map('map').setView([18.7357, -70.1627], 8);
    
    // Añadir capa de tiles de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Manejar clics en el mapa para obtener coordenadas
    map.on('click', function(e) {
        document.getElementById('lat-display').textContent = e.latlng.lat.toFixed(6);
        document.getElementById('lng-display').textContent = e.latlng.lng.toFixed(6);
        document.getElementById('place-lat').value = e.latlng.lat;
        document.getElementById('place-lng').value = e.latlng.lng;
        
        // Limpiar marcadores previos de selección
        clearSelectionMarkers();
        
        // Añadir marcador en la ubicación seleccionada
        const marker = L.marker(e.latlng, {
            draggable: true,
            autoPan: true
        }).addTo(map)
        .bindPopup('Nuevo lugar seleccionado')
        .openPopup();
        
        markers.push(marker);
        
        // Manejar cuando el marcador se mueve
        marker.on('dragend', function() {
            const newPos = marker.getLatLng();
            document.getElementById('lat-display').textContent = newPos.lat.toFixed(6);
            document.getElementById('lng-display').textContent = newPos.lng.toFixed(6);
            document.getElementById('place-lat').value = newPos.lat;
            document.getElementById('place-lng').value = newPos.lng;
        });
    });
}

// Limpiar marcadores de selección
function clearSelectionMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
}

// Guardar un nuevo lugar
function savePlace(event) {
    event.preventDefault();
    
    const name = document.getElementById('place-name').value;
    const date = document.getElementById('visit-date').value;
    const notes = document.getElementById('place-notes').value;
    const lat = document.getElementById('place-lat').value;
    const lng = document.getElementById('place-lng').value;
    
    if (!name || !date || !lat || !lng) {
        alert('Por favor complete todos los campos requeridos');
        return;
    }
    
    const newPlace = {
        id: Date.now(),
        name,
        date,
        notes,
        coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) }
    };
    
    places.push(newPlace);
    renderPlace(newPlace);
    addPlaceMarker(newPlace);
    
    // Limpiar el formulario
    document.getElementById('place-form').reset();
    document.getElementById('lat-display').textContent = '0';
    document.getElementById('lng-display').textContent = '0';
    clearSelectionMarkers();
    
    // Guardar en localStorage
    saveToLocalStorage();
}

// Añadir marcador para un lugar
function addPlaceMarker(place) {
    const marker = L.marker([place.coordinates.lat, place.coordinates.lng], {
        title: place.name
    }).addTo(map)
    .bindPopup(`
        <b>${place.name}</b><br>
        <small>${formatDate(place.date)}</small>
        ${place.notes ? `<p>${place.notes}</p>` : ''}
    `);
    
    // Guardar referencia al marcador en el lugar
    place.marker = marker;
}

// Mostrar un lugar en la lista
function renderPlace(place) {
    const placesList = document.getElementById('places-list');
    const placeElement = document.createElement('div');
    placeElement.className = 'place-item';
    placeElement.innerHTML = `
        <h3>${place.name}</h3>
        <p><strong>Fecha:</strong> ${formatDate(place.date)}</p>
        ${place.notes ? `<p>${place.notes}</p>` : ''}
        <p class="coordinates">
            <strong>Coordenadas:</strong> 
            ${place.coordinates.lat.toFixed(6)}, ${place.coordinates.lng.toFixed(6)}
        </p>
        <button onclick="focusPlace(${place.id})">Ver en mapa</button>
        <button onclick="deletePlace(${place.id})" class="delete-btn">Eliminar</button>
    `;
    
    placesList.appendChild(placeElement);
}

// Formatear fecha
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Centrar mapa en un lugar específico
function focusPlace(placeId) {
    const place = places.find(p => p.id === placeId);
    if (place) {
        map.setView([place.coordinates.lat, place.coordinates.lng], 12);
        place.marker.openPopup();
    }
}

// Eliminar un lugar
function deletePlace(placeId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este lugar?')) return;
    
    const placeIndex = places.findIndex(p => p.id === placeId);
    if (placeIndex !== -1) {
        // Eliminar marcador del mapa
        map.removeLayer(places[placeIndex].marker);
        
        // Eliminar de la lista
        places.splice(placeIndex, 1);
        
        // Volver a renderizar toda la lista
        document.querySelectorAll('#places-list .place-item').forEach(el => el.remove());
        places.forEach(renderPlace);
        
        // Guardar en localStorage
        saveToLocalStorage();
    }
}

// Guardar lugares en localStorage
function saveToLocalStorage() {
    localStorage.setItem('travelPlaces', JSON.stringify(places));
}

// Cargar lugares desde localStorage
function loadFromLocalStorage() {
    const savedPlaces = localStorage.getItem('travelPlaces');
    if (savedPlaces) {
        places = JSON.parse(savedPlaces);
        places.forEach(place => {
            renderPlace(place);
            addPlaceMarker(place);
        });
    }
}

// Geolocalización del usuario
function locateUser() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                document.getElementById('lat-display').textContent = lat.toFixed(6);
                document.getElementById('lng-display').textContent = lng.toFixed(6);
                document.getElementById('place-lat').value = lat;
                document.getElementById('place-lng').value = lng;
                
                // Centrar mapa en la ubicación del usuario
                map.setView([lat, lng], 12);
                
                // Limpiar marcadores previos y añadir uno nuevo
                clearSelectionMarkers();
                const marker = L.marker([lat, lng], {
                    draggable: true,
                    autoPan: true
                }).addTo(map)
                .bindPopup('Tu ubicación actual')
                .openPopup();
                
                markers.push(marker);
                
                // Manejar cuando el marcador se mueve
                marker.on('dragend', function() {
                    const newPos = marker.getLatLng();
                    document.getElementById('lat-display').textContent = newPos.lat.toFixed(6);
                    document.getElementById('lng-display').textContent = newPos.lng.toFixed(6);
                    document.getElementById('place-lat').value = newPos.lat;
                    document.getElementById('place-lng').value = newPos.lng;
                });
            },
            error => {
                alert('No se pudo obtener tu ubicación: ' + error.message);
            }
        );
    } else {
        alert('Geolocalización no es soportada por tu navegador');
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    loadFromLocalStorage();
    
    // Manejar el formulario
    document.getElementById('place-form').addEventListener('submit', savePlace);
    
    // Añadir botón para geolocalización
    const geoButton = document.createElement('button');
    geoButton.textContent = 'Mi Ubicación Actual';
    geoButton.type = 'button';
    geoButton.style.marginTop = '10px';
    geoButton.addEventListener('click', locateUser);
    document.getElementById('place-form').appendChild(geoButton);
});