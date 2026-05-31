import { useState } from 'react';


export default function AjouterSimple() {
  const [numEt, setNumEt] = useState('');
  const [nom, setNom] = useState('');
  const [noteMath, setNoteMath] = useState(0);
  const [notePhys, setNotePhys] = useState(0);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const etudiant = {
      numEt,
      nom,
      note_math: parseFloat(noteMath),
      note_phys: parseFloat(notePhys)
    };

    try {
      const reponse = await fetch('http://localhost/backend/api.php?action=add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(etudiant)
      });
      
      const resultat = await reponse.json();
      setMessage(resultat.message);
      
      if (resultat.success) {
        setNumEt('');
        setNom('');
        setNoteMath(0);
        setNotePhys(0);
      }
    } catch (erreur) {
      setMessage("Erreur lors de l'envoi");
      console.error(erreur);
    }
  };
 
  return (
    <div className="max-w-md mx-auto mt-5 p-5 border border-gray-200 rounded-lg shadow-sm">
      {/* <h2 className="text-2xl font-bold text-gray-800 mb-5">Ajouter un Étudiant</h2> */}
      
      {message && (
        <div className={`p-3 mb-5 rounded-md ${
          message.includes('succès') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}
  
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numéro Étudiant:
          </label>
          <input
            type="text"
            value={numEt}
            onChange={(e) => setNumEt(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
  
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom Complet:
          </label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
  
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note Maths:
            </label>
            <input
              type="number"
              min="0"
              max="20"
              step="0.5"
              value={noteMath}
              onChange={(e) => setNoteMath(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note Physique:
            </label>
            <input
              type="number"
              min="0"
              max="20"
              step="0.5"
              value={notePhys}
              onChange={(e) => setNotePhys(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
  
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Enregistrer
        </button>
      </form>
    </div>
  );
  
}