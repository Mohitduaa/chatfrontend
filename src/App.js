import './App.css';
import { UserProvider } from './contex/user.contex';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <div>
      <UserProvider>
      <AppRoutes/>
      </UserProvider>
    </div>
  );
}

export default App;
