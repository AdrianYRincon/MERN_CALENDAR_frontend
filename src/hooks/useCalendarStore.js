import { useDispatch, useSelector } from "react-redux"
import { onAddnewEvent, onDeleteEvent, onSetActiveEvent, onUpdateEvent, onLoadEvents } from "../store";
import calendarApi from "../api/calendarApi";
import { convertEventsToDateEvents } from "../helpers";
import Swal from "sweetalert2";

export const useCalendarStore  = () => {

  const {  events, activeEvent } = useSelector( state => state.calendar );
  const  { user } = useSelector( state => state.auth );

  const dispatch = useDispatch();

  
  const setActiveEvent = ( calendarEvent ) => {
    dispatch( onSetActiveEvent( calendarEvent ) )
  }

  //Thunks funcion asincrona
  const startSavingEvent = async( calendarEvent ) => {
    // TODO: Update event
  
    try {
      // TODO bien
      if( calendarEvent.id ){
      //Actualizando
        await calendarApi.put(`/events/${ calendarEvent.id }`, calendarEvent );
        dispatch( onUpdateEvent( { ...calendarEvent, user } ) );
        return;
      }

      //Creando
      const { data } = await calendarApi.post('/events', calendarEvent );
      dispatch( onAddnewEvent({...calendarEvent, id: data.evento.id, user }) );

    } catch (error) {
      
      console.log(error);
      Swal.fire('Error al guardar', error.response.data?.msg , 'error' );
    }

   
  

  }

  const startDeletingEvent = async() => {
    // Todo: Llegar al backend
    try {
      await calendarApi.delete(`/events/${activeEvent.id}`);
      dispatch( onDeleteEvent() );
    } catch (error) {
      
      console.log(error);
      Swal.fire('Error al eliminar', error.response.data?.msg , 'error' );
    }

  }

  const startLoadingEvents = async() => {

    try {
      
      const { data } = await calendarApi.get('/events');
      const events =  convertEventsToDateEvents( data.eventos );
      dispatch( onLoadEvents( events ) );
      
    } catch (error) {
      console.log('Error cargando eventos');
      console.log(error);
    }

  };


  return {
    //*properties
    events,
    activeEvent,
    //si es null regresara falso pero si tiene un objeto regresa true   
    hasEventSelected: activeEvent ,

    //*methods
    setActiveEvent,
    startSavingEvent,
    startDeletingEvent,
    startLoadingEvents,

  }

}

