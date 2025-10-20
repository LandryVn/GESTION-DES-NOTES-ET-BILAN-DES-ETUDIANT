import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Ajouter from "./components/Ajouter";
import List from "./components/List";
import Stats from "./components/Stats";

export default function App() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 transition-all duration-300">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
          <Routes>
            <Route path="/ajouter" element={<Ajouter />} />
            <Route path="/liste" element={<List />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/" element={<List />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}