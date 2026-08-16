import {BrowserRouter, Route, Routes} from "react-router-dom"
import LandingPage from "./pages/LandingPage";
import SignIn from "./Authentication/SignIn"
import SignUp from "./Authentication/SignUp";
import Videomeet from "./pages/Videomeet";
import HomeComponent from "./pages/HomeComponent";
import './App.css'
function App() {
 
  return (
    <div className="appContainer">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<LandingPage/>}/>
          <Route path='/home' element={<HomeComponent/>}/>
          <Route path="/signIn" element={<SignIn/>}/>
          <Route path="/signUp" element={<SignUp/>} />
           {/* to dynamic route set  */}
          <Route path='/:url' element={<Videomeet/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
