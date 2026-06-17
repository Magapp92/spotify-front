
import { createContext, useContext, useEffect, useRef, useState } from "react"
import './Artistas.css'
import { getImagen } from '../data/artistas'

const ArtistasContext = createContext()

export const Artistas = () => {

    const { VITE_EXPRESS } = import.meta.env

    const [ artistas, setArtistas ] = useState([])
    const [ editando, setEditando ] = useState(null)

    const formularioPost = useRef(null)
    const formsRef = useRef(null)

    let getArtistas = async () => {
        console.log(`Obteniendo artistas`)

        let options = {
            method: `get`
        }
        let peticion = await fetch(`${VITE_EXPRESS}/artistas`, options)
        let { data } = await peticion.json()

        setArtistas(data)
    }

    let deleteArtista = async (idParam) => {
        console.log(`Eliminando al artista ${idParam}`)

        let options = {
            method: `delete`
        }
        const peticion = await fetch(`${VITE_EXPRESS}/artistas/${idParam}`, options)
        const { data } = await peticion.json()

        setArtistas(data)

        if (editando && editando._id === idParam) setEditando(null)
    }

    let putArtista = async (idParam, datos) => {
        console.log(`Actualizando al artista ${idParam}`)

        let options = {
            method: `put`,
            headers: {
                "Content-type" : "application/json"
            },
            body: JSON.stringify(datos)
        }
        let peticion = await fetch(`${VITE_EXPRESS}/artistas/${idParam}`, options)
        let { data } = await peticion.json()

        setArtistas(data)
    }

    let postArtista = async ( e ) => {
        e.preventDefault()
        console.log(`Añadiendo artista`)

        const { nombre, reproducciones, canciones } = formularioPost.current
        const nuevo = {
            nombre: nombre.value,
            reproducciones: reproducciones.value,
            canciones: canciones.value.split(',').map( c => c.trim() ).filter( Boolean ).map( nombre => ({ nombre }) )
        }

        let options = {
            method: `post`,
            headers: {
                "Content-type" : "application/json"
            },
            body: JSON.stringify(nuevo)
        }
        const peticion = await fetch(`${VITE_EXPRESS}/artistas`, options)
        const { data } = await peticion.json()

        setArtistas(data)

        formularioPost.current.reset()
    }

    const submitEdit = (datos) => {
        putArtista(editando._id, datos)
        setEditando(null)
    }

    useEffect( () => {
        getArtistas()
    }, [])

    useEffect( () => {
        if (editando) {
            formsRef.current?.scrollIntoView()
        }
    }, [editando])

    return (

        <ArtistasContext.Provider value={{ setEditando, deleteArtista }}>
        <section className="Artistas">

            <header className="Artistas-header">
                <h1 className="Artistas-title">Gestión de Artistas</h1>
            </header>

            <div className="Artistas-forms" ref={formsRef}>
                <div className="Artistas-formulario">
                    <h3 className="Artistas-h3">Añadir artista</h3>
                    <form className="Artistas-form" onSubmit={postArtista} ref={formularioPost}>
                        <input type="text" name="nombre" placeholder="Nombre" className="Artistas-input" required/>
                        <input type="number" name="reproducciones" placeholder="Reproducciones" className="Artistas-input" required min="0"/>
                        <input type="text" name="canciones" placeholder="Canciones (separadas por coma)" className="Artistas-input"/>
                        <input type="submit" value="Añadir artista" className="Artistas-send"/>
                    </form>
                </div>

                { editando && (
                    <FormularioEdit key={editando._id} artista={editando}
                    onSubmit={submitEdit} onCancel={() => setEditando(null)} />
                )}
            </div>

            { artistas?.length === 0 && <p className="Artistas-empty">No hay artistas</p> }

            <div className="Artistas-grid">
                { artistas?.map( artista =>
                    <Tarjeta key={artista._id} {...artista} />
                )}
            </div>

        </section>
        </ArtistasContext.Provider>

    )
}

const FormularioEdit = ( { artista, onSubmit, onCancel } ) => {

    const { _id, nombre, reproducciones, canciones } = artista
    const formularioPut = useRef(null)

    const cancionesStr = (canciones || []).map( c => c.nombre ).join(', ')

    const handleSubmit = ( e ) => {
        e.preventDefault()
        console.log(`Guardando cambios del artista ${_id}`)

        const { nombre, reproducciones, canciones } = formularioPut.current
        const datos = {
            nombre: nombre.value,
            reproducciones: reproducciones.value,
            canciones: canciones.value.split(',').map( c => c.trim() ).filter( Boolean ).map( nombre => ({ nombre }) )
        }

        onSubmit( datos )
    }

    return (
        <div className="Artistas-formulario Artistas-formulario--edit">
            <h3 className="Artistas-h3">Editar artista</h3>
            <form className="Artistas-form" onSubmit={handleSubmit} ref={formularioPut}>
                <input type="hidden" name="_id" defaultValue={_id}/>
                <input type="text" name="nombre" placeholder="Nombre" className="Artistas-input" defaultValue={nombre} required/>
                <input type="number" name="reproducciones" placeholder="Reproducciones" className="Artistas-input" defaultValue={reproducciones} required min="0"/>
                <input type="text" name="canciones" placeholder="Canciones (separadas por coma)" className="Artistas-input" defaultValue={cancionesStr}/>
                <div className="Artistas-actions">
                    <input type="submit" value="Guardar" className="Artistas-send Artistas-send--mini"/>
                    <button type="button" className="Artistas-send Artistas-send--mini Artistas-send--secundario" onClick={onCancel}>Cancelar</button>
                </div>
            </form>
        </div>
    )
}


const Tarjeta = ( props ) => {

    const { setEditando, deleteArtista } = useContext(ArtistasContext)

    const { _id, nombre, reproducciones, canciones } = props

    const reproduccionesFmt = (reproducciones || 0).toLocaleString('es-ES')

    return (
        <article className="Tarjeta">
            <img className="Tarjeta-img" src={getImagen(nombre)} alt={nombre} />
            <h3 className="Tarjeta-h3">{nombre}</h3>

            <p className="Tarjeta-p">
                <span className="Tarjeta-pLabel">Reproducciones:</span> {reproduccionesFmt}
            </p>
            <div className="Tarjeta-canciones">
                <span className="Tarjeta-pLabel">Canciones:</span>
                { canciones && canciones.length > 0 ? (
                    <ul className="Tarjeta-cancionesList">
                        { canciones.map( cancion =>
                            <li key={cancion.nombre} className="Tarjeta-cancion">{cancion.nombre}</li>
                        )}
                    </ul>
                ) :
                ( <span className="Tarjeta-cancionesVacio"> Ninguna</span> )
                }
            </div>

            <div className="Tarjeta-actions">
                <button className="Artistas-send Artistas-send--mini" onClick={() => setEditando(props)}>Editar</button>
                <button className="Artistas-send Artistas-send--mini Artistas-send--red" onClick={() => deleteArtista(_id)}>Borrar</button>
            </div>

        </article>
    )
}
