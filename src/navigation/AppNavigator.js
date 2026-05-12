import { createNativeStackNavigator } from '@react-navigation/native-stack';

/* ADMIN MODUL */
import AdminChatScreen from '../screens/roles/admin/AdminChatScreen.js';
import AdminFooldalKepernyo from '../screens/roles/admin/AdminFooldalKepernyo.js';
import AdminLoginScreen from '../screens/roles/admin/AdminLoginScreen.js';
import AdminUzenetekScreen from '../screens/roles/admin/AdminUzenetekScreen.js';
import ItalHozzaadasScreen from '../screens/roles/admin/ItalHozzaadasScreen.js';
import ItalokScreen from '../screens/roles/admin/ItalokScreen.js';
import ItalReszletekScreen from '../screens/roles/admin/ItalReszletekScreen.js';
import ItalSzerkesztesScreen from '../screens/roles/admin/ItalSzerkesztesScreen.js';
import PultHozzaadasScreen from '../screens/roles/admin/PultHozzaadasScreen.js';
import PultInicializalasScreen from '../screens/roles/admin/PultInicializalasScreen.js';
import PultokScreen from '../screens/roles/admin/PultokScreen.js';
import ToroltItalokScreen from '../screens/roles/admin/ToroltItalokScreen.js';

/* JEGYSZEDŐ MODUL */
import JegyszedoChatScreen from '../screens/roles/jegyszedo/JegyszedoChatScreen.js';
import JegyszedoLogin from '../screens/roles/jegyszedo/JegyszedoLogin.js';
import JegyszedoScreen from '../screens/roles/jegyszedo/JegyszedoScreen.js';

/* PULTOS MODUL */
import PultosFooldal from '../screens/roles/pultos/PultosFooldal.js';
import PultosLogin from '../screens/roles/pultos/PultosLogin.js';
import PultosScreen from '../screens/roles/pultos/PultosScreen.js';   // ✔ javítva
import PultValaszto from '../screens/roles/pultos/PultValaszto.js';
import UzenetUzletvezeto from '../screens/roles/pultos/UzenetUzletvezeto.js';

/* POHARAS MODUL */
import PoharasChatScreen from "../screens/roles/poharas/PoharasChatScreen.js";
import PoharasItalFeliras from '../screens/roles/poharas/PoharasItalFeliras.js';
import PoharasLogin from '../screens/roles/poharas/PoharasLogin.js';
import PoharasOsszegzes from '../screens/roles/poharas/PoharasOsszegzes.js';
import PoharasPultValaszto from '../screens/roles/poharas/PoharasPultValaszto.js';
import PoharasScreen from '../screens/roles/poharas/PoharasScreen.js';

/* RUHATÁROS MODUL */
import RuhatarosChatScreen from '../screens/roles/ruhataros/RuhatarosChatScreen.js';
import RuhatarosLogin from '../screens/roles/ruhataros/RuhatarosLogin.js';
import RuhatarosScreen from '../screens/roles/ruhataros/RuhatarosScreen.js';

/* TAKARÍTÓ MODUL */
import TakaritoChatScreen from '../screens/roles/takarito/TakaritoChatScreen.js';
import TakaritoLogin from '../screens/roles/takarito/TakaritoLogin.js';
import TakaritoScreen from '../screens/roles/takarito/TakaritoScreen.js';

/* SZEREPKÖR KEZELÉS */
import RoleSelectionScreen from '../screens/RoleSelectionScreen.js';
import FelhasznaloSzerepkor from '../screens/szerepkorok/FelhasznaloSzerepkor.js';
import SzerepkorLetrehozas from '../screens/szerepkorok/SzerepkorLetrehozas.js';
import SzerepkorLista from '../screens/szerepkorok/SzerepkorLista.js';
import SzerepkorokFooldal from '../screens/szerepkorok/SzerepkorokFooldal.js';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>

      {/* KEZDŐLAP */}
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} options={{ title: "Szerepkör választás" }} />

      {/* JEGYSZEDŐ FLOW */}
      <Stack.Screen name="JegyszedoLogin" component={JegyszedoLogin} options={{ title: "Jegyszedő bejelentkezés" }} />
      <Stack.Screen name="Jegyszedo" component={JegyszedoScreen} options={{ title: "Jegyszedő feladatok" }} />
      <Stack.Screen name="JegyszedoChatScreen" component={JegyszedoChatScreen} options={{ title: "Üzenetek" }} />

      {/* PULTOS FLOW */}
      <Stack.Screen name="PultValaszto" component={PultValaszto} />
      <Stack.Screen name="PultosLogin" component={PultosLogin} />
      <Stack.Screen name="PultosFooldal" component={PultosFooldal} />
      <Stack.Screen name="Pultos" component={PultosScreen} />
      <Stack.Screen name="UzenetUzletvezeto" component={UzenetUzletvezeto} />

      {/* POHARAS FLOW */}
      <Stack.Screen name="PoharasLogin" component={PoharasLogin} />
      <Stack.Screen name="PoharasPultValaszto" component={PoharasPultValaszto} />
      <Stack.Screen name="Poharas" component={PoharasScreen} />
      <Stack.Screen name="PoharasItalFeliras" component={PoharasItalFeliras} />
      <Stack.Screen name="PoharasOsszegzes" component={PoharasOsszegzes} />
      <Stack.Screen name="PoharasChatScreen" component={PoharasChatScreen} />

      {/* RUHATÁROS FLOW */}
      <Stack.Screen name="Ruhataros" component={RuhatarosScreen} />
      <Stack.Screen name="RuhatarosLogin" component={RuhatarosLogin} />
      <Stack.Screen name="RuhatarosChatScreen" component={RuhatarosChatScreen} />

      {/* TAKARÍTÓ FLOW */}
      <Stack.Screen name="TakaritoLogin" component={TakaritoLogin} />
      <Stack.Screen name="Takarito" component={TakaritoScreen} />
      <Stack.Screen name="TakaritoChatScreen" component={TakaritoChatScreen} />

      {/* SZEREPKÖR KEZELÉS */}
      <Stack.Screen name="SzerepkorokFooldal" component={SzerepkorokFooldal} />
      <Stack.Screen name="SzerepkorLista" component={SzerepkorLista} />
      <Stack.Screen name="SzerepkorLetrehozas" component={SzerepkorLetrehozas} />
      <Stack.Screen name="FelhasznaloSzerepkor" component={FelhasznaloSzerepkor} />

      {/* ADMIN FLOW */}
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
      <Stack.Screen name="AdminFooldal" component={AdminFooldalKepernyo} />
      <Stack.Screen name="AdminUzenetek" component={AdminUzenetekScreen} />
      <Stack.Screen name="AdminChat" component={AdminChatScreen} />
      <Stack.Screen name="Italok" component={ItalokScreen} />
      <Stack.Screen name="ItalReszletek" component={ItalReszletekScreen} />
      <Stack.Screen name="ItalSzerkesztes" component={ItalSzerkesztesScreen} />
      <Stack.Screen name="ItalHozzaadas" component={ItalHozzaadasScreen} />
      <Stack.Screen name="PultHozzaadas" component={PultHozzaadasScreen} />
      <Stack.Screen name="PultInicializalas" component={PultInicializalasScreen} />
      <Stack.Screen name="Pultok" component={PultokScreen} />
      <Stack.Screen name="ToroltItalok" component={ToroltItalokScreen} />

    </Stack.Navigator>
  );
}
