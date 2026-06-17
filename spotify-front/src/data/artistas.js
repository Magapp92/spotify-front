const imagenesPorNombre = {
    'taylor swift': '/img/taylor.jpg',
    'bad bunny':    '/img/badbunny.jpg',
    'adele':        '/img/adele.jpg',
    'the weeknd':   '/img/theweeknd.jpg',
    'beyonce':      '/img/beyonce.jpg',
    'beyoncé':      '/img/beyonce.jpg',
    'ed sheeran':   '/img/edsheeran.jpg',
    'shakira':      '/img/shakira.jpg',
    'drake':        '/img/drake.jpg'
}

export const getImagen = (nombre) => {

    if (nombre) {
        return imagenesPorNombre[nombre.trim().toLowerCase()]
    }
    return '/img/placeholder.svg'
}
