import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './publish-project.css';

interface SubCategory {
  id: number;
  name: string;
  slug: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  subCategories: SubCategory[];
}

interface PublishProjectProps {
  userId: number | null;
  onProjectPublished: () => void;
  projectToEdit?: any;
}

export const PublishProject: React.FC<PublishProjectProps> = ({ userId, onProjectPublished, projectToEdit }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>(projectToEdit?.categoryId || '');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | ''>(projectToEdit?.subCategoryId || '');
  
  // États de formulaire
  const [title, setTitle] = useState(projectToEdit?.title || '');
  const [description, setDescription] = useState(projectToEdit?.description || '');
  const [budget, setBudget] = useState<number | ''>(projectToEdit?.budget || '');
  const [budgetType, setBudgetType] = useState<'FIXED' | 'HOURLY'>(projectToEdit?.budgetType || 'FIXED');
  const [experienceLevel, setExperienceLevel] = useState<'JUNIOR' | 'INTERMEDIATE' | 'EXPERT'>(projectToEdit?.experienceLevel || 'INTERMEDIATE');
  const [duration, setDuration] = useState(projectToEdit?.duration || '');
  
  const [loading, setLoading] = useState(false);
  const [loadingCats, setLoadingCats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les catégories depuis le backend au démarrage
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/client/categories');
        setCategories(response.data);
      } catch (err) {
        console.warn("Impossible de charger les catégories depuis l'API, utilisation de données simulées.");
        setCategories([
          {
            id: 1,
            name: 'Développement Web & Logiciel',
            slug: 'dev-web-logiciel',
            subCategories: [
              { id: 1, name: 'React / Next.js', slug: 'react-nextjs' },
              { id: 2, name: 'Node.js / NestJS', slug: 'nodejs-nestjs' },
              { id: 3, name: 'WordPress / PHP', slug: 'wordpress-php' },
            ]
          },
          {
            id: 2,
            name: 'Design & Graphisme',
            slug: 'design-graphisme',
            subCategories: [
              { id: 4, name: 'UI/UX Design Mobile & Web', slug: 'ui-ux-design' },
              { id: 5, name: 'Identité Visuelle & Logo', slug: 'logo-branding' },
              { id: 6, name: 'Montage Vidéo & Motion', slug: 'video-motion' },
            ]
          }
        ]);
      } finally {
        setLoadingCats(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const catId = e.target.value === '' ? '' : parseInt(e.target.value, 10);
    setSelectedCategoryId(catId);
    setSelectedSubCategoryId(''); // Réinitialiser la sous-catégorie
  };

  const getFilteredSubCategories = () => {
    if (selectedCategoryId === '') return [];
    const matchedCat = categories.find(c => c.id === selectedCategoryId);
    return matchedCat ? matchedCat.subCategories : [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !description || !selectedCategoryId || !selectedSubCategoryId || !budget) {
      setError("Veuillez remplir tous les champs obligatoires (Titre, Description, Catégorie, Sous-catégorie, Budget).");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title,
        description,
        categoryId: Number(selectedCategoryId),
        subCategoryId: Number(selectedSubCategoryId),
        budget: Number(budget),
        budgetType,
        experienceLevel,
        duration: duration || undefined,
      };

      if (projectToEdit) {
        // Mode modification
        await axios.put(`http://localhost:3000/api/client/projects/${projectToEdit.id}`, payload);
        
        Swal.fire({
          title: 'Projet mis à jour !',
          text: 'Les modifications ont été enregistrées avec succès.',
          icon: 'success',
          timer: 1800,
          showConfirmButton: false,
          timerProgressBar: true,
          heightAuto: false,
        }).then(() => {
          onProjectPublished();
        });
      } else {
        // Mode création
        await axios.post(`http://localhost:3000/api/client/${userId || 1}/projects`, payload);

        Swal.fire({
          title: 'Projet publié avec succès !',
          text: 'Votre projet est maintenant en ligne et prêt à recevoir des candidatures.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
          heightAuto: false,
        }).then(() => {
          onProjectPublished();
        });
      }
    } catch (err: any) {
      console.error("Erreur de soumission du projet :", err);
      const message = err.response?.data?.message || "Impossible d'enregistrer le projet. Veuillez réessayer.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="publish-project-page">
      <div className="publish-card card">
        <div className="publish-header">
          <h2 className="publish-title">{projectToEdit ? "Modifier le projet" : "Publier un nouveau projet"}</h2>
          <p className="publish-subtitle">
            {projectToEdit
              ? "Modifiez les informations de votre projet ci-dessous."
              : "Décrivez vos besoins pour attirer les meilleurs freelances de la plateforme."}
          </p>
        </div>

        {error && (
          <div className="publish-error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="publish-form">
          <div className="form-group">
            <label htmlFor="project-title" className="form-label">Titre du projet <span className="required">*</span></label>
            <input
              type="text"
              id="project-title"
              className="form-input-text"
              placeholder="Ex: Création d'une application mobile de livraison"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="project-category" className="form-label">Catégorie <span className="required">*</span></label>
              <select
                id="project-category"
                className="form-select"
                value={selectedCategoryId}
                onChange={handleCategoryChange}
                disabled={loading || loadingCats}
                required
              >
                <option value="">Sélectionnez une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="project-subcategory" className="form-label">Sous-catégorie <span className="required">*</span></label>
              <select
                id="project-subcategory"
                className="form-select"
                value={selectedSubCategoryId}
                onChange={(e) => setSelectedSubCategoryId(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                disabled={loading || selectedCategoryId === ''}
                required
              >
                <option value="">Sélectionnez une sous-catégorie</option>
                {getFilteredSubCategories().map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="project-description" className="form-label">Description détaillée <span className="required">*</span></label>
            <textarea
              id="project-description"
              className="form-textarea"
              placeholder="Décrivez précisément votre projet, les compétences recherchées, les livrables attendus..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={6}
              required
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="budget-type" className="form-label">Type de budget <span className="required">*</span></label>
              <select
                id="budget-type"
                className="form-select"
                value={budgetType}
                onChange={(e) => setBudgetType(e.target.value as 'FIXED' | 'HOURLY')}
                disabled={loading}
              >
                <option value="FIXED">Budget Fixe</option>
                <option value="HOURLY">Taux Horaire</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="project-budget" className="form-label">
                Budget ({budgetType === 'FIXED' ? 'XOF total' : 'XOF / heure'}) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="project-budget"
                className="form-input-text"
                placeholder="Ex: 250000"
                value={budget}
                onChange={(e) => setBudget(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={loading}
                min={1}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="experience-level" className="form-label">Niveau d'expérience requis <span className="required">*</span></label>
              <select
                id="experience-level"
                className="form-select"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as 'JUNIOR' | 'INTERMEDIATE' | 'EXPERT')}
                disabled={loading}
              >
                <option value="JUNIOR">Junior (Débutant)</option>
                <option value="INTERMEDIATE">Intermédiaire (Expérience modérée)</option>
                <option value="EXPERT">Expert (Profil senior)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="project-duration" className="form-label">Durée estimée</label>
              <input
                type="text"
                id="project-duration"
                className="form-input-text"
                placeholder="Ex: 2 semaines, 1 mois, continu..."
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="publish-actions">
            <button
              type="button"
              className="btn btn-secondary btn-publish-cancel"
              onClick={onProjectPublished}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-publish-submit"
              disabled={loading}
            >
              {loading
                ? (projectToEdit ? "Enregistrement..." : "Publication...")
                : (projectToEdit ? "Enregistrer les modifications" : "Publier le projet")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
