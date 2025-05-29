document.addEventListener('DOMContentLoaded', function() {
    const menuItems = document.querySelectorAll('.menu-item');
    const sectionImage = document.getElementById('section-image');
    
    // Imágenes para cada sección (debes reemplazar con tus propias imágenes)
    const sectionImages = {
        playas: 'images/playas.jpg',
        actividades: 'images/actividades.jpg',
        arte: 'arte-cultura.jpg'
    };
    
    // Contenidos para cada sección
    const sectionContents = {
        playas: document.getElementById('playas-content'),
        actividades: document.getElementById('actividades-content'),
        arte: document.getElementById('arte-content')
    };
    
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            
            // Actualizar menú activo
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Cambiar imagen con efecto fade
            sectionImage.style.opacity = 0;
            setTimeout(() => {
                sectionImage.src = sectionImages[section];
                sectionImage.style.opacity = 1;
            }, 300);
            
            // Mostrar contenido correspondiente
            Object.values(sectionContents).forEach(content => {
                content.classList.remove('active');
            });
            sectionContents[section].classList.add('active');
        });
    });
});