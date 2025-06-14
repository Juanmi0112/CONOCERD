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

// Función para cargar una imagen como data URL
function loadImageAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            resolve(e.target.result);
        };
        reader.onerror = function(e) {
            reject(e);
        };
        reader.readAsDataURL(file);
    });
}

// Previsualizar imagen seleccionada - VERSIÓN MEJORADA
function previewImage(event) {
    const input = event.target;
    const preview = document.getElementById('image-preview');
    
    if (!preview) {
        console.error("No se encontró el elemento para previsualización");
        return;
    }
    
    if (input.files && input.files[0]) {
        // Usamos URL.createObjectURL para mejor rendimiento
        preview.src = URL.createObjectURL(input.files[0]);
        preview.style.display = 'block';
        
        // Liberamos memoria cuando la imagen ya se cargó
        preview.onload = function() {
            URL.revokeObjectURL(preview.src);
        };
    } else {
        preview.src = '';
        preview.style.display = 'none';
    }
}

// Guardar un nuevo lugar - VERSIÓN MEJORADA
async function savePlace(event) {
    event.preventDefault();
    
    // Validación mejorada de campos
    const requiredFields = {
        'place-name': 'Nombre del lugar',
        'visit-date': 'Fecha de visita',
        'place-lat': 'Latitud',
        'place-lng': 'Longitud'
    };
    
    let missingFields = [];
    for (const [fieldId, fieldName] of Object.entries(requiredFields)) {
        if (!document.getElementById(fieldId).value) {
            missingFields.push(fieldName);
        }
    }
    
    if (missingFields.length > 0) {
        alert(`Por favor complete los siguientes campos requeridos:\n${missingFields.join('\n')}`);
        return false;
    }
    
    const name = document.getElementById('place-name').value;
    const date = document.getElementById('visit-date').value;
    const notes = document.getElementById('place-notes').value;
    const lat = document.getElementById('place-lat').value;
    const lng = document.getElementById('place-lng').value;
    const imageFile = document.getElementById('place-image').files[0];
    
    let imageUrl = '';
    if (imageFile) {
        try {
            imageUrl = await loadImageAsDataURL(imageFile);
        } catch (error) {
            console.error("Error al cargar la imagen:", error);
            alert('Error al cargar la imagen. Por favor intente nuevamente.');
            return false;
        }
    }
    
    const newPlace = {
        id: Date.now(),
        name,
        date,
        notes,
        coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) },
        imageUrl: imageUrl
    };
    
    places.push(newPlace);
    renderPlace(newPlace);
    addPlaceMarker(newPlace);
    
    // Limpiar el formulario
    document.getElementById('place-form').reset();
    document.getElementById('lat-display').textContent = '0';
    document.getElementById('lng-display').textContent = '0';
    
    // Limpiar previsualización de imagen
    const preview = document.getElementById('image-preview');
    if (preview) {
        preview.src = '';
        preview.style.display = 'none';
    }
    
    clearSelectionMarkers();
    
    // Guardar en localStorage
    saveToLocalStorage();
    
    // Redirección MEJORADA con verificación
    try {
        // Pequeño retraso para asegurar que todo se guardó
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verificar si existe la página antes de redirigir
        const response = await fetch('itinerario.html', { method: 'HEAD' });
        if (response.ok) {
            window.location.href = "itinerario.html";
        } else {
            console.error("itinerario.html no encontrado");
            alert("No se encontró la página de itinerario. Se guardó el lugar correctamente.");
        }
    } catch (error) {
        console.error("Error al redirigir:", error);
        alert("El lugar se guardó correctamente, pero hubo un problema al redirigir.");
    }
    
    return false;
}

// Guardar lugares en localStorage
function saveToLocalStorage() {
    localStorage.setItem('travelPlaces', JSON.stringify(places));
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
        ${place.imageUrl ? `<img src="${place.imageUrl}" alt="${place.name}" style="max-width: 100px; max-height: 100px;">` : ''}
    `);
    
    // Guardar referencia al marcador en el lugar
    place.marker = marker;
}

// Mostrar un lugar en la lista
function renderPlace(place) {
    const placesList = document.getElementById('places-list');
    if (!placesList) {
        console.error("No se encontró el contenedor places-list");
        return;
    }
    
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
        ${place.imageUrl ? `<img src="${place.imageUrl}" alt="${place.name}" style="max-width: 100px; max-height: 100px;">` : ''}
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

// Inicializar la aplicación - VERSIÓN MEJORADA
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si Leaflet está cargado
    if (typeof L === 'undefined') {
        console.error("Leaflet no está cargado correctamente");
        alert("Error al cargar el mapa. Por favor recarga la página.");
        return;
    }
    
    try {
        initMap();
        loadFromLocalStorage();
        
        const form = document.getElementById('place-form');
        if (form) {
            form.addEventListener('submit', savePlace);
        } else {
            console.error("El formulario con id 'place-form' no fue encontrado.");
        }
        
        // Manejar la selección de imágenes para previsualización
        const imageInput = document.getElementById('place-image');
        if (imageInput) {
            imageInput.addEventListener('change', previewImage);
        } else {
            console.warn("Input de imagen no encontrado - la previsualización no funcionará");
        }
        
        // Añadir botón para geolocalización
        const geoButton = document.createElement('button');
        geoButton.textContent = 'Mi Ubicación Actual';
        geoButton.type = 'button';
        geoButton.style.marginTop = '10px';
        geoButton.style.padding = '8px 12px';
        geoButton.style.backgroundColor = '#4CAF50';
        geoButton.style.color = 'white';
        geoButton.style.border = 'none';
        geoButton.style.borderRadius = '4px';
        geoButton.style.cursor = 'pointer';
        geoButton.addEventListener('click', locateUser);
        
        const formContainer = document.getElementById('place-form');
        if (formContainer) {
            formContainer.appendChild(geoButton);
        } else {
            console.warn("No se pudo agregar el botón de geolocalización");
        }
        
    } catch (error) {
        console.error("Error en la inicialización:", error);
        alert("Ocurrió un error al iniciar la aplicación. Por favor recarga la página.");
    }
});