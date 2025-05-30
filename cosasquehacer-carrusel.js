document.addEventListener('DOMContentLoaded', function() {
    // Variables del carrusel
    const carousels = {
        playas: document.getElementById('playas-carousel'),
        actividades: document.getElementById('actividades-carousel'),
        arte: document.getElementById('arte-carousel')
    };
    
    const carouselTitle = document.getElementById('carousel-title');
    const carouselSubtitle = document.getElementById('carousel-subtitle');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const seeMoreBtn = document.querySelector('.see-more');
    
    // Variables para el control del carrusel
    let currentCarousel = 'playas';
    let currentIndex = 0;
    
    // Función para cambiar de sección
    function changeSection(section) {
        // Ocultar todos los carruseles
        Object.values(carousels).forEach(carousel => {
            carousel.classList.remove('active');
        });
        
        // Mostrar el carrusel seleccionado
        carousels[section].classList.add('active');
        currentCarousel = section;
        currentIndex = 0;
        updateCarouselPosition();
        
        // Actualizar títulos
        if (section === 'playas') {
            carouselTitle.textContent = 'Playas';
            carouselSubtitle.textContent = 'Que deberías conocer';
        } else if (section === 'actividades') {
            carouselTitle.textContent = 'Actividades';
            carouselSubtitle.textContent = 'Para disfrutar';
        } else {
            carouselTitle.textContent = 'Arte y cultura';
            carouselSubtitle.textContent = 'Para explorar';
        }
    }
    
    // Función para actualizar la posición del carrusel
    function updateCarouselPosition() {
        const items = carousels[currentCarousel].querySelectorAll('.carousel-item');
        items.forEach((item, index) => {
            item.style.transform = `translateX(${(index - currentIndex) * 100}%)`;
        });
    }
    
    // Eventos para los controles del carrusel
    prevBtn.addEventListener('click', function() {
        const itemCount = carousels[currentCarousel].querySelectorAll('.carousel-item').length;
        currentIndex = (currentIndex - 1 + itemCount) % itemCount;
        updateCarouselPosition();
    });
    
    nextBtn.addEventListener('click', function() {
        const itemCount = carousels[currentCarousel].querySelectorAll('.carousel-item').length;
        currentIndex = (currentIndex + 1) % itemCount;
        updateCarouselPosition();
    });
    
    // Evento para "Ver más"
    seeMoreBtn.addEventListener('click', function() {
        alert(`Mostrando más opciones de ${currentCarousel}`);
        // Aquí puedes redirigir a una página con más información
    });
    
    // Inicializar el carrusel
    changeSection('playas');
    
    // Integración con el menú principal (si lo tienes)
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            changeSection(section);
        });
    });
});