import { useState, useEffect, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Swal from 'sweetalert2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Stat() {
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openPanel, setOpenPanel] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const statsResponse = await fetch('http://localhost/backend/api.php?action=stats');
      if (!statsResponse.ok) throw new Error(`Erreur HTTP: ${statsResponse.status}`);
      
      const statsData = await statsResponse.json();
      if (!statsData.success) throw new Error(statsData.message || 'Erreur inconnue du serveur');

      const studentsResponse = await fetch('http://localhost/backend/api.php?action=list');
      if (!studentsResponse.ok) throw new Error(`Erreur HTTP: ${studentsResponse.status}`);
      
      const studentsData = await studentsResponse.json();
      if (!studentsData.success) throw new Error(studentsData.message || 'Erreur inconnue du serveur');

      setStats({
        ...statsData.data,
        moyenne_classe: Number(statsData.data.moyenne_classe),
        moyenne_min: Number(statsData.data.moyenne_min),
        moyenne_max: Number(statsData.data.moyenne_max)
      });
      setStudents(studentsData.data);
    } catch (err) {
      console.error("Erreur de récupération:", err);
      setError(err.message);
      await showErrorAlert(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const showErrorAlert = async (message) => {
    await Swal.fire({
      icon: 'error',
      title: 'Erreur',
      html: `
        <div class="text-gray-700">${message}</div>
        <div class="mt-3 text-sm text-gray-500">
          Vérifiez que le serveur backend est démarré et que l'URL est correcte
        </div>
      `,
      confirmButtonColor: '#dc3545',
      customClass: {
        popup: 'rounded-lg',
        confirmButton: 'px-4 py-2 bg-red-600 rounded text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500'
      },
      buttonsStyling: false
    });
  };

  const chartData = {
    labels: students.map(student => student.nom),
    datasets: [
      {
        label: 'Moyenne des étudiants',
        data: students.map(student => {
          const math = Number(student.note_math) || 0;
          const phys = Number(student.note_phys) || 0;
          return (math + phys) / 2;
        }),
        backgroundColor: students.map(student => {
          const math = Number(student.note_math) || 0;
          const phys = Number(student.note_phys) || 0;
          return ((math + phys) / 2) >= 10 
            ? 'rgba(75, 192, 192, 0.6)' 
            : 'rgba(255, 99, 132, 0.6)';
        }),
        borderColor: students.map(student => {
          const math = Number(student.note_math) || 0;
          const phys = Number(student.note_phys) || 0;
          return ((math + phys) / 2) >= 10 
            ? 'rgba(75, 192, 192, 1)' 
            : 'rgba(255, 99, 132, 1)';
        }),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Moyennes des étudiants',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 20,
        ticks: {
          stepSize: 2
        }
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erreur de chargement</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                <button
                  onClick={fetchStats}
                  className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Statistiques de la Classe</h1>
      
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Résultats Généraux</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nombre d'étudiants</p>
                  <p className="text-2xl font-semibold">{stats.total_etudiants ?? 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Moyenne de classe</p>
                  <p className="text-2xl font-semibold">
                    {typeof stats.moyenne_classe === 'number' 
                      ? stats.moyenne_classe.toFixed(2) 
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Notes Extrêmes</h3>
              <div className="space-y-3">
              <div className="border border-blue-200 rounded-lg overflow-hidden transition-all duration-300">
            
             <button 
    className="w-full flex justify-between items-center p-4 bg-blue-50 hover:bg-blue-100 focus:outline-none transition-colors duration-200"
    onClick={() => setOpenPanel(openPanel === 'min_note' ? null : 'min_note')}
    aria-expanded={openPanel === 'min_note'}
  >
    <div className="flex flex-col items-start">
      <p className="text-sm text-gray-500">Note minimale</p>
      <p className="text-2xl font-semibold text-blue-600">
        {typeof stats.moyenne_min === 'number' ? stats.moyenne_min.toFixed(2) : 'N/A'}
      </p>
    </div>
    <svg 
      className={`w-5 h-5 text-blue-600 transform transition-transform duration-300 ${
        openPanel === 'min_note' ? 'rotate-180' : ''
      }`}
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </button>


{openPanel === 'min_note' && (() => {
  const etudiantMinNote = students.find(student => {
    const math = Number(student.note_math) || 0;
    const phys = Number(student.note_phys) || 0;
    const moyenne = (math + phys) / 2;
    return moyenne.toFixed(2) === stats.moyenne_min.toFixed(2);
  });

  return (
    <div className="transition-all duration-300 overflow-hidden max-h-[500px]">
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {etudiantMinNote ? (
                <tr key={`minnote-${etudiantMinNote.numEt}`}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {etudiantMinNote.numEt}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {etudiantMinNote.nom}
                  </td>
                  
                </tr>
              ) : (
                <tr>
                  <td colSpan="3" className="px-4 py-3 text-center text-sm text-gray-500">
                    Aucun étudiant avec cette note.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
})()}
 </div>


 <div className="border border-blue-200 rounded-lg overflow-hidden transition-all duration-300">
  
  <button 
    className="w-full flex justify-between items-center p-4 bg-blue-50 hover:bg-blue-100 focus:outline-none transition-colors duration-200"
    onClick={() => setOpenPanel(openPanel === 'max_note' ? null : 'max_note')}
    aria-expanded={openPanel === 'max_note'}
  >
    <div className="flex flex-col items-start">
      <p className="text-sm text-gray-500">Note maximale</p>
      <p className="text-2xl font-semibold text-blue-600">
        {typeof stats.moyenne_max === 'number' ? stats.moyenne_max.toFixed(2) : 'N/A'}
      </p>
    </div>
    <svg 
      className={`w-5 h-5 text-blue-600 transform transition-transform duration-300 ${
        openPanel === 'max_note' ? 'rotate-180' : ''
      }`}
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  
  {openPanel === 'max_note' && (() => {
    const etudiantMaxNote = students.find(student => {
      const math = Number(student.note_math) || 0;
      const phys = Number(student.note_phys) || 0;
      const moyenne = (math + phys) / 2;
      return moyenne.toFixed(2) === stats.moyenne_max.toFixed(2);
    });

    return (
      <div className="transition-all duration-300 overflow-hidden max-h-[500px]">
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {etudiantMaxNote ? (
                  <tr key={`maxnote-${etudiantMaxNote.numEt}`}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {etudiantMaxNote.numEt}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {etudiantMaxNote.nom}
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan="3" className="px-4 py-3 text-center text-sm text-gray-500">
                      Aucun étudiant avec cette note.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  })()}
</div>

              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Réussite</h3>
              <div className="space-y-3">
               
              <div className="border border-green-200 rounded-lg overflow-hidden transition-all duration-300">
              <button 
  className="w-full flex justify-between items-center p-4 bg-green-50 hover:bg-green-100 focus:outline-none transition-colors duration-200"
  onClick={() => setOpenPanel(openPanel === 'admis' ? null : 'admis')}
  aria-expanded={openPanel === 'admis'}
>
  <div className="flex flex-col items-start">
    <p className="text-sm text-gray-500">Étudiants admis (≥10)</p>
    <p className="text-2xl font-semibold text-green-600">{stats.admis ?? 0}</p>
  </div>
  <svg 
    className={`w-5 h-5 text-green-600 transform transition-transform duration-300 ${
      openPanel === 'admis' ? 'rotate-180' : ''
    }`}
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
</button>
                
                <div 
                  className={`transition-all duration-300 overflow-hidden ${
                    openPanel === 'admis' ? 'max-h-[500px]' : 'max-h-0'
                  }`}
                >
                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Moyenne</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {students
                            .filter(student => {
                              const math = Number(student.note_math) || 0;
                              const phys = Number(student.note_phys) || 0;
                              return (math + phys) / 2 >= 10;
                            })
                            .map((student) => {
                              const math = Number(student.note_math) || 0;
                              const phys = Number(student.note_phys) || 0;
                              const moyenne = (math + phys) / 2;
                              
                              return (
                                <tr key={`admis-${student.numEt}`}>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {student.nom}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-medium">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      {moyenne.toFixed(2)}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
              

              
              <div className="border border-red-200 rounded-lg overflow-hidden transition-all duration-300">
              <button 
  className="w-full flex justify-between items-center p-4 bg-red-50 hover:bg-red-100 focus:outline-none transition-colors duration-200"
  onClick={() => setOpenPanel(openPanel === 'redoublants' ? null : 'redoublants')}
  aria-expanded={openPanel === 'redoublants'}
>
  <div className="flex flex-col items-start">
    <p className="text-sm text-gray-500">Étudiants redoublants (&lt;10)</p>
    <p className="text-2xl font-semibold text-red-600">{stats.redoublants ?? 0}</p>
  </div>
  <svg 
    className={`w-5 h-5 text-red-600 transform transition-transform duration-300 ${
      openPanel === 'redoublants' ? 'rotate-180' : ''
    }`}
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
</button>

                
                <div 
                  className={`transition-all duration-300 overflow-hidden ${
                    openPanel === 'redoublants' ? 'max-h-[500px]' : 'max-h-0'
                  }`}
                >
                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Moyenne</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {students
                            .filter(student => {
                              const math = Number(student.note_math) || 0;
                              const phys = Number(student.note_phys) || 0;
                              return (math + phys) / 2 < 10;
                            })
                            .map((student) => {
                              const math = Number(student.note_math) || 0;
                              const phys = Number(student.note_phys) || 0;
                              const moyenne = (math + phys) / 2;
                              
                              return (
                                <tr key={`redoublant-${student.numEt}`}>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {student.nom}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-medium">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                      {moyenne.toFixed(2)}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Répartition des Résultats</h3>
            <div className="h-96 w-full">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}