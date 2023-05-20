import { useEffect, useMemo, useState } from 'react';
import { addHours, differenceInSeconds } from 'date-fns';

import '../../styles.css';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

import Modal from 'react-modal'

import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import es from 'date-fns/locale/es';
import { useCalendarStore, useUiStore } from '../../hooks';


registerLocale('es',es);

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    
  },
};

Modal.setAppElement('#root');


export const CalendarModal = () => {
  
  const [ formSubmitted, setFormSubmitted ] = useState(false); 
  
  const { isDateModalOpen, closeDateModal }  = useUiStore();
  const { activeEvent, startSavingEvent } = useCalendarStore()

  const [formValues, setFormValues] = useState({
    title:'',
    notes:'',
    start: new Date(),
    end: addHours(new Date(),2)
  })

  //se tiene que remorizar ese valor si el title cambio o se hace submit del form
  const titleClass = useMemo(() => {

    if ( !formSubmitted ) return '';

    return ( formValues.title.length > 0 ) ? 'is-valid' : 'is-invalid'


  }, [ formValues.title, formSubmitted ])


  useEffect(() => {
    
    if ( activeEvent != null){
      // no enviamos la referencia al objeto sino creamos una nueva instancia
      setFormValues( { ...activeEvent } );
    }
  
  }, [activeEvent])
  


  const onInputChanged = ({ target }) => {
    const { name, value} = target;
    setFormValues({
      ...formValues,
      [name]:value
    })
  }

  const onDateChanged = ( event, changing ) => {

    setFormValues({
      ...formValues,
      [changing]:event
    })


  }

  const onCloseModal = () => {
    closeDateModal();
  }

  const onSubmit = async( event ) => {
    event.preventDefault();
    setFormSubmitted(true);
    //la fecha de inicial siempre debe ser menor a la fecha final
    const difference = differenceInSeconds( formValues.end, formValues.start );
    
    if( isNaN(difference) || difference <= 0) {
      Swal.fire('Fechas incorrectas', 'Revisar las fechas ingresadas', 'error');
      return;
    }

    if( formValues.title.length <= 0 ) return;

    //TODO
    await startSavingEvent( formValues );
    closeDateModal();
    //Remover errores en pantalla 
    // cerrar el modal
    setFormSubmitted( false );
    
    
  }



  return (
    <Modal 
      isOpen={ isDateModalOpen }
      onRequestClose={ onCloseModal }
      style={ customStyles }
      className= "modal"
      overlayClassName= 'modal-fondo'
      closeTimeoutMS={ 200 }
    >
      <h1> Nuevo evento </h1>
      <hr />
      <form className="container" onSubmit={ onSubmit }>
      
          <div className="form-group mb-2">
              <label>Fecha y hora inicio</label>
              <DatePicker
                selected={ formValues.start }
                onChange={ ( event ) => onDateChanged( event , 'start' )}
                className='form-control'
                dateFormat='Pp'
                showTimeSelect
                locale='es'
                timeCaption='Hora'
              />
          </div>
      
          <div className="form-group mb-2">
              <label>Fecha y hora fin</label>
              <DatePicker
                minDate={ formValues.start } 
                selected={ formValues.end }
                onChange={ ( event ) => onDateChanged( event , 'end' )}
                className='form-control'
                dateFormat='Pp'
                showTimeSelect
                locale='es'
                timeCaption='Hora'
              />
          </div>
      
          <hr />
          <div className="form-group mb-2">
              <label>Titulo y notas</label>
              <input 
                  type="text" 
                  className={ `form-control ${ titleClass }`}
                  placeholder="Título del evento"
                  name="title"
                  autoComplete="off"
                  value={ formValues.title }
                  onChange= {onInputChanged}
              />
              <small id="emailHelp" className="form-text text-muted">Una descripción corta</small>
          </div>
      
          <div className="form-group mb-2">
              <textarea 
                  type="text" 
                  className="form-control"
                  placeholder="Notas"
                  rows="5"
                  name="notes"
                  value={ formValues.notes }
                  onChange= {onInputChanged}
              ></textarea>
              <small id="emailHelp" className="form-text text-muted">Información adicional</small>
          </div>
      
          <button
              type="submit"
              className="btn btn-outline-primary btn-block"
          >
              <i className="far fa-save"></i>
              <span> Guardar</span>
          </button>
      
      </form>

    </Modal>
  )
}
