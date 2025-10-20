import { Link } from "react-router-dom";
import { 
  FaUserPlus, 
  FaList, 
  FaChartBar,
  FaGraduationCap 
} from "react-icons/fa";
import "../styles/sidebar.css";

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-800 text-white p-5 fixed h-full">
      
      <div className="flex items-center mb-8">
        <FaGraduationCap className="text-blue-400 text-2xl mr-3" />
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Gestion Étudiants
        </h2>
      </div>

      <ul className="space-y-2">
        {[
          { to: "/ajouter", icon: <FaUserPlus />, text: "Ajouter un étudiant" },
          { to: "/liste", icon: <FaList />, text: "Liste des étudiants" },
          { to: "/stats", icon: <FaChartBar />, text: "Statistiques" }
        ].map((item, index) => (
          <li key={index}>
            <Link
              to={item.to}
              className="flex items-center py-3 px-4 rounded-lg hover:bg-gray-700 transition-all duration-300 group"
            >
              <span className="text-blue-300 group-hover:text-blue-400 mr-3 text-lg">
                {item.icon}
              </span>
              <span className="group-hover:translate-x-1 transition-transform">
                {item.text}
              </span>
            </Link>
          </li>
        ))}
      </ul>

     
      <style jsx>{`
        li a.active {
          background: rgba(59, 130, 246, 0.2);
          border-left: 3px solid #3B82F6;
        }
      `}</style>
    </div>
  );
}