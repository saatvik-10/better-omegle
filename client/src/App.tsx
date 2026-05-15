import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Landing from './screens/Landing';
import Room from './screens/Room';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path='/room' element={<Room />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
