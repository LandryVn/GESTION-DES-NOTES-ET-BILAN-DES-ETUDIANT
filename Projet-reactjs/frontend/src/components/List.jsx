import { useEffect, useState, useCallback } from 'react';
import Swal from 'sweetalert2';


export default function List() {
  const [etudiants, setEtudiants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEtudiant, setCurrentEtudiant] = useState(null);
  const [editForm, setEditForm] = useState({
    nom: '',
    note_math: '',
    note_phys: ''
  });

  const fetchEtudiants = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost/backend/api.php?action=list');
      
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      
      const data = await response.json();
      
      if (data.success) {
        setEtudiants(data.data);
      } else {
        setError(data.message || 'Erreur inconnue du serveur');
        await showErrorAlert(data.message);
      }
    } catch (err) {
      console.error("Erreur de récupération:", err);
      setError(err.message);
      await showErrorAlert(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEtudiants();
  }, [fetchEtudiants]);

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

  const handleDelete = async (numEt) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Confirmer la suppression',
      html: `
        <div class="text-gray-700">Voulez-vous vraiment supprimer l'étudiant <strong>${numEt}</strong> ?</div>
        <div class="mt-2 text-sm text-red-500">Cette action est irréversible</div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      customClass: {
        popup: 'rounded-lg',
        confirmButton: 'px-4 py-2 bg-red-600 rounded text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 mr-2',
        cancelButton: 'px-4 py-2 bg-gray-500 rounded text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500'
      },
      buttonsStyling: false,
      showClass: {
        popup: 'animate__animated animate__fadeIn'
      }
    });

    if (isConfirmed) {
      try {
        const response = await fetch(`http://localhost/backend/api.php?action=delete&numEt=${numEt}`);
        const result = await response.json();

        if (result.success) {
          await Swal.fire({
            icon: 'success',
            title: 'Supprimé!',
            text: result.message,
            timer: 3000,
            showConfirmButton: false,
            showClass: {
              popup: 'animate__animated animate__fadeIn'
            }
          });
          fetchEtudiants();
        } else {
          await showErrorAlert(result.message);
        }
      } catch (err) {
        await showErrorAlert('Erreur réseau lors de la suppression');
      }
    }
  };

  const openEditModal = (etudiant) => {
    setCurrentEtudiant(etudiant);
    setEditForm({
      nom: etudiant.nom,
      note_math: etudiant.note_math,
      note_phys: etudiant.note_phys
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost/backend/api.php?action=update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numEt: currentEtudiant.numEt,
          ...editForm
        })
      });
      const data = await response.json();

      if (data.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Modifié!',
          text: data.message,
          timer: 3000,
          showConfirmButton: false,
          showClass: {
            popup: 'animate__animated animate__fadeIn'
          }
        });
        setShowEditModal(false);
        fetchEtudiants();
      } else {
        await showErrorAlert(data.message);
      }
    } catch (err) {
      await showErrorAlert('Erreur réseau lors de la modification');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = etudiants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(etudiants.length / itemsPerPage);

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
                  onClick={fetchEtudiants}
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
    <div className="px-4 sm:px-6 lg:px-8">
      

      {showEditModal && currentEtudiant && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Modifier {currentEtudiant.nom}
                </h3>
                <form onSubmit={handleEditSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input
                      type="text"
                      name="nom"
                      value={editForm.nom}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Maths</label>
                      <input
                        type="number"
                        name="note_math"
                        value={editForm.note_math}
                        onChange={handleInputChange}
                        min="0"
                        max="20"
                        step="0.5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Physique</label>
                      <input
                        type="number"
                        name="note_phys"
                        value={editForm.note_phys}
                        onChange={handleInputChange}
                        min="0"
                        max="20"
                        step="0.5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        
      )}
      
      
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-5">Liste des Étudiants</h1>
          <p className="mt-2 text-sm text-gray-700">
            {etudiants.length} étudiants trouvés
          </p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Numéro
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Maths
                </th>
                <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Physique
                </th>
                <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Moyenne
                </th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((etudiant) => (
                <tr key={etudiant.numEt} className="hover:bg-gray-50">
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {etudiant.numEt}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    {etudiant.nom}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      etudiant.note_math >= 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {etudiant.note_math}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      etudiant.note_phys >= 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {etudiant.note_phys}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center font-medium">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      etudiant.moyenne >= 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {etudiant.moyenne || ((etudiant.note_math + etudiant.note_phys) / 2).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(etudiant)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(etudiant.numEt)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        
        {totalPages > 1 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage <span className="font-medium">{indexOfFirstItem + 1}</span> à{' '}
                  <span className="font-medium">{Math.min(indexOfLastItem, etudiants.length)}</span> sur{' '}
                  <span className="font-medium">{etudiants.length}</span> résultats
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Précédent</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page 
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Suivant</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}