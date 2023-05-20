import { useDispatch, useSelector } from 'react-redux'
import calendarApi from '../api/calendarApi';
import { clearErrorMessage, onChecking, onLogin, onLogout, onLogoutCalendar } from '../store';


export const useAuthStore = () => {

  const { status, user, errorMessage } = useSelector( state => state.auth );
  const dispatch = useDispatch();

  const startLogin = async({ email, password }) => {

    //ponemos la app en un estado de carga
    dispatch( onChecking() );   
    
    try {
      const { data } =  await calendarApi.post('/auth',{ email, password });
      //establecemos el token en el localStorage
      localStorage.setItem('token', data.token );  
      localStorage.setItem('token-init-date', new Date().getTime() );  
      dispatch( onLogin({ name:data.name, uid:data.uid }) );

    } catch (error) {
      dispatch( onLogout('Credenciales incorrectas') );
      setTimeout(() => {
        dispatch( clearErrorMessage() );
      }, 10);
    }


  };

  const startRegister = async({ name, email, password }) => {

    dispatch(onChecking());
    try {
      const { data } =  await calendarApi.post('/auth/new',{ name ,email, password });
      //establecemos el token en el localStorage
      localStorage.setItem('token', data.token );  
      localStorage.setItem('token-init-date', new Date().getTime() );  
      dispatch( onLogin({ name:data.name, uid:data.uid }) );

    } catch (error) {
      const messageError = error.response.data?.msg || '';
      dispatch( onLogout( messageError ) );
      setTimeout(() => {
        dispatch( clearErrorMessage() );
      }, 10);
    }
    
    
  };

  const checkAuthToken = async() => {

    const token = localStorage.getItem('token');
    if( !token ) return dispatch( onLogout() );

    try {
      //renovamos el token autenticacion
      const { data } = await calendarApi.get('auth/renew');
      localStorage.setItem('token', data.token );
      localStorage.setItem('token-init-date', new Date().getTime() );  
      dispatch( onLogin({ name:data.name, uid:data.uid }) );
    } catch (error) {
      //Limpiamos lo que hay en el local Storage
      localStorage.clear();
      dispatch( onLogout() );
    }


  };

  const startLogout = () => {
    
    localStorage.clear();
    dispatch( onLogoutCalendar() );
    dispatch( onLogout() );
  
  }

 
  return {
    //* Propiedades
    status,
    user,
    errorMessage,
    //* Métodos
    checkAuthToken,
    startLogin,
    startRegister,
    startLogout
  }

}