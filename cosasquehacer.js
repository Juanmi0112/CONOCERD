document.addEventListener('DOMContentLoaded', function() {
    // Obtener todos los elementos del menú
    const menuItems = document.querySelectorAll('.menu-item');
    
    // Agregar evento click a cada elemento del menú
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Obtener la sección a mostrar
            const sectionId = this.getAttribute('data-section');
            const imagePath = this.getAttribute('data-image');
            
            // Remover clase active de todos los elementos del menú
            menuItems.forEach(i => i.classList.remove('active'));
            
            // Agregar clase active al elemento clickeado
            this.classList.add('active');
            
            // Cambiar la imagen
            const sectionImage = document.getElementById('section-image');
            sectionImage.src = imagePath;
            sectionImage.alt = `Imagen de ${sectionId}`;
            
            // Ocultar todos los contenidos
            document.querySelectorAll('.section-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Mostrar el contenido correspondiente
            document.getElementById(`${sectionId}-content`).classList.add('active');
        });
    });
    
    // Evento para "Ver más"
    const seeMore = document.querySelector('.see-more');
    if (seeMore) {
        seeMore.addEventListener('click', function() {
            const activeSection = document.querySelector('.menu-item.active').getAttribute('data-section');
            alert(`Mostrando más opciones de ${activeSection}`);
            // Aquí puedes implementar la lógica para cargar más contenido
        });
    }
});