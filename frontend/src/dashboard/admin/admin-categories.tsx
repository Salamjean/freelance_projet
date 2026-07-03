import React, { useEffect, useState } from 'react';
import { Tags, Plus, Edit2, Trash2, X } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

interface SubCategory {
  id: number;
  name: string;
  slug: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  subCategories: SubCategory[];
  _count: {
    projects: number;
  };
}

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://192.168.1.18:3000/api/admin/categories');
      setCategories(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des catégories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = () => {
    Swal.fire({
      title: 'Nouvelle catégorie',
      html: `
        <input id="cat-name" class="swal2-input" placeholder="Nom de la catégorie">
        <input id="cat-slug" class="swal2-input" placeholder="Slug (ex: dev-web)">
      `,
      showCancelButton: true,
      confirmButtonText: 'Créer',
      cancelButtonText: 'Annuler',
      preConfirm: () => {
        const name = (document.getElementById('cat-name') as HTMLInputElement).value;
        const slug = (document.getElementById('cat-slug') as HTMLInputElement).value;
        if (!name || !slug) Swal.showValidationMessage('Veuillez remplir tous les champs');
        return { name, slug };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post('http://192.168.1.18:3000/api/admin/categories', result.value);
          Swal.fire('Succès', 'Catégorie créée !', 'success');
          fetchCategories();
        } catch (error) {
          Swal.fire('Erreur', 'Impossible de créer la catégorie.', 'error');
        }
      }
    });
  };

  const handleEdit = (category: Category) => {
    Swal.fire({
      title: 'Modifier la catégorie',
      html: `
        <input id="cat-name" class="swal2-input" value="${category.name}" placeholder="Nom de la catégorie">
        <input id="cat-slug" class="swal2-input" value="${category.slug}" placeholder="Slug">
      `,
      showCancelButton: true,
      confirmButtonText: 'Enregistrer',
      cancelButtonText: 'Annuler',
      preConfirm: () => {
        const name = (document.getElementById('cat-name') as HTMLInputElement).value;
        const slug = (document.getElementById('cat-slug') as HTMLInputElement).value;
        if (!name || !slug) Swal.showValidationMessage('Veuillez remplir tous les champs');
        return { name, slug };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.put(`http://192.168.1.18:3000/api/admin/categories/${category.id}`, result.value);
          Swal.fire('Succès', 'Catégorie modifiée !', 'success');
          fetchCategories();
        } catch (error) {
          Swal.fire('Erreur', 'Impossible de modifier la catégorie.', 'error');
        }
      }
    });
  };

  const handleAddSubCategory = (categoryId: number) => {
    Swal.fire({
      title: 'Ajouter une sous-catégorie',
      html: `
        <input id="sub-name" class="swal2-input" placeholder="Nom (ex: Frontend)">
        <input id="sub-slug" class="swal2-input" placeholder="Slug (ex: frontend)">
      `,
      showCancelButton: true,
      confirmButtonText: 'Ajouter',
      cancelButtonText: 'Annuler',
      preConfirm: () => {
        const name = (document.getElementById('sub-name') as HTMLInputElement).value;
        const slug = (document.getElementById('sub-slug') as HTMLInputElement).value;
        if (!name || !slug) Swal.showValidationMessage('Veuillez remplir tous les champs');
        return { name, slug };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post(`http://192.168.1.18:3000/api/admin/categories/${categoryId}/subcategories`, result.value);
          Swal.fire({ title: 'Succès', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
          fetchCategories();
        } catch (error) {
          Swal.fire('Erreur', "Impossible d'ajouter la sous-catégorie.", 'error');
        }
      }
    });
  };

  const handleRemoveSubCategory = (subId: number) => {
    Swal.fire({
      title: 'Supprimer cette sous-catégorie ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://192.168.1.18:3000/api/admin/subcategories/${subId}`);
          Swal.fire({ title: 'Supprimée', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
          fetchCategories();
        } catch (error) {
          Swal.fire('Erreur', 'Impossible de supprimer la sous-catégorie.', 'error');
        }
      }
    });
  };

  const handleDelete = (id: number, projectsCount: number) => {
    if (projectsCount > 0) {
      Swal.fire('Attention', 'Impossible de supprimer une catégorie qui contient des projets.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Cette suppression est irréversible.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://192.168.1.18:3000/api/admin/categories/${id}`);
          Swal.fire('Supprimé !', 'La catégorie a été supprimée.', 'success');
          fetchCategories();
        } catch (error) {
          Swal.fire('Erreur', 'Impossible de supprimer la catégorie.', 'error');
        }
      }
    });
  };

  return (
    <div className="admin-dashboard-page">
      <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Gestion des Catégories</h1>
          <p className="page-subtitle">Ajoutez, modifiez ou supprimez les catégories de projets</p>
        </div>
        <button 
          onClick={handleCreate}
          style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}
        >
          <Plus size={18} />
          Nouvelle Catégorie
        </button>
      </div>

      <div className="card list-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Chargement des catégories...</div>
        ) : (
          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'center' }}>Nom de la catégorie</th>
                  <th style={{ textAlign: 'center' }}>Slug</th>
                  <th style={{ textAlign: 'center' }}>Sous-catégories</th>
                  <th style={{ textAlign: 'center' }}>Projets associés</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td style={{ fontWeight: 600, color: '#111827', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Tags size={16} color="#6b7280" />
                        {category.name}
                      </div>
                    </td>
                    <td style={{ color: '#4b5563', textAlign: 'center' }}>{category.slug}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px' }}>
                        {category.subCategories.map(sub => (
                          <div key={sub.id} style={{ display: 'flex', alignItems: 'center', background: '#f3f4f6', border: '1px solid #e5e7eb', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 500, color: '#4b5563' }}>
                            {sub.name}
                            <X 
                              size={12} 
                              style={{ marginLeft: '4px', cursor: 'pointer', color: '#9ca3af' }} 
                              onClick={() => handleRemoveSubCategory(sub.id)}
                            />
                          </div>
                        ))}
                        <button 
                          onClick={() => handleAddSubCategory(category.id)}
                          style={{ background: 'transparent', border: '1px dashed #d1d5db', color: '#6b7280', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Plus size={12} />
                          Ajouter
                        </button>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: category._count.projects > 0 ? '#eff6ff' : '#f3f4f6', color: category._count.projects > 0 ? '#2563eb' : '#6b7280', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 500 }}>
                        {category._count.projects} projets
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button 
                          onClick={() => handleEdit(category)}
                          style={{ background: '#f3f4f6', color: '#4b5563', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                          title="Modifier"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(category.id, category._count.projects)}
                          style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', opacity: category._count.projects > 0 ? 0.5 : 1 }}
                          title="Supprimer"
                          disabled={category._count.projects > 0}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
                      Aucune catégorie trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
