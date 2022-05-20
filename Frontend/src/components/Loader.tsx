import "./Loader.css"
 
 
 const Loader = () => {
     return (
        <div className="loader-wrapper">
            <div className="loader-container">
                <div className="loader-racket left-racket"></div>
                <div className="loader-ball"></div>
                <div className="loader-racket right-racket"></div>
            </div>
        </div>
     )
 }

 export default Loader;
