import { ReactElement } from 'react';
import {
    Routes,
    Route,
    Link,
    Navigate,
    Outlet,
  } from 'react-router-dom';
import Loader from './components/Loader';
  
interface Props {
  isAuth: boolean;
  isLoading: boolean;
  redirectPath?: string;
  children?: ReactElement
}

  
  const ProtectedRoute = ({isAuth, isLoading , redirectPath = '/', children }: Props) => {
    if (isLoading)
      return <Loader />
    if (!isAuth ) {
      return <Navigate to={redirectPath} replace />;
    }
  
    return children ? children : <Outlet />;
  };

  export default ProtectedRoute