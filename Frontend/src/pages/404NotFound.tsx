import { Link } from 'react-router-dom';
import mainTitle from '../asset/mainTitle.svg'

const NotFound = () => (
  <div className='not-found-container'>
    <img src={mainTitle} className='mainTitle' alt="mainTitle"/>
    <h1>404 - Not Found!</h1>
    <Link to="/" className='ButtonStyle navButton'>Home</Link>
  </div>
);

export default NotFound;